import { NextRequest, NextResponse } from 'next/server';
import { cancelAppointment, getAppointmentById } from '@/lib/appointments';
import { getCMSData } from '@/lib/cms';
import { sendUpdateNotification } from '@/lib/notifications';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const appointment = await getAppointmentById(params.id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Admin has no time cutoff, unlike the patient self-service flow.
    const updated = await cancelAppointment(appointment.id);

    const cmsData = await getCMSData();
    const doctor = cmsData.doctors?.items?.find((d) => d.id === appointment.doctor_id);
    const message = `Your appointment with ${doctor?.name || 'your doctor'} on ${appointment.appointment_date} at ${appointment.slot_start} has been cancelled by the clinic.`;

    await sendUpdateNotification(appointment.patient_phone, message);

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Admin cancel appointment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
