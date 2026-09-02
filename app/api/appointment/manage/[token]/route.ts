import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentByToken, isPastPatientCutoff } from '@/lib/appointments';
import { getCMSData } from '@/lib/cms';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const appointment = await getAppointmentByToken(params.token);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const cmsData = await getCMSData();
    const doctor = cmsData.doctors?.items?.find((d) => d.id === appointment.doctor_id);

    return NextResponse.json({
      appointment,
      doctorName: doctor?.name || 'your doctor',
      canManage: appointment.status === 'confirmed' && !isPastPatientCutoff(appointment),
    });
  } catch (error) {
    console.error('Manage appointment lookup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load appointment' },
      { status: 500 }
    );
  }
}
