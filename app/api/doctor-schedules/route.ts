import { NextRequest, NextResponse } from 'next/server';
import { listAllSchedules, listSchedulesForDoctor, createSchedule } from '@/lib/schedules';

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
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const schedules = doctorId ? await listSchedulesForDoctor(doctorId) : await listAllSchedules();
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('List schedules error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { doctorId, slotDurationMinutes, startTime, endTime, daysOfWeek } = body;

    if (!doctorId || !startTime || !endTime || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return NextResponse.json(
        { error: 'doctorId, startTime, endTime and at least one day of week are required' },
        { status: 400 }
      );
    }
    if (endTime <= startTime) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    const schedule = await createSchedule({
      doctor_id: doctorId,
      slot_duration_minutes: slotDurationMinutes || 30,
      start_time: startTime,
      end_time: endTime,
      days_of_week: daysOfWeek,
    });
    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create schedule' },
      { status: 500 }
    );
  }
}
