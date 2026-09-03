import { createClient } from '@supabase/supabase-js';

// Manual billing/invoicing — no payment gateway integration, matching
// Medisray's own "Create Bill" screen (a record of what was billed/paid,
// filled in by staff). See MEDISRAY_AUDIT.md finding #6.

export type DiscountType = 'percent' | 'flat';

export interface InvoiceLineItem {
  name: string;
  qty: number;
  price_per_unit: number;
  discount_type: DiscountType;
  discount_value: number;
  gst_percent: number;
}

export interface Payment {
  mode: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  appointment_id: string | null;
  patient_id: string;
  doctor_id: string;
  bill_date: string;
  line_items: InvoiceLineItem[];
  extra_discount_type: DiscountType;
  extra_discount_value: number;
  subtotal: number;
  gst_amount: number;
  total_payable: number;
  payments: Payment[];
  paid_amount: number;
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewInvoice {
  appointment_id?: string | null;
  patient_id: string;
  doctor_id: string;
  bill_date?: string;
  line_items: InvoiceLineItem[];
  extra_discount_type?: DiscountType;
  extra_discount_value?: number;
  payments?: Payment[];
  notes?: string;
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }
  return createClient(url, key);
}

function lineItemTotal(item: InvoiceLineItem): number {
  const base = item.qty * item.price_per_unit;
  const discount = item.discount_type === 'percent' ? (base * item.discount_value) / 100 : item.discount_value;
  const afterDiscount = Math.max(base - discount, 0);
  const gst = (afterDiscount * item.gst_percent) / 100;
  return afterDiscount + gst;
}

// Mirrors Medisray's totals panel: Subtotal, per-line discount, GST, an
// extra bill-level discount, then Total Payable.
export function computeInvoiceTotals(input: {
  line_items: InvoiceLineItem[];
  extra_discount_type: DiscountType;
  extra_discount_value: number;
}) {
  const subtotal = input.line_items.reduce((sum, item) => sum + item.qty * item.price_per_unit, 0);
  const lineDiscountTotal = input.line_items.reduce((sum, item) => {
    const base = item.qty * item.price_per_unit;
    return sum + (item.discount_type === 'percent' ? (base * item.discount_value) / 100 : item.discount_value);
  }, 0);
  const gstAmount = input.line_items.reduce((sum, item) => {
    const base = item.qty * item.price_per_unit;
    const discount = item.discount_type === 'percent' ? (base * item.discount_value) / 100 : item.discount_value;
    const afterDiscount = Math.max(base - discount, 0);
    return sum + (afterDiscount * item.gst_percent) / 100;
  }, 0);

  const afterLineItems = input.line_items.reduce((sum, item) => sum + lineItemTotal(item), 0);
  const extraDiscount =
    input.extra_discount_type === 'percent'
      ? (afterLineItems * input.extra_discount_value) / 100
      : input.extra_discount_value;
  const totalPayable = Math.max(afterLineItems - extraDiscount, 0);

  return { subtotal, lineDiscountTotal, gstAmount, totalPayable };
}

export async function createInvoice(input: NewInvoice): Promise<Invoice> {
  const supabase = getClient();
  const totals = computeInvoiceTotals({
    line_items: input.line_items,
    extra_discount_type: input.extra_discount_type || 'flat',
    extra_discount_value: input.extra_discount_value || 0,
  });
  const paidAmount = (input.payments || []).reduce((sum, p) => sum + p.amount, 0);

  const { count } = await supabase.from('invoices').select('id', { count: 'exact', head: true });
  const invoiceNumber = `INV${String((count || 0) + 1).padStart(6, '0')}`;

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      appointment_id: input.appointment_id || null,
      patient_id: input.patient_id,
      doctor_id: input.doctor_id,
      bill_date: input.bill_date || new Date().toISOString().slice(0, 10),
      line_items: input.line_items,
      extra_discount_type: input.extra_discount_type || 'flat',
      extra_discount_value: input.extra_discount_value || 0,
      subtotal: totals.subtotal,
      gst_amount: totals.gstAmount,
      total_payable: totals.totalPayable,
      payments: input.payments || [],
      paid_amount: paidAmount,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invoice: ${error.message}`);
  }
  return data as Invoice;
}

export async function updateInvoice(id: string, input: NewInvoice): Promise<Invoice> {
  const supabase = getClient();
  const totals = computeInvoiceTotals({
    line_items: input.line_items,
    extra_discount_type: input.extra_discount_type || 'flat',
    extra_discount_value: input.extra_discount_value || 0,
  });
  const paidAmount = (input.payments || []).reduce((sum, p) => sum + p.amount, 0);

  const { data, error } = await supabase
    .from('invoices')
    .update({
      line_items: input.line_items,
      extra_discount_type: input.extra_discount_type || 'flat',
      extra_discount_value: input.extra_discount_value || 0,
      subtotal: totals.subtotal,
      gst_amount: totals.gstAmount,
      total_payable: totals.totalPayable,
      payments: input.payments || [],
      paid_amount: paidAmount,
      notes: input.notes || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update invoice: ${error.message}`);
  }
  return data as Invoice;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const supabase = getClient();
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }
  return (data as Invoice) || null;
}

export async function listInvoicesForAppointment(appointmentId: string): Promise<Invoice[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`Failed to list invoices: ${error.message}`);
  }
  return (data || []) as Invoice[];
}

export async function listInvoicesForPatient(patientId: string): Promise<Invoice[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`Failed to list invoices: ${error.message}`);
  }
  return (data || []) as Invoice[];
}

export async function listAllInvoices(): Promise<Invoice[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`Failed to list invoices: ${error.message}`);
  }
  return (data || []) as Invoice[];
}

export async function setInvoicePdfUrl(id: string, pdfUrl: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('invoices').update({ pdf_url: pdfUrl }).eq('id', id);
  if (error) {
    throw new Error(`Failed to save invoice PDF: ${error.message}`);
  }
}

export async function uploadInvoicePdf(invoiceId: string, pdfBytes: Uint8Array): Promise<string> {
  const supabase = getClient();
  const path = `${invoiceId}.pdf`;

  const { error } = await supabase.storage
    .from('invoices')
    .upload(path, Buffer.from(pdfBytes), { contentType: 'application/pdf', upsert: true });

  if (error) {
    throw new Error(`Failed to upload invoice PDF: ${error.message}`);
  }

  const { data } = supabase.storage.from('invoices').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }
}
