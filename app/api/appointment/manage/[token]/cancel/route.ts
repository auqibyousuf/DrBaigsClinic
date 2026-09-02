import { NextRequest, NextResponse } from 'next/server';
import { cancelAppointment, getAppointmentByToken, isPastPatientCutoff } from '@/lib/appointments';
import { getCMSData } from '@/lib/cms';
import { sendUpdateNotification } from '@/lib/notifications';

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const appointment = await getAppointmentByToken(params.token);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    if (appointment.status !== 'confirmed') {
      return NextResponse.json({ error: 'This appointment is already cancelled' }, { status: 400 });
    }
    // Re-validate the cutoff server-side — the UI hiding the button is a courtesy, not the guard.
    if (isPastPatientCutoff(appointment)) {
      return NextResponse.json(
        {
          error:
            'Online changes close 4 hours before your visit. Please call the clinic directly to cancel.',
        },
        { status: 403 }
      );
    }

    const updated = await cancelAppointment(appointment.id);

    const cmsData = await getCMSData();
    const doctor = cmsData.doctors?.items?.find((d) => d.id === appointment.doctor_id);
    const message = `Your appointment with ${doctor?.name || 'your doctor'} on ${appointment.appointment_date} at ${appointment.slot_start} has been cancelled.`;

    await Promise.all([
      sendUpdateNotification(appointment.patient_phone, message),
      doctor?.phone ? sendUpdateNotification(doctor.phone, `Cancelled: ${message}`) : Promise.resolve(),
      cmsData.contact?.notificationPhone
        ? sendUpdateNotification(cmsData.contact.notificationPhone, `Cancelled: ${message}`)
        : Promise.resolve(),
    ]);

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
