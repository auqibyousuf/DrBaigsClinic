import { NextRequest, NextResponse } from 'next/server';
import { listAllAppointments } from '@/lib/appointments';
import { getPrescriptionByAppointmentId } from '@/lib/prescriptions';

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
    const appointments = await listAllAppointments();

    const appointmentsWithPrescriptions = await Promise.all(
      appointments.map(async (appt) => {
        const prescription = await getPrescriptionByAppointmentId(appt.id);
        return {
          ...appt,
          prescription: prescription
            ? {
                id: prescription.id,
                diagnosis: prescription.diagnosis,
                medications: prescription.medications,
                symptoms: prescription.symptoms,
                examinations: prescription.examinations,
                investigations: prescription.investigations,
                advices: prescription.advices,
                vitals: prescription.vitals,
                follow_up_date: prescription.follow_up_date,
                additional_notes: prescription.additional_notes,
                private_notes: prescription.private_notes,
                notes: prescription.notes,
                pdfUrl: prescription.pdf_url,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ appointments: appointmentsWithPrescriptions });
  } catch (error) {
    console.error('List appointments error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list appointments' },
      { status: 500 }
    );
  }
}
