import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, rescheduleAppointment, SlotTakenError, getConfiguredSlots } from '@/lib/appointments';
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
    const { date, slot } = await request.json();
    const cmsDataForValidation = await getCMSData();
    if (!date || !slot || !getConfiguredSlots(cmsDataForValidation.bookingSettings).includes(slot)) {
      return NextResponse.json({ error: 'A valid date and slot are required' }, { status: 400 });
    }

    const appointment = await getAppointmentById(params.id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    let updated;
    try {
      updated = await rescheduleAppointment(appointment.id, date, slot);
    } catch (err) {
      if (err instanceof SlotTakenError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }

    const doctor = cmsDataForValidation.doctors?.items?.find((d) => d.id === appointment.doctor_id);
    const message = `Your appointment with ${doctor?.name || 'your doctor'} has been moved to ${date} at ${slot} by the clinic.`;

    await sendUpdateNotification(appointment.patient_phone, message);

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Admin reschedule appointment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reschedule appointment' },
      { status: 500 }
    );
  }
}
