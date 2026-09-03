'use client';

import { useState } from 'react';
import { Lock } from '@phosphor-icons/react';
import { Pencil } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { useCMSData } from '@/lib/cms-client';
import { getConfiguredSlots } from '@/lib/appointments';
import PrescriptionEditor from '@/components/admin/PrescriptionEditor';
import BillingPanel from '@/components/admin/BillingPanel';
import Button from '@/components/Button';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminField';
import type { VitalsReading } from '@/components/admin/VitalsPanel';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface AppointmentPrescription {
  id: string;
  diagnosis: string | null;
  medications: Medication[];
  symptoms?: { value: string; since?: string; severity?: string; notes?: string }[];
  examinations?: string[];
  investigations?: string[];
  advices?: string[];
  vitals?: VitalsReading[];
  follow_up_date?: string | null;
  additional_notes?: string | null;
  private_notes?: string | null;
  medical_history_tags?: { category: 'condition' | 'allergy' | 'family' | 'lifestyle'; value: string; since?: string; status?: 'active' | 'inactive'; note?: string }[];
  medical_history_no_known?: ('condition' | 'allergy' | 'family' | 'lifestyle')[];
  medical_records?: { name: string; url: string; recordType?: string; date?: string; notes?: string }[];
  notes: string | null;
  pdfUrl: string | null;
}

export interface Appointment {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  reason: string;
  doctor_id: string;
  appointment_date: string;
  slot_start: string | null;
  status: 'confirmed' | 'finished' | 'cancelled';
  is_walk_in: boolean;
  prescription: AppointmentPrescription | null;
}

interface HistoryVisit {
  id: string;
  date: string;
  slot: string;
  status: string;
  reason: string;
  doctorName: string;
  prescription: { diagnosis: string | null; pdfUrl: string | null } | null;
}

// The appointment has "started" once its slot's start time has passed —
// prescriptions only make sense once the consultation is actually underway.
// Walk-ins have no pre-picked slot and are always mid-consultation already.
export function hasStarted(appt: Appointment): boolean {
  if (appt.is_walk_in || !appt.slot_start) return true;
  return new Date(`${appt.appointment_date}T${appt.slot_start}:00`) <= new Date();
}

interface AppointmentDetailsPanelProps {
  appointment: Appointment;
  doctorName: string;
  onChanged: () => void;
  // "Details" is a read-only summary; "Edit" shows the editable fields. The
  // row's own 3-dot menu picks which one to open — this panel no longer
  // decides that itself (previously Details silently let you edit, and
  // Finish/Cancel/Delete/History/Add Prescription were buried inside here
  // instead of the row-level menu).
  mode?: 'details' | 'edit';
  onRequestEdit?: () => void;
  // Writing/editing a prescription now opens as its own modal, triggered
  // from the row's 3-dot menu — this panel only shows the read-only result
  // (view PDF / share / delete) once one exists.
  onRequestPrescribe?: () => void;
}

