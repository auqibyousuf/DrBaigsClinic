-- Appointments table for the booking system (separate from the cms_data JSON blob).
-- Run this once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  patient_phone text not null,
  patient_email text not null,
  reason text not null,
  service_id text,
  doctor_id text not null,
  appointment_date date not null,
  slot_start text not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  manage_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Two different doctors can hold the same date+slot; the same doctor cannot double-book.
create unique index if not exists appointments_doctor_slot_unique
  on appointments (doctor_id, appointment_date, slot_start)
  where status = 'confirmed';

create index if not exists appointments_date_idx on appointments (appointment_date);
create index if not exists appointments_manage_token_idx on appointments (manage_token);

alter table appointments enable row level security;

-- Consistent with the rest of this project's tables: the anon key used here is
-- server-only (never exposed to the browser), so an "allow all" policy carries
-- no extra client-side exposure.
drop policy if exists "Allow all on appointments" on appointments;
create policy "Allow all on appointments" on appointments
  for all using (true) with check (true);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at
  before update on appointments
  for each row execute function set_updated_at();
