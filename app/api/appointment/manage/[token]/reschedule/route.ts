import { NextRequest, NextResponse } from 'next/server';
import {
  getAppointmentByToken,
  isDateBookable,
  isPastPatientCutoff,
  rescheduleAppointment,
  SlotTakenError,
  getConfiguredSlots,
} from '@/lib/appointments';
import { getCMSData } from '@/lib/cms';
import { sendUpdateNotification } from '@/lib/notifications';

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { date, slot } = await request.json();
    const cmsData = await getCMSData();
    if (!date || !slot || !getConfiguredSlots(cmsData.bookingSettings).includes(slot)) {
      return NextResponse.json({ error: 'A valid date and slot are required' }, { status: 400 });
    }

    const appointment = await getAppointmentByToken(params.token);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    if (appointment.status !== 'confirmed') {
      return NextResponse.json({ error: 'This appointment is cancelled' }, { status: 400 });
    }
    if (isPastPatientCutoff(appointment)) {
      return NextResponse.json(
        {
          error:
            'Online changes close 4 hours before your visit. Please call the clinic directly to reschedule.',
        },
        { status: 403 }
      );
    }

    if (!isDateBookable(date, cmsData.bookingSettings)) {
      return NextResponse.json({ error: 'That date is not available for booking' }, { status: 400 });
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

    const doctor = cmsData.doctors?.items?.find((d) => d.id === appointment.doctor_id);
    const message = `Your appointment with ${doctor?.name || 'your doctor'} has been moved to ${date} at ${slot}.`;

    await Promise.all([
      sendUpdateNotification(appointment.patient_phone, message),
      doctor?.phone ? sendUpdateNotification(doctor.phone, `Rescheduled: ${message}`) : Promise.resolve(),
      cmsData.contact?.notificationPhone
        ? sendUpdateNotification(cmsData.contact.notificationPhone, `Rescheduled: ${message}`)
        : Promise.resolve(),
    ]);

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reschedule appointment' },
      { status: 500 }
    );
  }
}
