'use client';

import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Printer, CalendarBlank, FileText, Receipt } from '@phosphor-icons/react';
import { formatShortDate } from '@/lib/format-date';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PrescriptionSummary from '@/components/admin/PrescriptionSummary';

interface Visit {
  id: string;
  date: string;
  slot: string | null;
  status: string;
  reason: string;
  doctorName: string;
  prescription: {
    id: string;
    diagnosis: string | null;
    symptoms?: { value: string; since?: string }[];
    medications?: { name: string; dosage: string; frequency: string; duration: string }[];
    investigations?: string[];
    advices?: string[];
    followUpDate?: string | null;
    pdfUrl: string | null;
  } | null;
}

interface BillingRow {
  id: string;
  invoiceNumber: string;
  billDate: string;
  totalPayable: number;
  paidAmount: number;
  pdfUrl: string | null;
}

interface PatientDetailsData {
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    patient_code: string;
    gender: string | null;
    date_of_birth: string | null;
    blood_group: string | null;
  };
  visits: Visit[];
  billing: BillingRow[];
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Queued',
  finished: 'Finished',
  cancelled: 'Cancelled',
};

// Full-page patient details (not a modal — MEDISRAY_AUDIT.md finding #7 /
// user feedback: a modal doesn't scale once visit/prescription/billing
// history grows). Uses the shared DataTable everywhere a list is shown.
export default function PatientDetailPage({ patientId, onBack }: { patientId: string; onBack: () => void }) {
  const [data, setData] = useState<PatientDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('visits');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/patients/${patientId}/history`, { credentials: 'include' })
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  const visitColumns: ColumnDef<Visit>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatShortDate(row.original.date)}
          {row.original.slot ? ` · ${row.original.slot}` : ''}
        </span>
      ),
    },
    { accessorKey: 'doctorName', header: 'Doctor' },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <span className="block max-w-xs truncate" title={row.original.reason}>{row.original.reason}</span>,
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {STATUS_LABEL[row.original.status] || row.original.status}
        </span>
      ),
    },
    {
      id: 'rx',
      header: 'Prescription',
      cell: ({ row }) =>
        row.original.prescription ? (
          row.original.prescription.pdfUrl ? (
            <a
              href={row.original.prescription.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline text-xs font-semibold"
            >
              View Prescription
            </a>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-semibold uppercase">
              Rx on file
            </span>
          )
        ) : (
          <span className="text-xs text-gray-400">No prescription created yet</span>
        ),
      enableSorting: false,
    },
  ];

  const billingColumns: ColumnDef<BillingRow>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-primary-600 dark:text-primary-400">{row.original.invoiceNumber}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatShortDate(row.original.billDate)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalPayable',
      header: 'Billed',
      cell: ({ row }) => <span>₹{row.original.totalPayable.toFixed(2)}</span>,
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid',
      cell: ({ row }) => <span>₹{row.original.paidAmount.toFixed(2)}</span>,
    },
    {
      id: 'due',
      header: 'Due',
      cell: ({ row }) => {
        const due = row.original.totalPayable - row.original.paidAmount;
        return (
          <span className={due > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-400'}>
            ₹{Math.max(due, 0).toFixed(2)}
          </span>
        );
      },
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
            title="Print / view bill"
          >
            <Printer className="w-4 h-4" />
          </a>
        ) : null,
      enableSorting: false,
    },
  ];

  const prescriptionVisits = data?.visits.filter((v) => v.prescription) || [];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data?.patient ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Could not load this patient.</p>
      ) : (
        <>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{data.patient.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{data.patient.patient_code}</span>
              <span>{data.patient.phone}</span>
              {data.patient.email && <span>{data.patient.email}</span>}
              {data.patient.gender && <span>{data.patient.gender}</span>}
              {data.patient.date_of_birth && <span>DOB: {data.patient.date_of_birth}</span>}
              {data.patient.blood_group && <span>Blood: {data.patient.blood_group}</span>}
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="visits">
                <CalendarBlank /> Visits ({data.visits.length})
              </TabsTrigger>
              <TabsTrigger value="prescriptions">
                <FileText /> Prescriptions ({prescriptionVisits.length})
              </TabsTrigger>
              <TabsTrigger value="billing">
                <Receipt /> Billing ({data.billing.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visits">
              <DataTable
                columns={visitColumns}
                data={data.visits}
                emptyMessage="No visits yet."
                searchColumnId="reason"
                searchPlaceholder="Search by reason..."
              />
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-3">
              {prescriptionVisits.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No prescriptions yet.</p>
              ) : (
                prescriptionVisits.map((v) => (
                  <PrescriptionSummary key={v.id} prescription={v.prescription!} date={v.date} doctorName={v.doctorName} />
                ))
              )}
            </TabsContent>

            <TabsContent value="billing">
              <DataTable
                columns={billingColumns}
                data={data.billing}
                emptyMessage="No bills yet."
                searchColumnId="invoiceNumber"
                searchPlaceholder="Search by invoice number..."
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
