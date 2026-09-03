import { NextRequest, NextResponse } from 'next/server';
import { getPatientById } from '@/lib/patients';
import { getAppointmentsForPatient } from '@/lib/appointments';
import { getPrescriptionByAppointmentId } from '@/lib/prescriptions';
import { listInvoicesForPatient } from '@/lib/invoices';
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
    const patient = await getPatientById(params.id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const [visits, invoices, cmsData] = await Promise.all([
      getAppointmentsForPatient(patient.id),
      listInvoicesForPatient(patient.id),
      getCMSData(),
    ]);
    const doctors = cmsData.doctors?.items || [];

    const visitsWithPrescriptions = await Promise.all(
      visits.map(async (v) => {
        const prescription = await getPrescriptionByAppointmentId(v.id);
        return {
          id: v.id,
          date: v.appointment_date,
          slot: v.slot_start,
          status: v.status,
          reason: v.reason,
          doctorName: doctors.find((d) => d.id === v.doctor_id)?.name || 'Unknown',
          prescription: prescription
            ? {
                id: prescription.id,
                diagnosis: prescription.diagnosis,
                symptoms: prescription.symptoms,
                medications: prescription.medications,
                investigations: prescription.investigations,
                advices: prescription.advices,
                followUpDate: prescription.follow_up_date,
                createdAt: prescription.created_at,
                pdfUrl: prescription.pdf_url,
              }
            : null,
        };
      })
    );

    const billing = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      billDate: inv.bill_date,
      totalPayable: inv.total_payable,
      paidAmount: inv.paid_amount,
      pdfUrl: inv.pdf_url,
    }));

    return NextResponse.json({ patient, visits: visitsWithPrescriptions, billing });
  } catch (error) {
    console.error('Patient history error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch patient history' },
      { status: 500 }
    );
  }
}
