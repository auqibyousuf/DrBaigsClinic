-- Richer patient profile fields, matching Medisray's Add Patient form
-- (MEDISRAY_AUDIT.md finding #4). All optional except name/phone, so the
-- fast-booking flow never breaks.
-- Run this once in the Supabase SQL editor, or via `yarn db:migrate`.

alter table patients add column if not exists date_of_birth date;
alter table patients add column if not exists gender text;
alter table patients add column if not exists blood_group text;
alter table patients add column if not exists marital_status text;
alter table patients add column if not exists occupation text;
alter table patients add column if not exists address_street text;
alter table patients add column if not exists address_city text;
alter table patients add column if not exists address_state text;
alter table patients add column if not exists address_pincode text;
alter table patients add column if not exists photo_url text;
-- A clinic-assigned free-text ID, distinct from the auto-generated patient_code.
alter table patients add column if not exists reference_id text;
-- Government ID capture, included per explicit product decision to match
-- Medisray's field set for client migration parity. Sensitive PII — not
-- encrypted at rest in this pass; revisit if this app starts handling this
-- at real scale (access logging, encryption, retention policy).
alter table patients add column if not exists aadhaar_number text;
