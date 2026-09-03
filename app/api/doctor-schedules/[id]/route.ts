import { NextRequest, NextResponse } from 'next/server';
import { updateSchedule, deleteSchedule } from '@/lib/schedules';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.slotDurationMinutes !== undefined) updates.slot_duration_minutes = body.slotDurationMinutes;
    if (body.startTime !== undefined) updates.start_time = body.startTime;
    if (body.endTime !== undefined) updates.end_time = body.endTime;
    if (body.daysOfWeek !== undefined) updates.days_of_week = body.daysOfWeek;

    const schedule = await updateSchedule(params.id, updates);
    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteSchedule(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
