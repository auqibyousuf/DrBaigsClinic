'use client';

import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import Modal from '@/components/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Visit {
  id: string;
  date: string;
  slot: string | null;
  status: string;
  reason: string;
  doctorName: string;
  prescription: { diagnosis: string | null; pdfUrl: string | null } | null;
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

interface PatientDetailsModalProps {
  patientId: string;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Queued',
  finished: 'Finished',
  cancelled: 'Cancelled',
};

// Full patient details (MEDISRAY_AUDIT.md finding #7) — visit history,
// every prescription, and every bill, in one tabbed view instead of
// scattered across separate tabs the admin has to cross-reference manually.
export default function PatientDetailsModal({ patientId, onClose }: PatientDetailsModalProps) {
  const [data, setData] = useState<PatientDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetch(`/api/patients/${patientId}/history`, { credentials: 'include' })
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  return (
    <Modal isOpen onClose={onClose} title={data?.patient ? data.patient.name : 'Patient Details'}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data?.patient ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Could not load this patient.</p>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visits">Visits ({data.visits.length})</TabsTrigger>
            <TabsTrigger value="prescriptions">
              Prescriptions ({data.visits.filter((v) => v.prescription).length})
            </TabsTrigger>
            <TabsTrigger value="billing">Billing ({data.billing.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Patient ID</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {data.patient.patient_code}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Phone</span>
                <span className="text-gray-900 dark:text-white">{data.patient.phone}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Email</span>
                <span className="text-gray-900 dark:text-white">{data.patient.email || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Gender</span>
                <span className="text-gray-900 dark:text-white">{data.patient.gender || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Date of Birth</span>
                <span className="text-gray-900 dark:text-white">{data.patient.date_of_birth || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Blood Group</span>
                <span className="text-gray-900 dark:text-white">{data.patient.blood_group || '—'}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visits">
            {data.visits.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No visits yet.</p>
            ) : (
              <div className="space-y-2">
                {data.visits.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {v.date}
                        {v.slot ? ` · ${v.slot}` : ''}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {v.doctorName} · {v.reason}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {STATUS_LABEL[v.status] || v.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions">
            {data.visits.filter((v) => v.prescription).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No prescriptions yet.</p>
            ) : (
              <div className="space-y-2">
                {data.visits
                  .filter((v) => v.prescription)
                  .map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {v.prescription?.diagnosis || 'No diagnosis noted'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {v.date} · {v.doctorName}
                        </p>
                      </div>
                      {v.prescription?.pdfUrl && (
                        <a
                          href={v.prescription.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline text-sm font-medium"
                        >
                          View PDF
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="billing">
            {data.billing.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No bills yet.</p>
            ) : (
              <div className="space-y-2">
                {data.billing.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{b.invoiceNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(b.billDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                      <span>Billed ₹{b.totalPayable.toFixed(2)}</span>
                      <span>Paid ₹{b.paidAmount.toFixed(2)}</span>
                      {b.pdfUrl && (
                        <a href={b.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                          <Printer className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </Modal>
  );
}
