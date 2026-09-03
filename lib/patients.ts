import { createClient } from '@supabase/supabase-js';

export interface Patient {
  id: string;
  patient_code: string;
  name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  marital_status: string | null;
  occupation: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_pincode: string | null;
  photo_url: string | null;
  reference_id: string | null;
  aadhaar_number: string | null;
  created_at: string;
}

export interface NewPatientProfile {
  name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  marital_status?: string;
  occupation?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_pincode?: string;
  photo_url?: string;
  reference_id?: string;
  aadhaar_number?: string;
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }
  return createClient(url, key);
}

// 8-char mixed-case+digit code (~2x10^14 combinations) — this is the sole
// credential a patient uses to view their history, so it must not be
// sequential or easily guessable.
function generatePatientCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DRB-${code}`;
}

export async function findOrCreatePatientByPhone(
  phone: string,
  name: string,
  email: string
): Promise<Patient> {
  const supabase = getClient();

  const { data: existing, error: findError } = await supabase
    .from('patients')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to look up patient: ${findError.message}`);
  }

  if (existing) {
    return existing as Patient;
  }

  // Retry on the (astronomically unlikely) chance of a code collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from('patients')
      .insert({ patient_code: generatePatientCode(), name, phone, email })
      .select()
      .single();

    if (!error) {
      return data as Patient;
    }
    if (error.code !== '23505') {
      throw new Error(`Failed to create patient: ${error.message}`);
    }
  }

  throw new Error('Failed to generate a unique patient code, please try again.');
}

// Admin-initiated creation (the "+ Add New Patient" flow — Patients tab and
// walk-in consultation search both use this, unlike the booking flow's
// findOrCreatePatientByPhone which only takes name/phone/email).
export async function createPatientProfile(input: NewPatientProfile): Promise<Patient> {
  const supabase = getClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from('patients')
      .insert({ patient_code: generatePatientCode(), ...input })
      .select()
      .single();

    if (!error) {
      return data as Patient;
    }
    if (error.code !== '23505') {
      throw new Error(`Failed to create patient: ${error.message}`);
    }
  }

  throw new Error('Failed to generate a unique patient code, please try again.');
}

export async function getPatientByCode(code: string): Promise<Patient | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('patient_code', code.trim().toUpperCase())
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to look up patient: ${error.message}`);
  }

  return (data as Patient) || null;
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const supabase = getClient();
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new Error(`Failed to look up patient: ${error.message}`);
  }

  return (data as Patient) || null;
}

export async function listPatients(): Promise<Patient[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list patients: ${error.message}`);
  }

  return (data || []) as Patient[];
}

export async function updatePatient(
  id: string,
  updates: Partial<NewPatientProfile>
): Promise<Patient> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update patient: ${error.message}`);
  }

  return data as Patient;
}

// Also removes this patient's invoices, prescriptions and appointments — a
// patient record can't be deleted while visit history still points at it
// (FK constraints on invoices/prescriptions/appointments.patient_id).
export async function deletePatient(id: string): Promise<void> {
  const supabase = getClient();
  await supabase.from('invoices').delete().eq('patient_id', id);
  await supabase.from('prescriptions').delete().eq('patient_id', id);
  await supabase.from('appointments').delete().eq('patient_id', id);
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete patient: ${error.message}`);
  }
}
