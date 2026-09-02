import { NextRequest, NextResponse } from 'next/server';
import { deletePrescription } from '@/lib/prescriptions';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deletePrescription(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete prescription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete prescription' },
      { status: 500 }
    );
  }
}
