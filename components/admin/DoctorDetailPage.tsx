'use client';

import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, FileText, CalendarBlank, CheckCircle, XCircle } from '@phosphor-icons/react';
import { formatShortDate } from '@/lib/format-date';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AppointmentSummary {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  slot: string | null;
  reason: string;
}

interface PrescriptionSummary {
  id: string;
  patientName: string;
  date: string;
  diagnosis: string | null;
  pdfUrl: string | null;
}

interface DoctorSummary {
  upcoming: AppointmentSummary[];
  consulted: AppointmentSummary[];
  cancelled: AppointmentSummary[];
  prescriptions: PrescriptionSummary[];
}

const appointmentColumns: ColumnDef<AppointmentSummary>[] = [
  {
    accessorKey: 'patientName',
    header: 'Patient',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{row.original.patientName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.patientPhone}</div>
      </div>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Visit',
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatShortDate(row.original.date)}
        {row.original.slot ? ` · ${row.original.slot}` : ''}
      </span>
    ),
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => <span className="block max-w-xs truncate" title={row.original.reason}>{row.original.reason}</span>,
    enableSorting: false,
  },
];

// Full-page doctor details (not a modal — same rationale as
// PatientDetailPage): upcoming/consulted/cancelled appointments and
// prescriptions written, each as a real DataTable.
export default function DoctorDetailPage({
  doctorId,
  doctorName,
  onBack,
}: {
  doctorId: string;
  doctorName: string;
  onBack: () => void;
}) {
  const [data, setData] = useState<DoctorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/doctors/${doctorId}/summary`, { credentials: 'include' })
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const prescriptionColumns: ColumnDef<PrescriptionSummary>[] = [
    { accessorKey: 'patientName', header: 'Patient' },
    { accessorKey: 'date', header: 'Date' },
    {
      accessorKey: 'diagnosis',
      header: 'Diagnosis',
      cell: ({ row }) => <span className="block max-w-xs truncate" title={row.original.diagnosis || '—'}>{row.original.diagnosis || '—'}</span>,
      enableSorting: false,
    },
    {
      id: 'pdf',
      header: '',
      cell: ({ row }) =>
        row.original.pdfUrl ? (
          <a
            href={row.original.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex"
            title="View prescription PDF"
          >
            <FileText className="w-4 h-4" />
          </a>
        ) : null,
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Doctors
      </button>

      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{doctorName}</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Could not load this doctor's activity.</p>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="upcoming">
              <CalendarBlank /> Upcoming ({data.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="consulted">
              <CheckCircle /> Consulted ({data.consulted.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              <XCircle /> Cancelled ({data.cancelled.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <FileText /> Prescriptions ({data.prescriptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <DataTable columns={appointmentColumns} data={data.upcoming} emptyMessage="No upcoming appointments." searchColumnId="patientName" searchPlaceholder="Search by patient name..." />
          </TabsContent>
          <TabsContent value="consulted">
            <DataTable columns={appointmentColumns} data={data.consulted} emptyMessage="No patients consulted yet." searchColumnId="patientName" searchPlaceholder="Search by patient name..." />
          </TabsContent>
          <TabsContent value="cancelled">
            <DataTable columns={appointmentColumns} data={data.cancelled} emptyMessage="No cancelled appointments." searchColumnId="patientName" searchPlaceholder="Search by patient name..." />
          </TabsContent>
          <TabsContent value="prescriptions">
            <DataTable columns={prescriptionColumns} data={data.prescriptions} emptyMessage="No prescriptions written yet." searchColumnId="patientName" searchPlaceholder="Search by patient name..." />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
