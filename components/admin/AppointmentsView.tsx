'use client';

import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Play } from 'lucide-react';
import type { CMSData } from '@/lib/cms';
import { DataTable, type DataTableFilter } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AppointmentDetailsPanel, { type Appointment } from '@/components/admin/AppointmentDetailsPanel';
import WalkInModal from '@/components/admin/WalkInModal';
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

  const queue = appointments.filter((a) => a.status === 'confirmed');
  const finished = appointments.filter((a) => a.status === 'finished');
  const cancelled = appointments.filter((a) => a.status === 'cancelled');
  const tabData = tab === 'queue' ? queue : tab === 'finished' ? finished : cancelled;

  const columns: ColumnDef<Appointment>[] = [
    {
      id: 'when',
      header: 'Date & Time',
      accessorFn: (row) => `${row.appointment_date} ${row.slot_start || ''}`,
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {row.original.appointment_date}
          {row.original.slot_start ? ` at ${row.original.slot_start}` : ''}
          {row.original.is_walk_in && (
            <span className="ml-2 px-1.5 py-0.5 rounded bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300 text-[10px] font-semibold uppercase align-middle">
              Walk-in
            </span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'patient_name',
      header: 'Patient',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.original.patient_name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.patient_phone}</div>
        </div>
      ),
    },
    {
      id: 'doctor',
      header: 'Doctor',
      accessorFn: (row) => doctorName(row.doctor_id),
      cell: ({ row }) => <span className="whitespace-nowrap">{doctorName(row.original.doctor_id)}</span>,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <span className="block max-w-xs truncate">{row.original.reason}</span>,
      enableSorting: false,
    },
    {
      id: 'rx',
      header: 'Status',
      cell: ({ row }) =>
        row.original.prescription ? (
          <span className="px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-semibold uppercase">
            Rx on file
          </span>
        ) : null,
      enableSorting: false,
    },
  ];

  const filters: DataTableFilter[] = [
    {
      columnId: 'doctor',
      placeholder: 'All doctors',
      options: doctors.map((d) => ({ value: d.name, label: d.name })),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Booked appointments and walk-ins share one queue — click a row for details, editing,
            prescriptions, and billing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowWalkIn(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm font-semibold cursor-pointer flex-shrink-0"
        >
          <Play className="w-4 h-4" fill="currentColor" />
          Start Walk-in Consultation
        </button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queue">Queue ({queue.length})</TabsTrigger>
          <TabsTrigger value="finished">Finished ({finished.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <DataTable
            columns={columns}
            data={tabData}
            searchColumnId="patient_name"
            searchPlaceholder="Search by patient name..."
            filters={filters}
            emptyMessage={`No ${tab === 'queue' ? 'appointments in the queue' : tab} right now.`}
            renderExpandedRow={(appt) => (
              <AppointmentDetailsPanel
                appointment={appt}
                doctorName={doctorName(appt.doctor_id)}
                onChanged={fetchAppointments}
              />
            )}
          />
        </TabsContent>
      </Tabs>

      {showWalkIn && (
        <WalkInModal
          doctors={doctors}
          onClose={() => setShowWalkIn(false)}
          onStarted={() => {
            setShowWalkIn(false);
            setTab('queue');
            fetchAppointments();
            showToast('success', 'Consultation started — open the new row in the Queue to add symptoms and a prescription.');
          }}
        />
      )}
    </div>
  );
}
