'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { AdminInput, AdminSelect } from '@/components/admin/AdminField';
import PatientProfileForm, {
  emptyPatientProfile,
  type PatientProfileFormState,
} from '@/components/admin/PatientProfileForm';
import type { CMSData } from '@/lib/cms';

interface PatientSummary {
  id: string;
  name: string;
  phone: string;
  patient_code: string;
}

interface WalkInModalProps {
  doctors: NonNullable<CMSData['doctors']>['items'];
  onClose: () => void;
  onStarted: (appointmentId: string) => void | Promise<void>;
}

// "Start Walk-in Consultation" (MEDISRAY_AUDIT.md finding #1): search or add
// a patient, pick the doctor, then create-and-enter a same-day appointment
// in one motion.
export default function WalkInModal({ doctors, onClose, onStarted }: WalkInModalProps) {
  const activeDoctors = doctors.filter((d) => d.isActive !== false);
  const [doctorId, setDoctorId] = useState(activeDoctors[0]?.id || '');
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingPatient, setAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState<PatientProfileFormState>(emptyPatientProfile);
  const [starting, setStarting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/patients/list', { credentials: 'include' })
      .then((res) => res.json())
      .then((result) => setPatients(result.patients || []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients.slice(0, 20);
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.patient_code.toLowerCase().includes(q)
    );
  }, [patients, query]);

  const startConsultation = async (patientId: string) => {
    if (!doctorId) {
      showToast('error', 'Select a doctor first');
      return;
    }
    setStarting(true);
    try {
      const res = await fetch('/api/appointment/walk-in', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, doctorId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to start consultation');
      await onStarted(result.appointment.id);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to start consultation');
    } finally {
      setStarting(false);
    }
  };

  const createAndStart = async () => {
    if (!newPatient.name.trim() || !newPatient.phone.trim()) {
      showToast('error', 'Name and phone are required');
      return;
    }
    setStarting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create patient');
      await startConsultation(result.patient.id);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to create patient');
      setStarting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={addingPatient ? 'Add New Patient' : 'Start Walk-in Consultation'}>
      {addingPatient ? (
        <div className="space-y-4">
          <PatientProfileForm value={newPatient} onChange={setNewPatient} />
          <div className="flex gap-2">
            <Button onClick={createAndStart} disabled={starting} variant="primary" size="sm">
              {starting ? 'Starting...' : 'Add Patient & Start Consultation'}
            </Button>
            <Button onClick={() => setAddingPatient(false)} variant="outline" size="sm">
              Back to search
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AdminSelect
            label="Doctor"
            required
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            options={activeDoctors.map((d) => ({ value: d.id, label: d.name }))}
          />
          <AdminInput
            label="Search Patient"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone number, or patient ID"
          />

          <button
            type="button"
            onClick={() => setAddingPatient(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Patient
          </button>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No matching patients.</p>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {p.phone} · {p.patient_code}
                    </p>
                  </div>
                  <Button onClick={() => startConsultation(p.id)} disabled={starting} variant="primary" size="sm">
                    Consult
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
