'use client';

import { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { AdminInput, AdminSelect, AdminTextarea } from '@/components/admin/AdminField';
import type { DiscountType, InvoiceLineItem, Payment, Invoice } from '@/lib/invoices';

interface InvoiceEditorProps {
  appointmentId?: string | null;
  patientId: string;
  doctorId: string;
  initial?: Invoice | null;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
}

const emptyLineItem: InvoiceLineItem = {
  name: '',
  qty: 1,
  price_per_unit: 0,
  discount_type: 'flat',
  discount_value: 0,
  gst_percent: 0,
};

const PAYMENT_MODE_OPTIONS = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque'].map((v) => ({
  value: v,
  label: v,
}));

function lineItemTotal(item: InvoiceLineItem): number {
  const base = item.qty * item.price_per_unit;
  const discount = item.discount_type === 'percent' ? (base * item.discount_value) / 100 : item.discount_value;
  const afterDiscount = Math.max(base - discount, 0);
  return afterDiscount + (afterDiscount * item.gst_percent) / 100;
}

// Manual GST-aware invoice builder — no payment gateway, matches Medisray's
// "Create Bill" screen (MEDISRAY_AUDIT.md finding #6): line items with
// qty/price/discount(%/flat)/GST%, an extra bill-level discount, one or more
// payment-mode entries, and a computed totals panel.
export default function InvoiceEditor({
  appointmentId,
  patientId,
  doctorId,
  initial,
  onClose,
  onSaved,
}: InvoiceEditorProps) {
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    initial?.line_items?.length ? initial.line_items : [{ ...emptyLineItem }]
  );
  const [extraDiscountType, setExtraDiscountType] = useState<DiscountType>(
    initial?.extra_discount_type || 'flat'
  );
  const [extraDiscountValue, setExtraDiscountValue] = useState(initial?.extra_discount_value || 0);
  const [payments, setPayments] = useState<Payment[]>(
    initial?.payments?.length ? initial.payments : [{ mode: 'Cash', amount: 0 }]
  );
  const [notes, setNotes] = useState(initial?.notes || '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const updateItem = (index: number, partial: Partial<InvoiceLineItem>) => {
    setLineItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...partial } : item)));
  };

  const updatePayment = (index: number, partial: Partial<Payment>) => {
    setPayments((prev) => prev.map((p, i) => (i === index ? { ...p, ...partial } : p)));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.price_per_unit, 0);
  const gstAmount = lineItems.reduce((sum, item) => {
    const base = item.qty * item.price_per_unit;
    const discount = item.discount_type === 'percent' ? (base * item.discount_value) / 100 : item.discount_value;
    return sum + (Math.max(base - discount, 0) * item.gst_percent) / 100;
  }, 0);
  const afterLineItems = lineItems.reduce((sum, item) => sum + lineItemTotal(item), 0);
  const extraDiscount = extraDiscountType === 'percent' ? (afterLineItems * extraDiscountValue) / 100 : extraDiscountValue;
  const totalPayable = Math.max(afterLineItems - extraDiscount, 0);
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const due = totalPayable - paidAmount;

  const handleSave = async () => {
    const validItems = lineItems.filter((item) => item.name.trim() && item.qty > 0);
    if (validItems.length === 0) {
      showToast('error', 'Add at least one billing item');
      return;
    }

    setSaving(true);
    try {
      const url = initial ? `/api/invoices/${initial.id}` : '/api/invoices';
      const method = initial ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          patientId,
          doctorId,
          lineItems: validItems,
          extraDiscountType,
          extraDiscountValue,
          payments: payments.filter((p) => p.amount > 0),
          notes,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save invoice');
      showToast('success', initial ? 'Bill updated.' : 'Bill created.');
      onSaved(result.invoice);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 pr-2">Item</th>
              <th className="pb-2 pr-2 w-16">Qty</th>
              <th className="pb-2 pr-2 w-24">Price</th>
              <th className="pb-2 pr-2 w-32">Discount</th>
              <th className="pb-2 pr-2 w-20">GST %</th>
              <th className="pb-2 pr-2 w-24 text-right">Total</th>
              <th className="pb-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-2">
                  <AdminInput
                    value={item.name}
                    onChange={(e) => updateItem(index, { name: e.target.value })}
                    placeholder="Item / service name"
                  />
                </td>
                <td className="py-2 pr-2">
                  <AdminInput
                    type="number"
                    value={String(item.qty)}
                    onChange={(e) => updateItem(index, { qty: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-2 pr-2">
                  <AdminInput
                    type="number"
                    value={String(item.price_per_unit)}
                    onChange={(e) => updateItem(index, { price_per_unit: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-2 pr-2">
                  <div className="flex gap-1">
                    <AdminInput
                      type="number"
                      value={String(item.discount_value)}
                      onChange={(e) => updateItem(index, { discount_value: Number(e.target.value) || 0 })}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(index, { discount_type: item.discount_type === 'percent' ? 'flat' : 'percent' })
                      }
                      className="px-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer flex-shrink-0"
                      title="Toggle % / flat amount"
                    >
                      {item.discount_type === 'percent' ? '%' : '₹'}
                    </button>
                  </div>
                </td>
                <td className="py-2 pr-2">
                  <AdminInput
                    type="number"
                    value={String(item.gst_percent)}
                    onChange={(e) => updateItem(index, { gst_percent: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-2 pr-2 text-right font-medium text-gray-900 dark:text-white">
                  ₹{lineItemTotal(item).toFixed(2)}
                </td>
                <td className="py-2">
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLineItems((prev) => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() => setLineItems((prev) => [...prev, { ...emptyLineItem }])}
        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Item
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Extra Discount</h4>
          <div className="flex gap-2">
            <AdminInput
              type="number"
              value={String(extraDiscountValue)}
              onChange={(e) => setExtraDiscountValue(Number(e.target.value) || 0)}
            />
            <button
              type="button"
              onClick={() => setExtraDiscountType((t) => (t === 'percent' ? 'flat' : 'percent'))}
              className="px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer flex-shrink-0"
            >
              {extraDiscountType === 'percent' ? '%' : '₹'}
            </button>
          </div>

          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pt-2">Payment</h4>
          {payments.map((p, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <AdminSelect
                  value={p.mode}
                  onChange={(e) => updatePayment(index, { mode: e.target.value })}
                  options={PAYMENT_MODE_OPTIONS}
                />
              </div>
              <div className="flex-1">
                <AdminInput
                  type="number"
                  value={String(p.amount)}
                  onChange={(e) => updatePayment(index, { amount: Number(e.target.value) || 0 })}
                  placeholder="Amount"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPayments((prev) => [...prev, { mode: 'Cash', amount: 0 }])}
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Payment mode
          </button>

          <AdminTextarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 space-y-2 text-sm h-fit">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>GST</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          {extraDiscount > 0 && (
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Extra Discount</span>
              <span>-₹{extraDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>Total Payable</span>
            <span>₹{totalPayable.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Paid Amount</span>
            <span>₹{paidAmount.toFixed(2)}</span>
          </div>
          <div className={`flex justify-between font-semibold rounded-lg px-3 py-2 ${due > 0 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'}`}>
            <span>{due > 0 ? 'Due' : 'Fully Paid'}</span>
            <span>₹{Math.max(due, 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : initial ? 'Save & Update Bill' : 'Save Bill'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
