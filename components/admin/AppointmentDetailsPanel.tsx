'use client';

import { useState } from 'react';
import { Lock } from '@phosphor-icons/react';
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
function hasStarted(appt: Appointment): boolean {
  if (appt.is_walk_in || !appt.slot_start) return true;
  return new Date(`${appt.appointment_date}T${appt.slot_start}:00`) <= new Date();
}

interface AppointmentDetailsPanelProps {
  appointment: Appointment;
  doctorName: string;
  onChanged: () => void;
}

export default function AppointmentDetailsPanel({
  appointment: appt,
  doctorName,
  onChanged,
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

  const [prescribing, setPrescribing] = useState(false);
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

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment? The patient will be notified.')) return;
    try {
      const res = await fetch(`/api/appointment/admin/${appt.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to cancel');
      showToast('success', 'Appointment cancelled and patient notified.');
      onChanged();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  };

  const handleFinish = async () => {
    try {
      const res = await fetch(`/api/appointment/admin/${appt.id}/finish`, {
        method: 'POST',
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to finish visit');
      showToast('success', 'Visit marked finished.');
      onChanged();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to finish visit');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this appointment and any linked prescription? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/appointment/admin/${appt.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete');
      showToast('success', 'Appointment deleted.');
      onChanged();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete appointment');
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
      {/* Editable patient/visit details */}
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

      <div className="flex flex-wrap gap-2">
        <Button onClick={saveDetails} disabled={savingDetails} variant="primary" size="sm">
          {savingDetails ? 'Saving...' : 'Save Details'}
        </Button>
        {appt.status === 'confirmed' && (
          <>
            <Button
              onClick={handleFinish}
              variant="outline"
              size="sm"
              title="Mark this visit finished — moves it out of the Queue (also happens automatically when a prescription is saved)"
            >
              Finish Visit
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="!text-red-600 !border-red-300"
              title="Mark as cancelled and notify the patient — keeps a record"
            >
              Cancel Appointment
            </Button>
          </>
        )}
        <Button
          onClick={handleDelete}
          variant="outline"
          size="sm"
          className="!text-red-700 !border-red-400"
          title="Permanently remove this appointment and its prescription — no record kept"
        >
          Delete
        </Button>
        {appt.patient_id && (
          <Button onClick={toggleHistory} variant="outline" size="sm">
            {showHistory ? 'Hide History' : 'View Patient History'}
          </Button>
        )}
      </div>

      {/* Prescription section — only actionable once the appointment has started */}
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
              Prescription actions (create/edit/view/share/delete) unlock once this appointment
              begins — {appt.appointment_date} at {appt.slot_start}.
            </span>
          </div>
        ) : prescribing ? (
          <PrescriptionEditor
            appointmentId={appt.id}
            context={{
              patientName: appt.patient_name,
              patientPhone: appt.patient_phone,
              date: appt.appointment_date,
              slot: appt.slot_start || 'Walk-in',
              reason: appt.reason,
            }}
            initial={
              appt.prescription
                ? {
                    diagnosis: appt.prescription.diagnosis,
                    medications: appt.prescription.medications,
                    symptoms: appt.prescription.symptoms,
                    examinations: appt.prescription.examinations,
                    investigations: appt.prescription.investigations,
                    advices: appt.prescription.advices,
                    vitals: appt.prescription.vitals,
                    follow_up_date: appt.prescription.follow_up_date,
                    additional_notes: appt.prescription.additional_notes,
                    private_notes: appt.prescription.private_notes,
                    notes: appt.prescription.notes,
                  }
                : null
            }
            onClose={() => setPrescribing(false)}
            onSaved={() => {
              setPrescribing(false);
              onChanged();
            }}
          />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setPrescribing(true)} variant="primary" size="sm">
              {appt.prescription ? 'Edit Prescription' : 'Add Prescription'}
            </Button>
            {appt.prescription?.pdfUrl && (
              <>
                <a
                  href={appt.prescription.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline font-medium"
                >
                  View PDF
                </a>
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
              </>
            )}
          </div>
        )}
      </div>

      {appt.patient_id && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <BillingPanel appointmentId={appt.id} patientId={appt.patient_id} doctorId={appt.doctor_id} />
        </div>
      )}

      {showHistory && (
        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
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
  );
}
