import { NextRequest, NextResponse } from 'next/server';
import { updatePatient, deletePatient } from '@/lib/patients';

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

  const STRING_FIELDS = [
    'name',
    'phone',
    'email',
    'date_of_birth',
    'gender',
    'blood_group',
    'marital_status',
    'occupation',
    'address_street',
    'address_city',
    'address_state',
    'address_pincode',
    'photo_url',
    'reference_id',
    'aadhaar_number',
  ] as const;

  try {
    const body = await request.json();
    const updates: Record<string, string> = {};
    for (const field of STRING_FIELDS) {
      if (typeof body[field] === 'string') updates[field] = body[field].trim();
    }

    const patient = await updatePatient(params.id, updates);
    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update patient' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deletePatient(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete patient error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
