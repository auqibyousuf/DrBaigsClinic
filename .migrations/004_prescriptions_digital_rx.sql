-- Extends prescriptions with the modular consultation sections from the
-- Medisray audit (MEDISRAY_AUDIT.md, finding #2): symptoms, examinations,
-- diagnosis-as-structured-list, investigations, advices, vitals, and
-- follow-up scheduling — on top of the existing medications/diagnosis/notes.
-- Run this once in the Supabase SQL editor, or via `yarn db:migrate`.

alter table prescriptions add column if not exists symptoms jsonb not null default '[]';
alter table prescriptions add column if not exists examinations jsonb not null default '[]';
alter table prescriptions add column if not exists investigations jsonb not null default '[]';
alter table prescriptions add column if not exists advices jsonb not null default '[]';
alter table prescriptions add column if not exists vitals jsonb not null default '[]';
alter table prescriptions add column if not exists follow_up_date date;
alter table prescriptions add column if not exists additional_notes text;
-- Doctor-only, never rendered into the patient-facing PDF.
alter table prescriptions add column if not exists private_notes text;

-- Backing store for the autocomplete suggestions on Symptoms/Diagnosis/
-- Examinations/Investigation/Advices/Medications — starts with a small
-- curated seed per category (below) and grows from "Add Custom" entries.
create table if not exists clinical_terms (
  id uuid primary key default gen_random_uuid(),
  doctor_id text,
  category text not null check (
    category in ('symptom', 'examination', 'diagnosis', 'medication', 'investigation', 'advice')
  ),
  value text not null,
  is_preset boolean not null default false,
  use_count int not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists clinical_terms_unique
  on clinical_terms (coalesce(doctor_id, ''), category, lower(value));
create index if not exists clinical_terms_category_idx on clinical_terms (category);

alter table clinical_terms enable row level security;

drop policy if exists "Allow all on clinical_terms" on clinical_terms;
create policy "Allow all on clinical_terms" on clinical_terms for all using (true) with check (true);

-- A small starter set so the pickers aren't empty on day one — doctor_id is
-- null (clinic-wide presets), same as Medisray's built-in suggestions.
insert into clinical_terms (category, value, is_preset) values
  ('symptom', 'Fever', true),
  ('symptom', 'Headache', true),
  ('symptom', 'Cough', true),
  ('symptom', 'Fatigue', true),
  ('symptom', 'Nausea', true),
  ('diagnosis', 'Common Cold', true),
  ('diagnosis', 'Viral Fever', true),
  ('diagnosis', 'Allergic Rhinitis', true),
  ('examination', 'Throat Congestion', true),
  ('examination', 'Chest Clear', true),
  ('investigation', 'Complete Blood Count (CBC)', true),
  ('investigation', 'Blood Sugar (Random)', true),
  ('advice', 'Drink plenty of fluids', true),
  ('advice', 'Rest for 2-3 days', true),
  ('advice', 'Follow up if symptoms persist', true)
on conflict do nothing;
