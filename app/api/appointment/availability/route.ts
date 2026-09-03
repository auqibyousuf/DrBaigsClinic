import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentsForDate, isDateBookable } from '@/lib/appointments';
import { listSchedulesForDoctor, expandSlotsForDate } from '@/lib/schedules';
import { getCMSData } from '@/lib/cms';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const doctorId = searchParams.get('doctorId');

    if (!date || !doctorId) {
      return NextResponse.json({ error: 'date and doctorId are required' }, { status: 400 });
    }

    const cmsData = await getCMSData();
    if (!isDateBookable(date, cmsData.bookingSettings)) {
      return NextResponse.json({ closed: true, slots: [] });
    }

    const [booked, schedules] = await Promise.all([
      getAppointmentsForDate(date, doctorId),
      listSchedulesForDoctor(doctorId),
    ]);
    const bookedSlots = new Set(booked.map((a) => a.slot_start));

    // Recurring per-doctor weekly schedule wins when configured; falls back
    // to the flat CMS slot list otherwise (see MEDISRAY_AUDIT.md finding #5).
    const configuredSlots = expandSlotsForDate(schedules, date, cmsData.bookingSettings);
    if (configuredSlots.length === 0) {
      return NextResponse.json({ closed: true, slots: [] });
    }

    const slots = configuredSlots.map((slot) => ({
      slot,
      taken: bookedSlots.has(slot),
    }));

    return NextResponse.json({ closed: false, slots });
  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
