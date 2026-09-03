'use client';

import { useState } from 'react';
import { Plus, X, Stethoscope, ClipboardCheck, ScanSearch, Pill, FlaskConical, MessageSquareText, CalendarClock, StickyNote } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminField';
import AutocompleteTagInput from '@/components/admin/AutocompleteTagInput';
import VitalsPanel, { type VitalsReading } from '@/components/admin/VitalsPanel';
import SectionCard from '@/components/admin/SectionCard';
import type { SymptomEntry, Medication } from '@/lib/prescriptions';

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
// replaces the old flat "diagnosis + medications only" form. Tabbed so
// Vitals/Private Notes stay out of the way until the doctor actually needs
// them, instead of one long scrolling page.
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
  const [tab, setTab] = useState('consultation');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

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
    <div className="mt-3 border-2 border-primary-200 dark:border-primary-800 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 overflow-hidden">
      <div className="p-4 pb-0">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          {initial ? 'Edit Visit' : 'Write Prescription'}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
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

      <Tabs value={tab} onValueChange={setTab} className="px-4">
        <TabsList>
          <TabsTrigger value="consultation">Consultation</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="notes">Private Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="consultation" className="space-y-3 pb-4">
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
            {medications.map((med, index) => (
              <div key={index} className="flex gap-2 mb-2 items-start">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                  <AdminInput placeholder="Name" value={med.name} onChange={(e) => updateMed(index, { name: e.target.value })} />
                  <AdminInput placeholder="Dosage" value={med.dosage} onChange={(e) => updateMed(index, { dosage: e.target.value })} />
                  <AdminInput placeholder="Frequency" value={med.frequency} onChange={(e) => updateMed(index, { frequency: e.target.value })} />
                  <AdminInput placeholder="Duration" value={med.duration} onChange={(e) => updateMed(index, { duration: e.target.value })} />
                </div>
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setMedications((prev) => prev.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700 p-2 flex-shrink-0 cursor-pointer"
                    aria-label="Remove medication"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMedications((prev) => [...prev, { ...emptyMed }])}
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
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
        </TabsContent>

        <TabsContent value="vitals" className="pb-4">
          <SectionCard icon={<Stethoscope className="w-4 h-4" />} title="Vitals & Body Composition">
            <VitalsPanel reading={vitals} onChange={setVitals} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="notes" className="pb-4">
          <SectionCard icon={<StickyNote className="w-4 h-4" />} title="Private Notes">
            <AdminTextarea
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              rows={4}
              hint="Only visible to you — never printed or shown to the patient."
            />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 p-4 pt-0">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save & Generate PDF'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
