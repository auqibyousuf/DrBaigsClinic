-- Patients + prescriptions, on top of SUPABASE_APPOINTMENTS_SCHEMA.sql.
-- Run this once in the Supabase SQL editor, after the appointments schema.

create extension if not exists "pgcrypto";

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  patient_code text not null unique,
  name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);

create index if not exists patients_phone_idx on patients (phone);

alter table appointments add column if not exists patient_id uuid references patients(id);
create index if not exists appointments_patient_id_idx on appointments (patient_id);

create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id),
  patient_id uuid not null references patients(id),
  doctor_id text not null,
  diagnosis text,
  medications jsonb not null default '[]',
  notes text,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists prescriptions_appointment_id_unique on prescriptions (appointment_id);
create index if not exists prescriptions_patient_id_idx on prescriptions (patient_id);

alter table patients enable row level security;
alter table prescriptions enable row level security;

-- Consistent with the rest of this project's tables — the anon key used server-side
-- is never exposed to the browser, so "allow all" carries no extra client exposure.
drop policy if exists "Allow all on patients" on patients;
create policy "Allow all on patients" on patients for all using (true) with check (true);

drop policy if exists "Allow all on prescriptions" on prescriptions;
create policy "Allow all on prescriptions" on prescriptions for all using (true) with check (true);

drop trigger if exists prescriptions_set_updated_at on prescriptions;
create trigger prescriptions_set_updated_at
  before update on prescriptions
  for each row execute function set_updated_at();

-- Public storage bucket for generated prescription PDFs (needed so Twilio can
-- fetch the file as WhatsApp media, and so patients can download directly).
insert into storage.buckets (id, name, public)
values ('prescriptions', 'prescriptions', true)
on conflict (id) do nothing;

drop policy if exists "Public read prescriptions bucket" on storage.objects;
create policy "Public read prescriptions bucket" on storage.objects
  for select using (bucket_id = 'prescriptions');

drop policy if exists "Allow inserts to prescriptions bucket" on storage.objects;
create policy "Allow inserts to prescriptions bucket" on storage.objects
  for insert with check (bucket_id = 'prescriptions');

drop policy if exists "Allow updates to prescriptions bucket" on storage.objects;
create policy "Allow updates to prescriptions bucket" on storage.objects
  for update using (bucket_id = 'prescriptions');
