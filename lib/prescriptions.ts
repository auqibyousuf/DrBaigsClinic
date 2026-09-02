import { createClient } from '@supabase/supabase-js';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string | null;
  medications: Medication[];
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewPrescription {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis?: string;
  medications: Medication[];
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

// One prescription per appointment — writing again replaces it (and its PDF).
export async function upsertPrescription(input: NewPrescription): Promise<Prescription> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .upsert(
      {
        appointment_id: input.appointment_id,
        patient_id: input.patient_id,
        doctor_id: input.doctor_id,
        diagnosis: input.diagnosis || null,
        medications: input.medications,
        notes: input.notes || null,
      },
      { onConflict: 'appointment_id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save prescription: ${error.message}`);
  }

  return data as Prescription;
}

export async function setPrescriptionPdfUrl(id: string, pdfUrl: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('prescriptions').update({ pdf_url: pdfUrl }).eq('id', id);
  if (error) {
    throw new Error(`Failed to save prescription PDF: ${error.message}`);
  }
}

export async function getPrescriptionById(id: string): Promise<Prescription | null> {
  const supabase = getClient();
  const { data, error } = await supabase.from('prescriptions').select('*').eq('id', id).maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch prescription: ${error.message}`);
  }
  return (data as Prescription) || null;
}

export async function getPrescriptionByAppointmentId(
  appointmentId: string
): Promise<Prescription | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('appointment_id', appointmentId)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch prescription: ${error.message}`);
  }
  return (data as Prescription) || null;
}

export async function listAllPrescriptions(): Promise<Prescription[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`Failed to list prescriptions: ${error.message}`);
  }
  return (data || []) as Prescription[];
}

export async function getLatestPrescriptionForPatient(
  patientId: string
): Promise<Prescription | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch latest prescription: ${error.message}`);
  }
  return (data as Prescription) || null;
}

export async function deletePrescription(id: string): Promise<void> {
  const supabase = getClient();
  // Best-effort: remove the stored PDF too, but don't let a missing/already-
  // gone file block deleting the row.
  await supabase.storage.from('prescriptions').remove([`${id}.pdf`]);
  const { error } = await supabase.from('prescriptions').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete prescription: ${error.message}`);
  }
}

export async function uploadPrescriptionPdf(
  prescriptionId: string,
  pdfBytes: Uint8Array
): Promise<string> {
  const supabase = getClient();
  const path = `${prescriptionId}.pdf`;

  const { error } = await supabase.storage
    .from('prescriptions')
    .upload(path, Buffer.from(pdfBytes), { contentType: 'application/pdf', upsert: true });

  if (error) {
    throw new Error(`Failed to upload prescription PDF: ${error.message}`);
  }

  const { data } = supabase.storage.from('prescriptions').getPublicUrl(path);
  return data.publicUrl;
}
