import { createClient } from '@supabase/supabase-js';

// Brute-force protection for the single-shared-password admin login
// (app/api/cms/auth/route.ts). Tracked per-IP in Supabase rather than an
// in-memory counter, since a serverless function instance can't be relied
// on to survive between requests — an in-memory lockout would reset on
// every cold start and do nothing against a real attempt.

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_WINDOW_MINUTES = 15;

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

// Returns how many minutes the caller must wait, or null if they're clear
// to attempt a login. Fails open (returns null) if Supabase isn't
// configured — a login attempt should never be blocked by an unrelated
// outage, and rate limiting is best-effort defense-in-depth, not the only
// thing standing between an attacker and the admin panel.
export async function checkLoginLockout(ip: string): Promise<number | null> {
  const supabase = getClient();
  if (!supabase) return null;

  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from('admin_login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('attempted_at', windowStart);

  if (error || count === null) return null;
  if (count < LOCKOUT_THRESHOLD) return null;

  return LOCKOUT_WINDOW_MINUTES;
}

export async function recordFailedLogin(ip: string): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;

  try {
    await supabase.from('admin_login_attempts').insert({ ip });
    // Opportunistic cleanup so the table doesn't grow unbounded — cheap,
    // and fine to skip if it fails (best-effort, not load-bearing).
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('admin_login_attempts').delete().lt('attempted_at', cutoff);
  } catch {
    // Never let attempt-logging block the actual auth response.
  }
}
