'use client';

import { useEffect, useState } from 'react';
import { Plus, Printer, Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import InvoiceEditor from '@/components/admin/InvoiceEditor';
import type { Invoice } from '@/lib/invoices';

interface BillingPanelProps {
  appointmentId: string;
  patientId: string;
  doctorId: string;
}

// "View/Create Bill" (MEDISRAY_AUDIT.md finding #6) — lists invoices already
// created for this visit, with Create/Edit/Print, all manual record-keeping
// (no payment gateway).
export default function BillingPanel({ appointmentId, patientId, doctorId }: BillingPanelProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Invoice | null | 'new'>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices?appointmentId=${appointmentId}`, { credentials: 'include' });
      const result = await res.json();
      if (res.ok) setInvoices(result.invoices || []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  if (editing) {
    return (
      <Modal isOpen onClose={() => setEditing(null)} title={editing === 'new' ? 'Create Bill' : 'Edit Bill'} size="xl">
        <InvoiceEditor
          appointmentId={appointmentId}
          patientId={patientId}
          doctorId={doctorId}
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            fetchInvoices();
          }}
        />
      </Modal>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 dark:text-white">Bills</h4>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Bill
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No bills created for this visit yet.</p>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{inv.invoice_number}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(inv.bill_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                <span>Billed ₹{inv.total_payable.toFixed(2)}</span>
                <span>Paid ₹{inv.paid_amount.toFixed(2)}</span>
                <span className={inv.total_payable - inv.paid_amount > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
                  Due ₹{Math.max(inv.total_payable - inv.paid_amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {inv.pdf_url && (
                  <a
                    href={inv.pdf_url}
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
                  onClick={() => setEditing(inv)}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer"
                  title="Edit bill"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
