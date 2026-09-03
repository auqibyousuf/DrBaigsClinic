import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase's free tier auto-pauses a project after 7 days with no API
// activity — once paused, the project is fully offline (no query reaches
// it, including from this app itself), so "ping it when the site loads"
// can't work: a paused project can't respond to anything, the app-open
// request never gets there in the first place. The only real fix is
// making sure it never goes 7 days without activity — a daily ping, well
// under that window, does that. See vercel.json for the cron schedule.
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  return header === `Bearer ${secret}` || searchParams.get('secret') === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }

  try {
    const supabase = createClient(url, key, {
      global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
    });
    // Any real query counts as activity — this one is intentionally trivial.
    const { error } = await supabase.from('cms_data').select('id').limit(1);
    if (error) throw error;

    return NextResponse.json({ success: true, pingedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Supabase keep-alive ping failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Keep-alive ping failed' },
      { status: 500 }
    );
  }
}
