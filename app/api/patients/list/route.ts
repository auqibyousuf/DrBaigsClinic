import { NextRequest, NextResponse } from 'next/server';
import { listPatients } from '@/lib/patients';
import { getAppointmentsForPatient } from '@/lib/appointments';

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
    const patients = await listPatients();
    const today = new Date().toISOString().slice(0, 10);

    // Surfaced directly in the Patients table (not buried in the details
    // drill-down) — the admin needs to see at a glance whether a patient
    // has something upcoming, is mid-visit today, or their last visit
    // finished/was cancelled, without opening each row.
    const enriched = await Promise.all(
      patients.map(async (p) => {
        const visits = await getAppointmentsForPatient(p.id);
        // A "confirmed" appointment is a queue item until it's explicitly
        // finished/cancelled — regardless of date (see MEDISRAY_AUDIT.md
        // finding #1a, no time-gating). A confirmed visit whose date has
        // already passed is still pending action, not "no visits" — that
        // was the bug: past-dated-but-still-confirmed visits fell through
        // to the default instead of surfacing as needing attention.
        const pendingQueueVisit = visits.find((v) => v.status === 'confirmed' && v.appointment_date <= today);
        const upcoming = visits.find((v) => v.status === 'confirmed' && v.appointment_date > today);
        const mostRecent = visits[0];
        const relevantVisit = pendingQueueVisit || upcoming || mostRecent;

        let appointmentStatus = 'No Visits';
        if (pendingQueueVisit) appointmentStatus = 'In Progress';
        else if (upcoming) appointmentStatus = 'Upcoming';
        else if (mostRecent?.status === 'finished') appointmentStatus = 'Completed';
        else if (mostRecent?.status === 'cancelled') appointmentStatus = 'Cancelled';

        return { ...p, appointmentStatus, lastVisitReason: relevantVisit?.reason || null };
      })
    );

    return NextResponse.json({ patients: enriched });
  } catch (error) {
    console.error('List patients error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list patients' },
      { status: 500 }
    );
  }
}
