import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointmentDetails, deleteAppointment } from '@/lib/appointments';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

// Edits the patient-facing details captured on this specific visit (name/phone/
// email/reason). Does not change the patient's shared record — see note in
// the admin UI: this is a per-visit correction, not a profile update.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patient_name, patient_phone, patient_email, reason } = body;

    const existing = await getAppointmentById(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const updates: Record<string, string> = {};
    if (typeof patient_name === 'string' && patient_name.trim()) updates.patient_name = patient_name.trim();
    if (typeof patient_phone === 'string' && patient_phone.trim()) updates.patient_phone = patient_phone.trim();
    if (typeof patient_email === 'string') updates.patient_email = patient_email.trim();
    if (typeof reason === 'string' && reason.trim()) updates.reason = reason.trim();

    const updated = await updateAppointmentDetails(params.id, updates);

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Update appointment details error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// Hard delete (distinct from cancel, which just flips status). Removes the
// appointment and any prescription written for it.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await getAppointmentById(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    await deleteAppointment(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
