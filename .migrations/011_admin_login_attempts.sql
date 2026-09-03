-- Backs brute-force protection on the single-shared-password admin login
-- (app/api/cms/auth/route.ts) — previously unlimited attempts, no lockout,
-- and the password was even being logged to server console on every try.
-- A plain in-memory counter wouldn't reliably survive across serverless
-- function instances, so failed attempts are tracked here per IP instead.
-- Run this once in the Supabase SQL editor, or via `yarn db:migrate`.

create table if not exists admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_ip_time_idx
  on admin_login_attempts (ip, attempted_at desc);

alter table admin_login_attempts enable row level security;

create policy "Allow all on admin_login_attempts"
  on admin_login_attempts for all
  using (true)
  with check (true);
