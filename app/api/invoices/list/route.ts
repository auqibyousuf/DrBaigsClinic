import { NextRequest, NextResponse } from 'next/server';
import { listAllInvoices } from '@/lib/invoices';
import { getPatientById } from '@/lib/patients';
import { getCMSData } from '@/lib/cms';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

// Enriched invoice list for the top-level Billing tab — mirrors
// /api/prescriptions/list's join pattern (invoices only store IDs).
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [invoices, cmsData] = await Promise.all([listAllInvoices(), getCMSData()]);
    const doctors = cmsData.doctors?.items || [];

    const enriched = await Promise.all(
      invoices.map(async (inv) => {
        const patient = await getPatientById(inv.patient_id);
        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          billDate: inv.bill_date,
          appointmentId: inv.appointment_id,
          patientId: inv.patient_id,
          doctorId: inv.doctor_id,
          doctorName: doctors.find((d) => d.id === inv.doctor_id)?.name || 'Unknown',
          patientName: patient?.name || 'Unknown',
          patientCode: patient?.patient_code || null,
          patientPhone: patient?.phone || null,
          totalPayable: inv.total_payable,
          paidAmount: inv.paid_amount,
          pdfUrl: inv.pdf_url,
        };
      })
    );

    return NextResponse.json({ invoices: enriched });
  } catch (error) {
    console.error('List invoices error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list invoices' },
      { status: 500 }
    );
  }
}
