import { NextRequest, NextResponse } from 'next/server';
import { checkLoginLockout, getClientIp, recordFailedLogin } from '@/lib/login-attempts';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const isValid = sessionToken === process.env.CMS_AUTH_TOKEN;

  if (isValid) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const lockedForMinutes = await checkLoginLockout(ip);
    if (lockedForMinutes !== null) {
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${lockedForMinutes} minutes.` },
        { status: 429 }
      );
    }

    // Simple password check (in production, use proper authentication)
    const correctPassword = process.env.CMS_PASSWORD || 'admin123';
    const authToken = process.env.CMS_AUTH_TOKEN || 'dev-token';

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true });

      // Set auth cookie (in production, use secure, httpOnly cookies)
      response.cookies.set('cms-auth', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    await recordFailedLogin(ip);
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('cms-auth');
  return response;
}
