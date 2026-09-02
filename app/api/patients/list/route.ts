import { NextRequest, NextResponse } from 'next/server';
import { listPatients } from '@/lib/patients';

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
    return NextResponse.json({ patients });
  } catch (error) {
    console.error('List patients error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list patients' },
      { status: 500 }
    );
  }
}
