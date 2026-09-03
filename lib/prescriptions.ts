import { createClient } from '@supabase/supabase-js';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

// Structured symptom entries carry since/severity/notes like Medisray's;
// diagnosis/examinations/investigations/advices are plain string tags.
export interface SymptomEntry {
  value: string;
  since?: string;
  severity?: string;
  notes?: string;
}

export interface VitalsReading {
  recorded_at: string;
  temperature?: string;
  pulse?: string;
  resp_rate?: string;
  systolic?: string;
  diastolic?: string;
  spo2?: string;
  rbs?: string;
}

export interface MedicalRecordFile {
  name: string;
  url: string;
  recordType?: string;
  date?: string;
  notes?: string;
}

export type MedicalHistoryCategory = 'condition' | 'allergy' | 'family' | 'lifestyle';

// A single selected tag within a Medical History category — e.g. category
// "condition", value "Osteoarthritis", with its own since/status/note, like
// Medisray's per-tag detail panel.
export interface MedicalHistoryTag {
  category: MedicalHistoryCategory;
  value: string;
  since?: string;
  status?: 'active' | 'inactive';
  note?: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string | null;
  medications: Medication[];
  symptoms: SymptomEntry[];
  examinations: string[];
  investigations: string[];
  advices: string[];
  vitals: VitalsReading[];
  follow_up_date: string | null;
  additional_notes: string | null;
  // Doctor-only — never rendered into the patient-facing PDF.
  private_notes: string | null;
  // Server-computed flat summary of medical_history_tags, used by the PDF —
  // never edited directly.
  medical_history: string | null;
  // Structured Medical History module (Medical Condition / Allergies /
  // Family History / Lifestyle tag pickers, Medisray-style).
  medical_history_tags: MedicalHistoryTag[];
  medical_history_no_known: MedicalHistoryCategory[];
  // Uploaded documents/images (old reports, scans) attached to this visit.
  medical_records: MedicalRecordFile[];
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
  symptoms?: SymptomEntry[];
  examinations?: string[];
  investigations?: string[];
  advices?: string[];
  vitals?: VitalsReading[];
  follow_up_date?: string | null;
  additional_notes?: string;
  private_notes?: string;
  medical_history?: string;
  medical_history_tags?: MedicalHistoryTag[];
  medical_history_no_known?: MedicalHistoryCategory[];
  medical_records?: MedicalRecordFile[];
  notes?: string;
}

const CATEGORY_LABEL: Record<MedicalHistoryCategory, string> = {
  condition: 'Medical Condition',
  allergy: 'Allergies',
  family: 'Family History',
  lifestyle: 'Lifestyle',
};

// Flattens the structured tag picker into the plain-text summary stored in
// `medical_history` for the PDF — the editor only ever works with the
// structured tags/no-known-history arrays.
export function summarizeMedicalHistory(
  tags: MedicalHistoryTag[],
  noKnown: MedicalHistoryCategory[]
): string {
  const lines: string[] = [];
  (Object.keys(CATEGORY_LABEL) as MedicalHistoryCategory[]).forEach((category) => {
    if (noKnown.includes(category)) {
      lines.push(`${CATEGORY_LABEL[category]}: No known history`);
      return;
    }
    const categoryTags = tags.filter((t) => t.category === category);
    if (categoryTags.length === 0) return;
    const parts = categoryTags.map((t) => {
      const meta = [t.since && `since ${t.since}`, t.status].filter(Boolean).join(', ');
      return meta ? `${t.value} (${meta})` : t.value;
    });
    lines.push(`${CATEGORY_LABEL[category]}: ${parts.join(', ')}`);
  });
  return lines.join('\n');
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
        symptoms: input.symptoms || [],
        examinations: input.examinations || [],
        investigations: input.investigations || [],
        advices: input.advices || [],
        vitals: input.vitals || [],
        follow_up_date: input.follow_up_date || null,
        additional_notes: input.additional_notes || null,
        private_notes: input.private_notes || null,
        medical_history: input.medical_history || null,
        medical_history_tags: input.medical_history_tags || [],
        medical_history_no_known: input.medical_history_no_known || [],
        medical_records: input.medical_records || [],
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
