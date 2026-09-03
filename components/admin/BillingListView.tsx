'use client';

import { useEffect, useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Printer, Pencil } from 'lucide-react';
import { DataTable, type DataTableFilter } from '@/components/ui/data-table';
import Modal from '@/components/Modal';
import InvoiceEditor from '@/components/admin/InvoiceEditor';
import type { Invoice } from '@/lib/invoices';

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  billDate: string;
  appointmentId: string | null;
  patientId: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientCode: string | null;
  patientPhone: string | null;
  totalPayable: number;
  paidAmount: number;
  pdfUrl: string | null;
}

// Top-level Billing tab — every invoice across all patients, matching
// Medisray's own billing screen (MEDISRAY_AUDIT.md finding #6). Bills are
// still created/edited from the appointment they belong to; this is the
// clinic-wide view for finding and following up on any bill.
export default function BillingListView() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<InvoiceRow | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices/list', { credentials: 'include' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setInvoices(result.invoices || []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openEditor = async (row: InvoiceRow) => {
    try {
      const res = await fetch(`/api/invoices/${row.id}`, { credentials: 'include' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setEditingRow(row);
      setEditingInvoice(result.invoice);
    } catch (err) {
      console.error('Failed to load invoice:', err);
    }
  };

  const filters: DataTableFilter[] = useMemo(() => {
    const doctorNames = Array.from(new Set(invoices.map((i) => i.doctorName).filter(Boolean)));
    return [
      {
        columnId: 'doctorName',
        placeholder: 'All doctors',
        options: doctorNames.map((name) => ({ value: name, label: name })),
      },
    ];
  }, [invoices]);

  const columns: ColumnDef<InvoiceRow>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-primary-600 dark:text-primary-400">{row.original.invoiceNumber}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(row.original.billDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.original.patientName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.patientCode}</div>
        </div>
      ),
    },
    {
      accessorKey: 'doctorName',
      header: 'Doctor',
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.doctorName}</span>,
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
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.pdfUrl && (
            <a
              href={row.original.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Print / view bill"
            >
              <Printer className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => openEditor(row.original)}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer"
            title="Edit bill"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      ),
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Every bill across all patients. New bills are created from the patient's appointment —
          use this view to find and follow up on existing ones.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchColumnId="patientName"
        searchPlaceholder="Search by patient name..."
        filters={filters}
        emptyMessage="No bills created yet."
      />

      {editingRow && editingInvoice && (
        <Modal
          isOpen
          onClose={() => {
            setEditingRow(null);
            setEditingInvoice(null);
          }}
          title={`Edit Bill — ${editingRow.invoiceNumber}`}
        >
          <InvoiceEditor
            appointmentId={editingRow.appointmentId}
            patientId={editingRow.patientId}
            doctorId={editingRow.doctorId}
            initial={editingInvoice}
            onClose={() => {
              setEditingRow(null);
              setEditingInvoice(null);
            }}
            onSaved={() => {
              setEditingRow(null);
              setEditingInvoice(null);
              fetchInvoices();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
