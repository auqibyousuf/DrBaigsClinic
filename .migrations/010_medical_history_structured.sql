-- Upgrades Medical History from a plain textarea to Medisray's structured,
-- categorized tag picker (Medical Condition / Allergies / Family History /
-- Lifestyle), each tag carrying an optional since/status/note. The existing
-- `medical_history` text column is kept as a server-computed flat summary
-- (used by the PDF), while the structured data lives in the new columns so
-- the editor can round-trip it.

alter table prescriptions add column if not exists medical_history_tags jsonb not null default '[]';
alter table prescriptions add column if not exists medical_history_no_known jsonb not null default '[]';
