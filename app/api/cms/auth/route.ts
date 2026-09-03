import { NextRequest, NextResponse } from 'next/server';
import { checkLoginLockout, getClientIp, recordFailedLogin } from '@/lib/login-attempts';

async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  // Not configured — nothing to verify against, so don't block login on it
  // (matches the client, which doesn't render the widget either in that case).
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    const result = await res.json();
    return result.success === true;
  } catch (err) {
    console.error('reCAPTCHA verification request failed:', err);
    return false;
  }
}

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
    const { username, password, recaptchaToken } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
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

    const recaptchaOk = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaOk) {
      await recordFailedLogin(ip);
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Simple credential check (in production, use proper authentication)
    const correctUsername = process.env.CMS_USERNAME || 'admin';
    const correctPassword = process.env.CMS_PASSWORD || 'admin123';
    const authToken = process.env.CMS_AUTH_TOKEN || 'dev-token';

    if (username === correctUsername && password === correctPassword) {
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
      { error: 'Invalid username or password' },
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