export default function AppointmentDetailsPanel({
  appointment: appt,
  doctorName,
  onChanged,
  mode = 'details',
  onRequestEdit,
  onRequestPrescribe,
}: AppointmentDetailsPanelProps) {
  const { showToast } = useToast();
  const { data: bookingSettingsData } = useCMSData('bookingSettings');
  const slots = getConfiguredSlots(bookingSettingsData);

  // Seeded fresh from the appointment prop on mount — this panel only ever
  // mounts once a row is expanded, so there's no separate "seed on open" step.
  const [editName, setEditName] = useState(appt.patient_name);
  const [editPhone, setEditPhone] = useState(appt.patient_phone);
  const [editEmail, setEditEmail] = useState(appt.patient_email);
  const [editReason, setEditReason] = useState(appt.reason);
  const [editDate, setEditDate] = useState(appt.appointment_date);
  const [editSlot, setEditSlot] = useState(appt.slot_start || '');
  const [savingDetails, setSavingDetails] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [historyVisits, setHistoryVisits] = useState<HistoryVisit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const started = hasStarted(appt);

  const saveDetails = async () => {
    setSavingDetails(true);
    try {
      const detailsChanged =
        editName !== appt.patient_name ||
        editPhone !== appt.patient_phone ||
        editEmail !== appt.patient_email ||
        editReason !== appt.reason;
      const scheduleChanged = editDate !== appt.appointment_date || editSlot !== (appt.slot_start || '');

      if (detailsChanged) {
        const res = await fetch(`/api/appointment/admin/${appt.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_name: editName,
            patient_phone: editPhone,
            patient_email: editEmail,
            reason: editReason,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to save details');
      }

      if (scheduleChanged) {
        const res = await fetch(`/api/appointment/admin/${appt.id}/reschedule`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: editDate, slot: editSlot }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to reschedule');
      }

      showToast('success', 'Appointment details saved.');
      onChanged();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSavingDetails(false);
    }
  };

  const toggleHistory = async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    if (!appt.patient_id) return;
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/patients/${appt.patient_id}/history`, { credentials: 'include' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to load history');
      setHistoryVisits(result.visits || []);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load patient history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const shareOnWhatsApp = async (prescriptionId: string) => {
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}/share-whatsapp`, {
        method: 'POST',
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to share');
      showToast('success', 'Prescription shared with patient on WhatsApp.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to share prescription');
    }
  };

  const deletePrescriptionAction = async (prescriptionId: string) => {
    if (!confirm('Delete this prescription? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete prescription');
      showToast('success', 'Prescription deleted.');
      onChanged();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete prescription');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {mode === 'edit' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AdminInput label="Patient Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <AdminInput label="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            <AdminInput label="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            <AdminInput label="Doctor" value={doctorName} onChange={() => {}} disabled />
            <AdminInput
              label="Day"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <AdminSelect
              label="Time"
              value={editSlot}
              onChange={(e) => setEditSlot(e.target.value)}
              options={slots.map((s) => ({ value: s, label: s }))}
            />
            <div className="sm:col-span-2">
              <AdminTextarea
                label="Reason for Consultation"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <Button onClick={saveDetails} disabled={savingDetails} variant="primary" size="xs">
            {savingDetails ? 'Saving...' : 'Save Details'}
          </Button>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Details</h4>
            {onRequestEdit && (
              <button
                type="button"
                onClick={onRequestEdit}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Patient Name</span>
              <span className="text-gray-900 dark:text-white">{appt.patient_name}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Phone</span>
              <span className="text-gray-900 dark:text-white">{appt.patient_phone}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Email</span>
              <span className="text-gray-900 dark:text-white">{appt.patient_email || '—'}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Doctor</span>
              <span className="text-gray-900 dark:text-white">{doctorName}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Visit</span>
              <span className="text-gray-900 dark:text-white">
                {appt.appointment_date}
                {appt.slot_start ? ` · ${appt.slot_start}` : ' · Walk-in'}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Status</span>
              <span className="text-gray-900 dark:text-white capitalize">{appt.status}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs text-gray-400 dark:text-gray-500">Reason for Consultation</span>
              <span className="text-gray-900 dark:text-white">{appt.reason}</span>
            </div>
          </div>

          {appt.patient_id && (
            <button
              type="button"
              onClick={toggleHistory}
              className="mt-3 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer"
            >
              {showHistory ? 'Hide Patient History' : 'View Patient History'}
            </button>
          )}

          {showHistory && (
            <div className="mt-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
              <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Visit History</h5>
              {historyLoading ? (
                <p className="text-xs text-gray-500">Loading...</p>
              ) : historyVisits.length === 0 ? (
                <p className="text-xs text-gray-500">No visits found.</p>
              ) : (
                <ul className="space-y-2">
                  {historyVisits.map((v) => (
                    <li key={v.id} className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-medium">
                        {v.date} {v.slot}
                      </span>{' '}
                      — {v.doctorName} — {v.reason} ({v.status})
                      {v.prescription?.pdfUrl && (
                        <>
                          {' '}
                          ·{' '}
                          <a
                            href={v.prescription.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            Rx PDF
                          </a>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Prescription section — read-only result here; writing/editing one
          happens in its own modal opened from the row's 3-dot menu. */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        {!appt.patient_id ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This appointment was booked before the patient system existed, so no prescription can
            be linked to it.
          </p>
        ) : !started ? (
          <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
            <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" weight="bold" />
            <span>
              Prescription actions unlock once this appointment begins — {appt.appointment_date} at{' '}
              {appt.slot_start}.
            </span>
          </div>
        ) : appt.prescription ? (
          <div className="flex flex-wrap items-center gap-3">
            {appt.prescription.pdfUrl && (
              <a
                href={appt.prescription.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline font-medium"
              >
                View PDF
              </a>
            )}
            <button
              onClick={onRequestPrescribe}
              className="text-sm text-gray-700 dark:text-gray-300 hover:underline font-medium"
            >
              Edit Prescription
            </button>
            <button
              onClick={() => shareOnWhatsApp(appt.prescription!.id)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
              title="Share this prescription with the patient on WhatsApp"
            >
              Share on WhatsApp
            </button>
            <button
              onClick={() => deletePrescriptionAction(appt.prescription!.id)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
              title="Permanently delete this prescription"
            >
              Delete
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No prescription yet — use the row's <span className="font-medium">⋮ menu</span> to add
            one.
          </p>
        )}
      </div>

      {appt.patient_id && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <BillingPanel appointmentId={appt.id} patientId={appt.patient_id} doctorId={appt.doctor_id} />
        </div>
      )}
    </div>
  );
}
