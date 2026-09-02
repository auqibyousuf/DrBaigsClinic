import { createClient } from '@supabase/supabase-js';

export interface Patient {
  id: string;
  patient_code: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
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
  updates: { name?: string; phone?: string; email?: string }
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

// Also removes this patient's appointments and prescriptions — a patient
// record can't be deleted while visit history still points at it (FK
// constraints on appointments.patient_id / prescriptions.patient_id).
export async function deletePatient(id: string): Promise<void> {
  const supabase = getClient();
  await supabase.from('prescriptions').delete().eq('patient_id', id);
  await supabase.from('appointments').delete().eq('patient_id', id);
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete patient: ${error.message}`);
  }
}
