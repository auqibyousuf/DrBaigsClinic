import { NextRequest, NextResponse } from 'next/server';
import {
  createInvoice,
  listAllInvoices,
  listInvoicesForAppointment,
  uploadInvoicePdf,
  setInvoicePdfUrl,
} from '@/lib/invoices';
import { getPatientById } from '@/lib/patients';
import { generateInvoicePdf } from '@/lib/invoice-pdf';
import { getCMSData } from '@/lib/cms';
import { sendInvoiceReady } from '@/lib/notifications';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    const invoices = appointmentId
      ? await listInvoicesForAppointment(appointmentId)
      : await listAllInvoices();
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('List invoices error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { appointmentId, patientId, doctorId, billDate, lineItems, extraDiscountType, extraDiscountValue, payments, notes } =
      body;

    if (!patientId || !doctorId || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'patientId, doctorId and at least one line item are required' },
        { status: 400 }
      );
    }

    const invoice = await createInvoice({
      appointment_id: appointmentId,
      patient_id: patientId,
      doctor_id: doctorId,
      bill_date: billDate,
      line_items: lineItems,
      extra_discount_type: extraDiscountType,
      extra_discount_value: extraDiscountValue,
      payments,
      notes,
    });

    const patient = await getPatientById(patientId);
    if (patient) {
      const cmsData = await getCMSData();
      const doctor = cmsData.doctors?.items?.find((d) => d.id === doctorId);
      const pdfBytes = await generateInvoicePdf(invoice, patient, { name: doctor?.name || 'Doctor' });
      const pdfUrl = await uploadInvoicePdf(invoice.id, pdfBytes);
      await setInvoicePdfUrl(invoice.id, pdfUrl);
      invoice.pdf_url = pdfUrl;

      // Billing was a real notification gap (audited alongside booking/
      // prescription/follow-up alerts) — patients previously had no way to
      // know a bill existed unless staff mentioned it in person.
      const due = invoice.total_payable - invoice.paid_amount;
      const dueLine = due > 0 ? `Amount due: Rs. ${due.toFixed(2)}.` : 'Fully paid — thank you!';
      try {
        await sendInvoiceReady(
          patient.phone,
          patient.name,
          invoice.invoice_number,
          invoice.total_payable.toFixed(2),
          dueLine,
          pdfUrl
        );
      } catch (notifyErr) {
        console.error('Invoice notification failed:', notifyErr);
      }
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
