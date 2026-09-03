-- Billing / invoicing (MEDISRAY_AUDIT.md finding #6) — manual record-keeping
-- only, matching Medisray: line items, per-item and bill-level discount
-- (percent or flat), GST%, one or more payment-mode entries with amounts.
-- No payment gateway integration — this just records what was billed/paid.
-- Run this once in the Supabase SQL editor, or via `yarn db:migrate`.

create sequence if not exists invoices_number_seq start 1;

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  appointment_id uuid references appointments(id),
  patient_id uuid not null references patients(id),
  doctor_id text not null,
  bill_date date not null default current_date,
  -- [{name, qty, price_per_unit, discount_type: 'percent'|'flat', discount_value, gst_percent}]
  line_items jsonb not null default '[]',
  extra_discount_type text not null default 'flat' check (extra_discount_type in ('percent', 'flat')),
  extra_discount_value numeric not null default 0,
  subtotal numeric not null default 0,
  gst_amount numeric not null default 0,
  total_payable numeric not null default 0,
  -- [{mode, amount}] — supports splitting payment across cash/card/UPI/etc.
  payments jsonb not null default '[]',
  paid_amount numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_patient_id_idx on invoices (patient_id);
create index if not exists invoices_appointment_id_idx on invoices (appointment_id);

alter table invoices enable row level security;

drop policy if exists "Allow all on invoices" on invoices;
create policy "Allow all on invoices" on invoices for all using (true) with check (true);

drop trigger if exists invoices_set_updated_at on invoices;
create trigger invoices_set_updated_at
  before update on invoices
  for each row execute function set_updated_at();
