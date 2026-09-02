import { NextRequest, NextResponse } from 'next/server';
import { listAppointmentsForDate } from '@/lib/appointments';
import { getCMSData } from '@/lib/cms';
import { sendDailyDigest } from '@/lib/notifications';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  return header === `Bearer ${secret}` || searchParams.get('secret') === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const appointments = await listAppointmentsForDate(today);

    if (appointments.length === 0) {
      return NextResponse.json({ success: true, message: 'No appointments today, no digest sent.' });
    }

    const cmsData = await getCMSData();
    const doctors = cmsData.doctors?.items || [];

    const byDoctor = new Map<string, typeof appointments>();
    for (const appt of appointments) {
      const list = byDoctor.get(appt.doctor_id) || [];
      list.push(appt);
      byDoctor.set(appt.doctor_id, list);
    }

    const sends: Promise<void>[] = [];

    Array.from(byDoctor.entries()).forEach(([doctorId, doctorAppointments]) => {
      const doctor = doctors.find((d) => d.id === doctorId);
      if (!doctor?.phone) return;
      const lines = doctorAppointments.map(
        (a) => `${a.slot_start} - ${a.patient_name} (${a.reason})`
      );
      sends.push(sendDailyDigest(doctor.phone, lines));
    });

    if (cmsData.contact?.notificationPhone) {
      const allLines = appointments.map((a) => {
        const doctor = doctors.find((d) => d.id === a.doctor_id);
        return `${a.slot_start} - ${a.patient_name} with ${doctor?.name || 'Unknown'} (${a.reason})`;
      });
      sends.push(sendDailyDigest(cmsData.contact.notificationPhone, allLines));
    }

    await Promise.all(sends);

    return NextResponse.json({ success: true, doctorsNotified: byDoctor.size, total: appointments.length });
  } catch (error) {
    console.error('Daily digest cron error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send daily digest' },
      { status: 500 }
    );
  }
}
