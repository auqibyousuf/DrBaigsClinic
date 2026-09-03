-- Recurring weekly availability per doctor — replaces the single flat
-- "same slots every day" list (bookingSettings.slots in the CMS blob) with
-- real per-doctor, per-weekday schedules, matching how clinics actually
-- operate (e.g. half-day Saturdays, doctor off on Wednesdays).
-- Run this once in the Supabase SQL editor, or via `yarn db:migrate`.

create table if not exists doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id text not null,
  slot_duration_minutes int not null default 30 check (slot_duration_minutes > 0),
  start_time text not null, -- "HH:MM", 24h
  end_time text not null,   -- "HH:MM", 24h, exclusive upper bound
  days_of_week int[] not null default '{}', -- 0=Sun .. 6=Sat
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint doctor_schedules_time_order check (end_time > start_time)
);

create index if not exists doctor_schedules_doctor_idx on doctor_schedules (doctor_id);

alter table doctor_schedules enable row level security;

drop policy if exists "Allow all on doctor_schedules" on doctor_schedules;
create policy "Allow all on doctor_schedules" on doctor_schedules
  for all using (true) with check (true);

drop trigger if exists doctor_schedules_set_updated_at on doctor_schedules;
create trigger doctor_schedules_set_updated_at
  before update on doctor_schedules
  for each row execute function set_updated_at();
