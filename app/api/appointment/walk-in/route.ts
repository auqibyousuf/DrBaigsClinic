import { NextRequest, NextResponse } from 'next/server';
import { createWalkIn } from '@/lib/appointments';
import { getPatientById } from '@/lib/patients';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

// "Start Walk-in Consultation" (MEDISRAY_AUDIT.md finding #1) — search or
// create a patient first (see /api/patients and /api/patients/lookup), then
// this creates-and-enters a same-day appointment in one motion, no slot
// picking, no availability check.
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { patientId, doctorId, reason } = await request.json();
    if (!patientId || !doctorId) {
      return NextResponse.json({ error: 'patientId and doctorId are required' }, { status: 400 });
    }

    const patient = await getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const appointment = await createWalkIn({
      patient_name: patient.name,
      patient_phone: patient.phone,
      patient_email: patient.email || '',
      patient_id: patient.id,
      doctor_id: doctorId,
      reason,
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Start walk-in error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start walk-in consultation' },
      { status: 500 }
    );
  }
}
