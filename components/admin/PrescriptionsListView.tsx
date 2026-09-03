'use client';

import { useEffect, useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { CalendarCheck } from '@phosphor-icons/react';
import { DataTable, type DataTableFilter } from '@/components/ui/data-table';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import PrescriptionEditor from '@/components/admin/PrescriptionEditor';

interface PrescriptionRow {
  id: string;
  createdAt: string;
  diagnosis: string | null;
  pdfUrl: string | null;
  doctorName: string;
  patientName: string;
  patientCode: string | null;
  patientPhone: string | null;
  appointmentDate: string | null;
  slot: string | null;
}

interface AppointmentRow {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_phone: string;
  reason: string;
  doctor_id: string;
  appointment_date: string;
  slot_start: string | null;
  status: 'confirmed' | 'finished' | 'cancelled';
  is_walk_in: boolean;
  prescription: { id: string } | null;
}

const columns: ColumnDef<PrescriptionRow>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date Written',
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'visit',
    header: 'Visit',
    accessorFn: (row) => (row.appointmentDate ? `${row.appointmentDate} ${row.slot}` : ''),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.appointmentDate ? `${row.original.appointmentDate} ${row.original.slot}` : '—'}
      </span>
    ),
  },
  {
    accessorKey: 'patientName',
    header: 'Patient',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{row.original.patientName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {row.original.patientCode} {row.original.patientPhone && `· ${row.original.patientPhone}`}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'doctorName',
    header: 'Doctor',
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.doctorName}</span>,
  },
  {
    accessorKey: 'diagnosis',
    header: 'Diagnosis',
    cell: ({ row }) => (
      <span className="block max-w-xs truncate">{row.original.diagnosis || '—'}</span>
    ),
    enableSorting: false,
  },
  {
    id: 'pdf',
    header: 'PDF',
    cell: ({ row }) =>
      row.original.pdfUrl ? (
        <a
          href={row.original.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline font-medium"
        >
          View
        </a>
      ) : (
        '—'
      ),
    enableSorting: false,
  },
];

interface PrescriptionsListViewProps {
  doctors: { id: string; name: string }[];
}

export default function PrescriptionsListView({ doctors }: PrescriptionsListViewProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [pending, setPending] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [writingFor, setWritingFor] = useState<AppointmentRow | null>(null);

  const doctorName = (id: string) => doctors.find((d) => d.id === id)?.name || 'Unknown doctor';

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [presRes, apptRes] = await Promise.all([
        fetch('/api/prescriptions/list', { credentials: 'include' }),
        fetch('/api/appointment/list', { credentials: 'include' }),
      ]);
      const presResult = await presRes.json();
      const apptResult = await apptRes.json();
      if (!presRes.ok) throw new Error(presResult.error || 'Failed to load prescriptions');
      setPrescriptions(presResult.prescriptions || []);

      if (apptRes.ok) {
        const now = new Date();
        const eligible = ((apptResult.appointments || []) as AppointmentRow[]).filter(
          (appt) =>
            appt.status === 'confirmed' &&
            appt.patient_id &&
            !appt.prescription &&
            (appt.is_walk_in ||
              !appt.slot_start ||
              new Date(`${appt.appointment_date}T${appt.slot_start}:00`) <= now)
        );
        setPending(eligible);
      }
    } catch (err) {
      // Not meaningful to an admin end user (e.g. a raw Supabase schema-cache
      // message) — log it for us and just fall through to the table's own
      // "no results" state rather than a scary dedicated error panel.
      console.error('Failed to fetch prescriptions:', err);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters: DataTableFilter[] = useMemo(() => {
    const doctorNames = Array.from(new Set(prescriptions.map((p) => p.doctorName).filter(Boolean)));
    return [
      {
        columnId: 'doctorName',
        placeholder: 'All doctors',
        options: doctorNames.map((name) => ({ value: name, label: name })),
      },
    ];
  }, [prescriptions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Patients ready for a prescription, and every prescription already written.
        </p>
      </div>

      {/* Visits that have started but have no prescription yet — the whole
          point of surfacing this here is so the admin doesn't have to go
          hunt through the Appointments tab to find who still needs one. */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          Ready to Prescribe ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4">
            No completed visits are waiting on a prescription right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
            {pending.map((appt) => (
              <div
                key={appt.id}
                className="flex flex-col h-full min-h-[9.5rem] border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm"
              >
                <p className="font-medium text-gray-900 dark:text-white truncate">{appt.patient_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                  {doctorName(appt.doctor_id)} · {appt.appointment_date}
                  {appt.slot_start ? ` at ${appt.slot_start}` : ' · Walk-in'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">{appt.reason}</p>
                <Button
                  onClick={() => setWritingFor(appt)}
                  variant="primary"
                  size="sm"
                  icon={<CalendarCheck weight="bold" />}
                  className="w-full mt-auto"
                >
                  Write Prescription
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          Already Written ({prescriptions.length})
        </h3>
        <DataTable
          columns={columns}
          data={prescriptions}
          searchColumnId="patientName"
          searchPlaceholder="Search by patient name..."
          filters={filters}
          emptyMessage="No prescriptions written yet."
        />
      </div>

      <Modal isOpen={!!writingFor} onClose={() => setWritingFor(null)} title="Write Prescription">
        {writingFor && (
          <PrescriptionEditor
            appointmentId={writingFor.id}
            context={{
              patientName: writingFor.patient_name,
              patientPhone: writingFor.patient_phone,
              date: writingFor.appointment_date,
              slot: writingFor.slot_start || 'Walk-in',
              reason: writingFor.reason,
            }}
            initial={null}
            onClose={() => setWritingFor(null)}
            onSaved={() => {
              setWritingFor(null);
              fetchAll();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
