'use client';

import { useEffect, useState } from 'react';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import { Copy, Eye, Pencil, Trash } from 'lucide-react';
import { Plus } from '@phosphor-icons/react';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/ui/data-table';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import PatientDetailPage from '@/components/admin/PatientDetailPage';
import PatientProfileForm, {
  emptyPatientProfile,
  validatePatientProfile,
  type PatientProfileFormState,
} from '@/components/admin/PatientProfileForm';

interface Patient {
  id: string;
  patient_code: string;
  name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  marital_status: string | null;
  occupation: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_pincode: string | null;
  photo_url: string | null;
  reference_id: string | null;
  aadhaar_number: string | null;
  created_at: string;
  appointmentStatus: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Visits';
  lastVisitReason: string | null;
}

const STATUS_STYLES: Record<Patient['appointmentStatus'], string> = {
  Upcoming: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
  'In Progress': 'bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300',
  Completed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  Cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  'No Visits': 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

function patientToFormState(patient: Patient): PatientProfileFormState {
  return {
    name: patient.name,
    phone: patient.phone,
    email: patient.email || '',
    gender: patient.gender || '',
    dateOfBirth: patient.date_of_birth || '',
    referenceId: patient.reference_id || '',
    bloodGroup: patient.blood_group || '',
    maritalStatus: patient.marital_status || '',
    occupation: patient.occupation || '',
    aadhaarNumber: patient.aadhaar_number || '',
    addressStreet: patient.address_street || '',
    addressCity: patient.address_city || '',
    addressState: patient.address_state || '',
    addressPincode: patient.address_pincode || '',
    photoUrl: patient.photo_url || '',
  };
}

function EditablePatientRow({
  patient,
  onChanged,
}: {
  patient: Patient;
  onChanged: () => void;
}) {
  const [form, setForm] = useState<PatientProfileFormState>(patientToFormState(patient));
  const [errors, setErrors] = useState<ReturnType<typeof validatePatientProfile>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const save = async () => {
    const validationErrors = validatePatientProfile(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      showToast('error', 'Please fix the highlighted fields');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          gender: form.gender,
          date_of_birth: form.dateOfBirth,
          reference_id: form.referenceId,
          blood_group: form.bloodGroup,
          marital_status: form.maritalStatus,
          occupation: form.occupation,
          aadhaar_number: form.aadhaarNumber,
          address_street: form.addressStreet,
          address_city: form.addressCity,
          address_state: form.addressState,
          address_pincode: form.addressPincode,
          photo_url: form.photoUrl,
        }),
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
    <div className="p-4 space-y-4">
      <PatientProfileForm value={form} onChange={setForm} errors={errors} />
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
        <Button onClick={save} disabled={saving} variant="primary" size="xs">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

export default function PatientsView() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingPatient, setAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState<PatientProfileFormState>(emptyPatientProfile);
  const [newPatientErrors, setNewPatientErrors] = useState<ReturnType<typeof validatePatientProfile>>({});
  const [creating, setCreating] = useState(false);
  const [detailsPatientId, setDetailsPatientId] = useState<string | null>(null);
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

  const createPatient = async () => {
    const validationErrors = validatePatientProfile(newPatient);
    setNewPatientErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      showToast('error', 'Please fix the highlighted fields');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create patient');
      showToast('success', 'Patient added.');
      setAddingPatient(false);
      setNewPatient(emptyPatientProfile);
      setNewPatientErrors({});
      fetchPatients();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to create patient');
    } finally {
      setCreating(false);
    }
  };

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
      accessorKey: 'lastVisitReason',
      header: 'Reason',
      cell: ({ row }) => (
        <span className="block max-w-[10rem] truncate text-xs text-gray-600 dark:text-gray-300">
          {row.original.lastVisitReason || '—'}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'appointmentStatus',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[row.original.appointmentStatus]}`}>
          {row.original.appointmentStatus}
        </span>
      ),
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
            onClick={() => setDetailsPatientId(row.original.id)}
            className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            title="View details, history, prescriptions and billing"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => row.toggleExpanded()}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer"
            title="Edit patient"
          >
            <Pencil className="w-4 h-4" />
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
            className="text-red-600 hover:text-red-700 dark:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
            title="Delete patient"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (detailsPatientId) {
    return <PatientDetailPage patientId={detailsPatientId} onBack={() => setDetailsPatientId(null)} />;
  }

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Patients register automatically on first booking — or add one directly here, matching
            the walk-in front-desk flow.
          </p>
        </div>
        <Button onClick={() => setAddingPatient(true)} variant="primary" size="xs" icon={<Plus weight="bold" />}>
          Add New Patient
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        searchColumnId="name"
        searchPlaceholder="Search by patient name..."
        filters={[
          {
            columnId: 'appointmentStatus',
            placeholder: 'All statuses',
            options: (['Upcoming', 'In Progress', 'Completed', 'Cancelled', 'No Visits'] as const).map((s) => ({
              value: s,
              label: s,
            })),
          },
        ]}
        emptyMessage="No patients registered yet."
        manualExpandControl
        renderExpandedRow={(patient) => <EditablePatientRow patient={patient} onChanged={fetchPatients} />}
      />

      <Modal isOpen={addingPatient} onClose={() => setAddingPatient(false)} title="Add New Patient">
        <div className="space-y-4">
          <PatientProfileForm value={newPatient} onChange={setNewPatient} errors={newPatientErrors} />
          <div className="flex gap-2 pt-2">
            <Button onClick={createPatient} disabled={creating} variant="primary" size="xs">
              {creating ? 'Adding...' : 'Add Patient'}
            </Button>
            <Button onClick={() => setAddingPatient(false)} variant="outline" size="xs">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
