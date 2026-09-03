-- Public storage bucket for generated invoice PDFs, mirroring the
-- prescriptions bucket pattern (needed for print/download links).
-- Run this once in the Supabase SQL editor, or via `yarn db:migrate`.

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', true)
on conflict (id) do nothing;

drop policy if exists "Public read invoices bucket" on storage.objects;
create policy "Public read invoices bucket" on storage.objects
  for select using (bucket_id = 'invoices');

drop policy if exists "Allow inserts to invoices bucket" on storage.objects;
create policy "Allow inserts to invoices bucket" on storage.objects
  for insert with check (bucket_id = 'invoices');

drop policy if exists "Allow updates to invoices bucket" on storage.objects;
create policy "Allow updates to invoices bucket" on storage.objects
  for update using (bucket_id = 'invoices');

alter table invoices add column if not exists pdf_url text;
