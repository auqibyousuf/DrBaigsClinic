'use client';

import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Play, Eye, PencilSimple, CheckCircle, Prohibit, TrashSimple, FileText, ListChecks, XCircle } from '@phosphor-icons/react';
import type { CMSData } from '@/lib/cms';
import { formatShortDate } from '@/lib/format-date';
import { DataTable, type DataTableFilter } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AppointmentDetailsPanel, { hasStarted, type Appointment } from '@/components/admin/AppointmentDetailsPanel';
import PrescriptionEditor from '@/components/admin/PrescriptionEditor';
import WalkInModal from '@/components/admin/WalkInModal';
import DropdownMenu from '@/components/admin/DropdownMenu';
import { useToast } from '@/components/ToastProvider';

interface AppointmentsViewProps {
  doctors: NonNullable<CMSData['doctors']>['items'];
}

// Queue / Finished / Cancelled (MEDISRAY_AUDIT.md finding #1) — a booked
// appointment and a walk-in both land in the same Queue; there's no
// time-gating, staff just work the row whenever the patient is ready (see
// finding #1a). "Finished" is set automatically once a prescription is
// saved (the app's "End Visit" moment), or manually if a visit needs no Rx.
export default function AppointmentsView({ doctors }: AppointmentsViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('queue');
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [autoOpenId, setAutoOpenId] = useState<string | null>(null);
  // Which mode each expanded row shows — Details (read-only) vs Edit
  // (editable fields). The row's 3-dot menu picks this directly instead of
  // "Details" silently also being editable.
  const [modeByRow, setModeByRow] = useState<Record<string, 'details' | 'edit'>>({});
  // Writing/editing a prescription replaces this whole view with a full
  // page (not a modal) — matches how Patient/Doctor detail pages work, and
  // gives the consultation editor room to breathe instead of being cramped
  // in a popup.
  const [prescribingId, setPrescribingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointment/list', { credentials: 'include' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to load appointments');
      setAppointments(result.appointments || []);
    } catch (err) {
      // Not meaningful to an admin end user (e.g. a raw Supabase schema-cache
      // message) — log it for us and just fall through to the table's own
      // "no results" state rather than a scary dedicated error panel.
      console.error('Failed to fetch appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const doctorName = (id: string) => doctors.find((d) => d.id === id)?.name || 'Unknown doctor';

  const handleFinish = async (id: string) => {
    try {
      const res = await fetch(`/api/appointment/admin/${id}/finish`, { method: 'POST', credentials: 'include' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to finish visit');
      showToast('success', 'Visit marked finished.');
      fetchAppointments();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to finish visit');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment? The patient will be notified.')) return;
    try {
      const res = await fetch(`/api/appointment/admin/${id}/cancel`, { method: 'POST', credentials: 'include' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to cancel');
      showToast('success', 'Appointment cancelled and patient notified.');
      fetchAppointments();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this appointment and any linked prescription? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/appointment/admin/${id}`, { method: 'DELETE', credentials: 'include' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete');
      showToast('success', 'Appointment deleted.');
      fetchAppointments();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete appointment');
    }
  };

  const queue = appointments.filter((a) => a.status === 'confirmed');
  const finished = appointments.filter((a) => a.status === 'finished');
  const cancelled = appointments.filter((a) => a.status === 'cancelled');
  const tabData = tab === 'queue' ? queue : tab === 'finished' ? finished : cancelled;

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'patient_name',
      header: 'Patient',
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900 dark:text-white text-sm">{row.original.patient_name}</div>
          <div className="text-gray-500 dark:text-gray-400">{row.original.patient_phone}</div>
        </div>
      ),
    },
    {
      id: 'when',
      header: 'Visit',
      accessorFn: (row) => `${row.appointment_date} ${row.slot_start || ''}`,
      cell: ({ row }) => (
        <div className="text-xs whitespace-nowrap">
          <div className="text-gray-900 dark:text-white">
            {formatShortDate(row.original.appointment_date)}
            {row.original.slot_start ? ` · ${row.original.slot_start}` : ''}
          </div>
          <div className="text-gray-500 dark:text-gray-400">{doctorName(row.original.doctor_id)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <span className="block max-w-[10rem] truncate text-xs">{row.original.reason}</span>,
      enableSorting: false,
    },
    {
      id: 'status',
      header: '',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 justify-end">
          {row.original.is_walk_in && (
            <span className="px-1.5 py-0.5 rounded bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300 text-[10px] font-semibold uppercase">
              Walk-in
            </span>
          )}
          {row.original.prescription && (
            <span className="px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-semibold uppercase">
              Rx
            </span>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const appt = row.original;
        const openAs = (nextMode: 'details' | 'edit') => {
          const isExpanded = row.getIsExpanded();
          const sameMode = modeByRow[appt.id] === nextMode;
          if (isExpanded && sameMode) {
            row.toggleExpanded(); // already showing this mode — collapse instead
            return;
          }
          setModeByRow((prev) => ({ ...prev, [appt.id]: nextMode }));
          if (!isExpanded) row.toggleExpanded();
        };
        return (
          <div className="flex justify-end">
            <DropdownMenu
              actions={[
                { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => openAs('details') },
                { label: 'Edit', icon: <PencilSimple className="w-4 h-4" />, onClick: () => openAs('edit') },
                {
                  label: appt.prescription ? 'Edit Prescription' : 'Add Prescription',
                  icon: <FileText className="w-4 h-4" />,
                  hidden: !appt.patient_id || !hasStarted(appt),
                  onClick: () => setPrescribingId(appt.id),
                },
                {
                  label: 'Finish Visit',
                  icon: <CheckCircle className="w-4 h-4" />,
                  hidden: appt.status !== 'confirmed',
                  onClick: () => handleFinish(appt.id),
                },
                {
                  label: 'Cancel Appointment',
                  icon: <Prohibit className="w-4 h-4" />,
                  hidden: appt.status !== 'confirmed',
                  danger: true,
                  onClick: () => handleCancel(appt.id),
                },
                {
                  label: 'Delete Permanently',
                  icon: <TrashSimple className="w-4 h-4" />,
                  danger: true,
                  onClick: () => handleDelete(appt.id),
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  // Doctor is embedded in the "Visit" column rather than its own column now
  // (fewer, denser columns) — search already matches doctor name, so a
  // separate non-functional dropdown filter isn't worth keeping.
  const filters: DataTableFilter[] = [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const prescribingAppt = prescribingId ? appointments.find((a) => a.id === prescribingId) || null : null;
  if (prescribingAppt) {
    return (
      <PrescriptionEditor
        appointmentId={prescribingAppt.id}
        context={{
          patientName: prescribingAppt.patient_name,
          patientPhone: prescribingAppt.patient_phone,
          date: prescribingAppt.appointment_date,
          slot: prescribingAppt.slot_start || 'Walk-in',
          reason: prescribingAppt.reason,
        }}
        initial={
          prescribingAppt.prescription
            ? {
                diagnosis: prescribingAppt.prescription.diagnosis,
                medications: prescribingAppt.prescription.medications,
                symptoms: prescribingAppt.prescription.symptoms,
                examinations: prescribingAppt.prescription.examinations,
                investigations: prescribingAppt.prescription.investigations,
                advices: prescribingAppt.prescription.advices,
                vitals: prescribingAppt.prescription.vitals,
                follow_up_date: prescribingAppt.prescription.follow_up_date,
                additional_notes: prescribingAppt.prescription.additional_notes,
                private_notes: prescribingAppt.prescription.private_notes,
                medical_history_tags: prescribingAppt.prescription.medical_history_tags,
                medical_history_no_known: prescribingAppt.prescription.medical_history_no_known,
                medical_records: prescribingAppt.prescription.medical_records,
                notes: prescribingAppt.prescription.notes,
              }
            : null
        }
        onClose={() => setPrescribingId(null)}
        onSaved={async () => {
          setPrescribingId(null);
          await fetchAppointments();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Booked appointments and walk-ins share one queue — use the actions menu on a row for
            details, editing, prescriptions, and billing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowWalkIn(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm font-semibold cursor-pointer w-full md:w-auto md:flex-shrink-0"
        >
          <Play className="w-4 h-4" weight="fill" />
          Start Walk-in Consultation
        </button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queue">
            <ListChecks /> Queue ({queue.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            <CheckCircle /> Finished ({finished.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            <XCircle /> Cancelled ({cancelled.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <DataTable
            columns={columns}
            data={tabData}
            searchColumnId="patient_name"
            searchPlaceholder="Search by patient name..."
            filters={filters}
            emptyMessage={`No ${tab === 'queue' ? 'appointments in the queue' : tab} right now.`}
            getRowId={(appt) => appt.id}
            autoExpandRowId={autoOpenId}
            manualExpandControl
            renderExpandedRow={(appt) => (
              <AppointmentDetailsPanel
                appointment={appt}
                doctorName={doctorName(appt.doctor_id)}
                onChanged={fetchAppointments}
                mode={appt.id === autoOpenId ? 'details' : modeByRow[appt.id] || 'details'}
                onRequestEdit={() => setModeByRow((prev) => ({ ...prev, [appt.id]: 'edit' }))}
                onRequestPrescribe={() => setPrescribingId(appt.id)}
              />
            )}
          />
        </TabsContent>
      </Tabs>

      {showWalkIn && (
        <WalkInModal
          doctors={doctors}
          onClose={() => setShowWalkIn(false)}
          onStarted={async (appointmentId) => {
            setShowWalkIn(false);
            setTab('queue');
            await fetchAppointments();
            setAutoOpenId(appointmentId);
            // Matches Medisray's "Consult" click going straight into the
            // Digital-Rx screen instead of a separate step.
            setPrescribingId(appointmentId);
          }}
        />
      )}
    </div>
  );
}
