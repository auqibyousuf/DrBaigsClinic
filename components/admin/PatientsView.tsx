'use client';

import { useEffect, useState } from 'react';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import { TrashSimple, Copy, PencilSimple } from '@phosphor-icons/react';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';

interface Patient {
  id: string;
  patient_code: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
}

function EditablePatientRow({
  patient,
  onChanged,
}: {
  patient: Patient;
  onChanged: () => void;
}) {
  const [name, setName] = useState(patient.name);
  const [phone, setPhone] = useState(patient.phone);
  const [email, setEmail] = useState(patient.email || '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      showToast('success', 'Patient updated.');
      onChanged();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update patient');
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(patient.patient_code);
    showToast('info', 'Patient ID copied.');
  };

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Patient ID: <code className="font-mono font-semibold text-gray-700 dark:text-gray-300">{patient.patient_code}</code>
        </span>
        <button
          type="button"
          onClick={copyCode}
          title="Copy patient ID"
          className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button onClick={save} disabled={saving} variant="primary" size="sm">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

export default function PatientsView() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients/list', { credentials: 'include' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to load patients');
      setPatients(result.patients || []);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.original.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{row.original.patient_code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.phone}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span>{row.original.email || '—'}</span>,
      enableSorting: false,
    },
    {
      accessorKey: 'created_at',
      header: 'Registered',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }: { row: Row<Patient> }) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => row.toggleExpanded()}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
            title="Edit patient"
          >
            <PencilSimple className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm(`Delete ${row.original.name}? This also removes their appointments and prescriptions. This cannot be undone.`)) return;
              try {
                const res = await fetch(`/api/patients/${row.original.id}`, { method: 'DELETE', credentials: 'include' });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to delete');
                showToast('success', 'Patient deleted.');
                fetchPatients();
              } catch (err) {
                showToast('error', err instanceof Error ? err.message : 'Failed to delete patient');
              }
            }}
            className="text-red-600 hover:text-red-700 dark:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete patient"
          >
            <TrashSimple className="w-4 h-4" />
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Every patient is registered automatically the first time they book an appointment — use
          the Edit/Delete icons on a row to manage their record.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        searchColumnId="name"
        searchPlaceholder="Search by patient name..."
        emptyMessage="No patients registered yet."
        manualExpandControl
        renderExpandedRow={(patient) => <EditablePatientRow patient={patient} onChanged={fetchPatients} />}
      />
    </div>
  );
}
