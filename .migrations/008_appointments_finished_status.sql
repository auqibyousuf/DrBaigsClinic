-- Adds a 'finished' status so the admin Queue/Finished/Cancelled tabs
-- (MEDISRAY_AUDIT.md finding #1) can distinguish "still needs seeing" from
-- "visit is done" — previously only confirmed/cancelled existed, which
-- conflated "booked for later" with "currently in progress."
-- Run this once in the Supabase SQL editor, or via `yarn db:migrate`.

alter table appointments drop constraint if exists appointments_status_check;
alter table appointments add constraint appointments_status_check
  check (status in ('confirmed', 'finished', 'cancelled'));

-- Walk-in visits are created and consulted in the same motion — no
-- pre-picked slot the way a booked appointment has one. Nullable slot_start
-- lets a walk-in skip that without needing a fake placeholder time.
alter table appointments alter column slot_start drop not null;
alter table appointments add column if not exists is_walk_in boolean not null default false;
