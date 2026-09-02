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

  try {
    const body = await request.json();
    const updates: { name?: string; phone?: string; email?: string } = {};
    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.phone === 'string' && body.phone.trim()) updates.phone = body.phone.trim();
    if (typeof body.email === 'string') updates.email = body.email.trim();

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
