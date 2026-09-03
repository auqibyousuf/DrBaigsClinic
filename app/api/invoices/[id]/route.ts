import { NextRequest, NextResponse } from 'next/server';
import {
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  uploadInvoicePdf,
  setInvoicePdfUrl,
} from '@/lib/invoices';
import { getPatientById } from '@/lib/patients';
import { generateInvoicePdf } from '@/lib/invoice-pdf';
import { getCMSData } from '@/lib/cms';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invoice = await getInvoiceById(params.id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, doctorId, lineItems, extraDiscountType, extraDiscountValue, payments, notes } = body;

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 });
    }

    const invoice = await updateInvoice(params.id, {
      patient_id: patientId,
      doctor_id: doctorId,
      line_items: lineItems,
      extra_discount_type: extraDiscountType,
      extra_discount_value: extraDiscountValue,
      payments,
      notes,
    });

    const patient = await getPatientById(invoice.patient_id);
    if (patient) {
      const cmsData = await getCMSData();
      const doctor = cmsData.doctors?.items?.find((d) => d.id === invoice.doctor_id);
      const pdfBytes = await generateInvoicePdf(invoice, patient, { name: doctor?.name || 'Doctor' });
      const pdfUrl = await uploadInvoicePdf(invoice.id, pdfBytes);
      await setInvoicePdfUrl(invoice.id, pdfUrl);
      invoice.pdf_url = pdfUrl;
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteInvoice(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
