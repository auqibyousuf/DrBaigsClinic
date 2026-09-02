'use client';

import { useState } from 'react';
import { useToast } from '@/components/ToastProvider';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

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
    notes: string | null;
  } | null;
  onClose: () => void;
  onSaved: (pdfUrl: string, prescriptionId: string) => void;
}

const emptyMed: Medication = { name: '', dosage: '', frequency: '', duration: '', notes: '' };

export default function PrescriptionEditor({
  appointmentId,
  context,
  initial,
  onClose,
  onSaved,
}: PrescriptionEditorProps) {
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [medications, setMedications] = useState<Medication[]>(
    initial?.medications && initial.medications.length > 0 ? initial.medications : [{ ...emptyMed }]
  );
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const updateMed = (index: number, partial: Partial<Medication>) => {
    setMedications((prev) => prev.map((m, i) => (i === index ? { ...m, ...partial } : m)));
  };

  const handleSave = async () => {
    const validMeds = medications.filter((m) => m.name.trim());
    if (validMeds.length === 0) {
      showToast('error', 'Add at least one medication');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, diagnosis, notes, medications: validMeds }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save prescription');
      showToast('success', initial ? 'Prescription updated and PDF regenerated.' : 'Prescription saved and PDF generated.');
      onSaved(result.prescription.pdf_url, result.prescription.id);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 p-4 border-2 border-primary-200 dark:border-primary-800 rounded-xl bg-primary-50/50 dark:bg-primary-900/10">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
        {initial ? 'Edit Prescription' : 'Write Prescription'}
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

      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        Diagnosis
      </label>
      <textarea
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
        rows={2}
        className="w-full mb-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
        placeholder="e.g., Mild acne vulgaris"
      />

      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        Medications
      </label>
      {medications.map((med, index) => (
        <div key={index} className="flex gap-2 mb-2 items-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
            <input
              placeholder="Name"
              value={med.name}
              onChange={(e) => updateMed(index, { name: e.target.value })}
              className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
            />
            <input
              placeholder="Dosage"
              value={med.dosage}
              onChange={(e) => updateMed(index, { dosage: e.target.value })}
              className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
            />
            <input
              placeholder="Frequency"
              value={med.frequency}
              onChange={(e) => updateMed(index, { frequency: e.target.value })}
              className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
            />
            <input
              placeholder="Duration"
              value={med.duration}
              onChange={(e) => updateMed(index, { duration: e.target.value })}
              className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
            />
          </div>
          {medications.length > 1 && (
            <button
              type="button"
              onClick={() => setMedications((prev) => prev.filter((_, i) => i !== index))}
              className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
              aria-label="Remove medication"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setMedications((prev) => [...prev, { ...emptyMed }])}
        className="text-xs text-primary-600 hover:text-primary-700 font-medium mb-3"
      >
        + Add Medication
      </button>

      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        Additional Notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Generate PDF'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
