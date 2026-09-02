'use client';

import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import type { CMSData } from '@/lib/cms';
import { DataTable, type DataTableFilter } from '@/components/ui/data-table';
import AppointmentDetailsPanel, { type Appointment } from '@/components/admin/AppointmentDetailsPanel';

interface AppointmentsViewProps {
  doctors: NonNullable<CMSData['doctors']>['items'];
}

export default function AppointmentsView({ doctors }: AppointmentsViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doctorName = (id: string) => doctors.find((d) => d.id === id)?.name || 'Unknown doctor';

  const columns: ColumnDef<Appointment>[] = [
    {
      id: 'when',
      header: 'Date & Time',
      accessorFn: (row) => `${row.appointment_date} ${row.slot_start}`,
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {row.original.appointment_date} at {row.original.slot_start}
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              row.original.status === 'confirmed'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {row.original.status}
          </span>
          {row.original.prescription && (
            <span className="px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-semibold uppercase">
              Rx on file
            </span>
          )}
        </div>
      ),
      enableSorting: false,
    },
  ];

  const filters: DataTableFilter[] = [
    {
      columnId: 'status',
      placeholder: 'All statuses',
      options: [
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
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
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Every booking across all doctors, past and upcoming — click a row for details, editing,
          and prescriptions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={appointments}
        searchColumnId="patient_name"
        searchPlaceholder="Search by patient name..."
        filters={filters}
        emptyMessage="No upcoming appointments."
        renderExpandedRow={(appt) => (
          <AppointmentDetailsPanel
            appointment={appt}
            doctorName={doctorName(appt.doctor_id)}
            onChanged={fetchAppointments}
          />
        )}
      />
    </div>
  );
}
