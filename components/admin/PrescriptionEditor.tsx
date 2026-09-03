'use client';

import { useState, useRef } from 'react';
import { Plus, X, Stethoscope, ClipboardCheck, ScanSearch, Pill, FlaskConical, MessageSquareText, CalendarClock, StickyNote, Activity, Lock, Check, ArrowLeft, ClipboardList, FolderPlus, Paperclip } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import Modal from '@/components/Modal';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminField';
import AutocompleteTagInput from '@/components/admin/AutocompleteTagInput';
import VitalsPanel, { type VitalsReading } from '@/components/admin/VitalsPanel';
import SectionCard from '@/components/admin/SectionCard';
import type { SymptomEntry, Medication, MedicalRecordFile } from '@/lib/prescriptions';

interface PrescriptionEditorProps {
  appointmentId: string;
  context: {
    patientName: string;
    patientPhone: string;
    date: string;
    slot: string;
    reason: string;
  };
  initial?: {
    diagnosis: string | null;
    medications: Medication[];
    symptoms?: SymptomEntry[];
    examinations?: string[];
    investigations?: string[];
    advices?: string[];
    vitals?: VitalsReading[];
    follow_up_date?: string | null;
    additional_notes?: string | null;
    private_notes?: string | null;
    medical_history?: string | null;
    medical_records?: MedicalRecordFile[];
    notes: string | null;
  } | null;
  onClose: () => void;
  onSaved: (pdfUrl: string, prescriptionId: string) => void;
}

const emptyMed: Medication = { name: '', dosage: '', frequency: '', duration: '', notes: '' };

const FOLLOW_UP_PRESETS = [
  { label: '2 Days', days: 2 },
  { label: '2 Weeks', days: 14 },
  { label: '2 Months', days: 60 },
];

