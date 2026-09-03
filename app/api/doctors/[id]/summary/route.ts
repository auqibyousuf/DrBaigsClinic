import { NextRequest, NextResponse } from 'next/server';
import { listAllAppointments } from '@/lib/appointments';
import { getPrescriptionByAppointmentId } from '@/lib/prescriptions';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

// Doctor detail view (MEDISRAY_AUDIT.md finding #8): consulted patients,
// upcoming appointments, cancelled appointments, and prescriptions written
// by this doctor, all in one place.
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const doctorId = params.id;
    const all = await listAllAppointments();
    const forDoctor = all.filter((a) => a.doctor_id === doctorId);

    const today = new Date().toISOString().slice(0, 10);
    const upcoming = forDoctor.filter((a) => a.status === 'confirmed' && a.appointment_date >= today);
    const finished = forDoctor.filter((a) => a.status === 'finished');
    const cancelled = forDoctor.filter((a) => a.status === 'cancelled');

    const prescriptions = await Promise.all(
      finished.map(async (a) => {
        const p = await getPrescriptionByAppointmentId(a.id);
        return p
          ? {
              id: p.id,
              patientName: a.patient_name,
              date: a.appointment_date,
              diagnosis: p.diagnosis,
              pdfUrl: p.pdf_url,
            }
          : null;
      })
    );

    const summarize = (appts: typeof forDoctor) =>
      appts.map((a) => ({
        id: a.id,
        patientName: a.patient_name,
        patientPhone: a.patient_phone,
        date: a.appointment_date,
        slot: a.slot_start,
        reason: a.reason,
      }));

    return NextResponse.json({
      upcoming: summarize(upcoming),
      consulted: summarize(finished),
      cancelled: summarize(cancelled),
      prescriptions: prescriptions.filter((p): p is NonNullable<typeof p> => p !== null),
    });
  } catch (error) {
    console.error('Doctor summary error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load doctor summary' },
      { status: 500 }
    );
  }
}
