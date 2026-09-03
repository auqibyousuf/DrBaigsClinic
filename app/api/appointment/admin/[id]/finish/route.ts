import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, finishAppointment } from '@/lib/appointments';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

// Manually marks a visit finished — normally happens automatically when a
// prescription is saved (see app/api/prescriptions/route.ts), but a doctor
// may finish a visit with no prescription needed (e.g. a follow-up chat).
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await getAppointmentById(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    const appointment = await finishAppointment(params.id);
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Finish appointment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to finish appointment' },
      { status: 500 }
    );
  }
}