// Modular Digital-Rx consultation editor (MEDISRAY_AUDIT.md finding #2) —
// replaces the old flat "diagnosis + medications only" form. Matches
// Medisray's own layout: a left-side list of optional modules (Vitals,
// Private Notes) that open in a modal, while the core sections
// (Symptoms/Diagnosis/Medications/etc.) stay inline on the page.
export default function PrescriptionEditor({
  appointmentId,
  context,
  initial,
  onClose,
  onSaved,
}: PrescriptionEditorProps) {
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis || '');
  const [medications, setMedications] = useState<Medication[]>(
    initial?.medications && initial.medications.length > 0 ? initial.medications : [{ ...emptyMed }]
  );
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>(initial?.symptoms || []);
  const [examinations, setExaminations] = useState<string[]>(initial?.examinations || []);
  const [investigations, setInvestigations] = useState<string[]>(initial?.investigations || []);
  const [advices, setAdvices] = useState<string[]>(initial?.advices || []);
  const [vitals, setVitals] = useState<VitalsReading>(
    initial?.vitals?.[0] || { recorded_at: new Date().toISOString() }
  );
  const [followUpDate, setFollowUpDate] = useState(initial?.follow_up_date || '');
  const [additionalNotes, setAdditionalNotes] = useState(initial?.additional_notes || '');
  const [privateNotes, setPrivateNotes] = useState(initial?.private_notes || '');
  const [medicalHistory, setMedicalHistory] = useState(initial?.medical_history || '');
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordFile[]>(initial?.medical_records || []);
  const [uploadingRecord, setUploadingRecord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openModule, setOpenModule] = useState<'vitals' | 'notes' | 'history' | 'records' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const vitalsFilled = !!(vitals.temperature || vitals.pulse || vitals.systolic || vitals.spo2 || vitals.diastolic || vitals.rbs);
  const notesFilled = !!privateNotes.trim();
  const historyFilled = !!medicalHistory.trim();
  const recordsFilled = medicalRecords.length > 0;

  const handleRecordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingRecord(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cms/upload', { method: 'POST', credentials: 'include', body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to upload file');
      setMedicalRecords((prev) => [...prev, { name: file.name, url: result.url }]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploadingRecord(false);
    }
  };

  const updateMed = (index: number, partial: Partial<Medication>) => {
    setMedications((prev) => prev.map((m, i) => (i === index ? { ...m, ...partial } : m)));
  };

  const applyFollowUpPreset = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setFollowUpDate(date.toISOString().slice(0, 10));
  };

  const handleSave = async () => {
    const validMeds = medications.filter((m) => m.name.trim());
    const hasAnyContent =
      validMeds.length > 0 || symptoms.length > 0 || diagnosis.trim() || examinations.length > 0;
    if (!hasAnyContent) {
      showToast('error', 'Add at least one symptom, diagnosis, medication, or examination');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          diagnosis,
          medications: validMeds,
          symptoms,
          examinations,
          investigations,
          advices,
          vitals: vitals.temperature || vitals.pulse || vitals.systolic || vitals.spo2 ? [vitals] : [],
          followUpDate: followUpDate || null,
          additionalNotes,
          privateNotes,
          medicalHistory,
          medicalRecords,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save prescription');
      showToast('success', initial ? 'Visit updated and PDF regenerated.' : 'Visit saved and PDF generated.');
      onSaved(result.prescription.pdf_url, result.prescription.id);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Appointments
      </button>

      <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {initial ? 'Edit Visit' : 'Write Prescription'}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
          <div>
            <span className="block text-gray-400 dark:text-gray-500">Patient</span>
            <span className="font-medium text-gray-900 dark:text-white">{context.patientName}</span>
          </div>
          <div>
            <span className="block text-gray-400 dark:text-gray-500">Phone</span>
            <span className="font-medium text-gray-900 dark:text-white">{context.patientPhone}</span>
          </div>
          <div>
            <span className="block text-gray-400 dark:text-gray-500">Visit</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {context.date} {context.slot}
            </span>
          </div>
          <div>
            <span className="block text-gray-400 dark:text-gray-500">Reason</span>
            <span className="font-medium text-gray-900 dark:text-white">{context.reason}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-3 items-start">
        {/* Optional modules — matches Medisray's pattern: a left-side list
            of "+ Add" modules that open in a modal, kept separate from the
            always-visible core sections on the right so the main page
            doesn't grow for visits that don't need them. */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setOpenModule('vitals')}
            className="w-full flex items-center justify-between gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer text-left"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex-shrink-0">
                <Activity className="w-3.5 h-3.5" />
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">Vitals & Body Composition</span>
            </span>
            {vitalsFilled ? (
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 flex-shrink-0">+ Add</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpenModule('notes')}
            className="w-full flex items-center justify-between gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer text-left"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex-shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">Private Notes</span>
            </span>
            {notesFilled ? (
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 flex-shrink-0">+ Add</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpenModule('history')}
            className="w-full flex items-center justify-between gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer text-left"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex-shrink-0">
                <ClipboardList className="w-3.5 h-3.5" />
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">Medical History</span>
            </span>
            {historyFilled ? (
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 flex-shrink-0">+ Add</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpenModule('records')}
            className="w-full flex items-center justify-between gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer text-left"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex-shrink-0">
                <FolderPlus className="w-3.5 h-3.5" />
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">Medical Records</span>
            </span>
            {recordsFilled ? (
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 flex-shrink-0">+ Add</span>
            )}
          </button>
        </div>

        <div className="space-y-3 min-w-0">
          <SectionCard icon={<Stethoscope className="w-4 h-4" />} title="Symptoms">
            <AutocompleteTagInput
              category="symptom"
              values={symptoms.map((s) => s.value)}
              onChange={(values) =>
                setSymptoms(values.map((v) => symptoms.find((s) => s.value === v) || { value: v }))
              }
            />
          </SectionCard>

          <SectionCard icon={<ScanSearch className="w-4 h-4" />} title="Examinations">
            <AutocompleteTagInput category="examination" values={examinations} onChange={setExaminations} />
          </SectionCard>

          <SectionCard icon={<ClipboardCheck className="w-4 h-4" />} title="Diagnosis">
            <AutocompleteTagInput
              category="diagnosis"
              values={diagnosis ? [diagnosis] : []}
              onChange={(values) => setDiagnosis(values[values.length - 1] || '')}
              placeholder="Search or add a diagnosis"
            />
          </SectionCard>

          <SectionCard icon={<Pill className="w-4 h-4" />} title="Medications">
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full min-w-[560px] text-sm border-separate border-spacing-y-1.5">
                <thead>
                  <tr className="text-xs text-gray-400 dark:text-gray-500">
                    <th className="text-left font-medium pb-1">Name</th>
                    <th className="text-left font-medium pb-1">Dosage</th>
                    <th className="text-left font-medium pb-1">Frequency</th>
                    <th className="text-left font-medium pb-1">Duration</th>
                    <th className="text-left font-medium pb-1">Notes</th>
                    <th className="pb-1" />
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med, index) => (
                    <tr key={index}>
                      <td className="pr-2">
                        <AdminInput placeholder="Name" value={med.name} onChange={(e) => updateMed(index, { name: e.target.value })} />
                      </td>
                      <td className="pr-2">
                        <AdminInput placeholder="Dosage" value={med.dosage} onChange={(e) => updateMed(index, { dosage: e.target.value })} />
                      </td>
                      <td className="pr-2">
                        <AdminInput placeholder="Frequency" value={med.frequency} onChange={(e) => updateMed(index, { frequency: e.target.value })} />
                      </td>
                      <td className="pr-2">
                        <AdminInput placeholder="Duration" value={med.duration} onChange={(e) => updateMed(index, { duration: e.target.value })} />
                      </td>
                      <td className="pr-2">
                        <AdminInput
                          placeholder="Notes"
                          value={med.notes || ''}
                          onChange={(e) => updateMed(index, { notes: e.target.value })}
                        />
                      </td>
                      <td>
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setMedications((prev) => prev.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 p-2 cursor-pointer"
                            aria-label="Remove medication"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => setMedications((prev) => [...prev, { ...emptyMed }])}
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medication
            </button>
          </SectionCard>

          <SectionCard icon={<FlaskConical className="w-4 h-4" />} title="Lab Investigation">
            <AutocompleteTagInput category="investigation" values={investigations} onChange={setInvestigations} />
          </SectionCard>

          <SectionCard icon={<MessageSquareText className="w-4 h-4" />} title="Advices">
            <AutocompleteTagInput category="advice" values={advices} onChange={setAdvices} />
          </SectionCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SectionCard icon={<CalendarClock className="w-4 h-4" />} title="Follow-up">
              <AdminInput type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
              <div className="flex gap-2 mt-2">
                {FOLLOW_UP_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyFollowUpPreset(preset.days)}
                    className="px-3 py-1 rounded-full border border-primary-300 dark:border-primary-700 text-xs font-medium text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </SectionCard>
            <SectionCard icon={<StickyNote className="w-4 h-4" />} title="Additional Notes">
              <AdminTextarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={2}
                placeholder="Visible to the patient on the prescription"
              />
            </SectionCard>
          </div>
        </div>
      </div>

      {openModule === 'vitals' && (
        <Modal isOpen onClose={() => setOpenModule(null)} title="Vitals & Body Composition">
          <div className="space-y-4">
            <VitalsPanel reading={vitals} onChange={setVitals} />
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setOpenModule(null)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {openModule === 'notes' && (
        <Modal isOpen onClose={() => setOpenModule(null)} title="Private Notes">
          <div className="space-y-4">
            <AdminTextarea
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              rows={5}
              hint="Only visible to you — never printed or shown to the patient."
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setOpenModule(null)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {openModule === 'history' && (
        <Modal isOpen onClose={() => setOpenModule(null)} title="Medical History">
          <div className="space-y-4">
            <AdminTextarea
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              rows={5}
              placeholder="Allergies, chronic conditions, prior surgeries, family history, etc."
              hint="Printed on the prescription along with this visit's details."
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setOpenModule(null)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {openModule === 'records' && (
        <Modal isOpen onClose={() => setOpenModule(null)} title="Medical Records">
          <div className="space-y-4">
            {medicalRecords.length > 0 && (
              <ul className="space-y-1.5">
                {medicalRecords.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  >
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 min-w-0 text-primary-600 hover:underline"
                    >
                      <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{rec.name}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setMedicalRecords((prev) => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700 flex-shrink-0 cursor-pointer"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleRecordUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingRecord}
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {uploadingRecord ? 'Uploading...' : 'Upload File'}
            </button>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setOpenModule(null)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save & Generate PDF'}
        </button>
      </div>
    </div>
  );
}
