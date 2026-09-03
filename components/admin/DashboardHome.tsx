'use client';

import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';

interface TodayAppointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  slot_start: string | null;
  reason: string;
  doctor_id: string;
  status: 'confirmed' | 'finished' | 'cancelled';
  is_walk_in: boolean;
  appointment_date: string;
}

interface DashboardHomeProps {
  doctors: { id: string; name: string }[];
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  finished: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};

// The landing view of the admin dashboard (MEDISRAY_AUDIT.md-style "at a
// glance" home) — a greeting plus today's full appointment queue with a
// status breakdown, so staff don't have to click into Appointments just to
// see how the day looks.
export default function DashboardHome({ doctors }: DashboardHomeProps) {
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const doctorName = (id: string) => doctors.find((d) => d.id === id)?.name || 'Unknown doctor';
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchToday = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/appointment/list', { credentials: 'include' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load appointments');
        const todays = ((result.appointments || []) as TodayAppointment[]).filter(
          (a) => a.appointment_date === today
        );
        setAppointments(todays);
      } catch (err) {
        console.error('Failed to fetch today\'s schedule:', err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, [today]);

  const counts = {
    total: appointments.length,
    queue: appointments.filter((a) => a.status === 'confirmed').length,
    finished: appointments.filter((a) => a.status === 'finished').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const columns: ColumnDef<TodayAppointment>[] = [
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
      id: 'time',
      header: 'Time',
      accessorFn: (row) => row.slot_start || '',
      cell: ({ row }) => (
        <span className="text-xs whitespace-nowrap">
          {row.original.slot_start || (row.original.is_walk_in ? 'Walk-in' : '—')}
        </span>
      ),
    },
    {
      id: 'doctor',
      header: 'Doctor',
      accessorFn: (row) => doctorName(row.doctor_id),
      cell: ({ row }) => <span className="text-xs whitespace-nowrap">{doctorName(row.original.doctor_id)}</span>,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <span className="block max-w-[12rem] truncate text-xs" title={row.original.reason}>{row.original.reason}</span>,
      enableSorting: false,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${STATUS_STYLES[row.original.status]}`}
        >
          {row.original.status === 'confirmed' ? 'In Queue' : row.original.status}
        </span>
      ),
      enableSorting: false,
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
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}, Dr Baig's Clinic</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here's how today —{' '}
          {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} — looks so
          far.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Today</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">In Queue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.queue}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Finished</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.finished}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cancelled</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.cancelled}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          Today's Schedule
        </h3>
        <DataTable
          columns={columns}
          data={appointments}
          searchColumnId="patient_name"
          searchPlaceholder="Search by patient name..."
          emptyMessage="No appointments scheduled for today."
        />
      </div>
    </div>
  );
}
