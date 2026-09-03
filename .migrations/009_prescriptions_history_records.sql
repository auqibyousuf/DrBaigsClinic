-- Adds the last 2 of Medisray's 4 optional Digital-Rx modules — Medical
-- History (free text) and Medical Records (uploaded documents/images) —
-- alongside the existing Vitals & Private Notes modules.

alter table prescriptions add column if not exists medical_history text;
alter table prescriptions add column if not exists medical_records jsonb not null default '[]';
