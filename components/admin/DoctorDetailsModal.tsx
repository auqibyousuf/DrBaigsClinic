'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
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

interface DoctorDetailsModalProps {
  doctorId: string;
  doctorName: string;
  onClose: () => void;
}

function AppointmentList({ items, emptyMessage }: { items: AppointmentSummary[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((a) => (
        <div key={a.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {a.patientName} <span className="text-xs text-gray-400 font-normal">{a.patientPhone}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {a.date}
            {a.slot ? ` · ${a.slot}` : ''} · {a.reason}
          </p>
        </div>
      ))}
    </div>
  );
}

// Doctor detail view (MEDISRAY_AUDIT.md finding #8) — consulted patients,
// upcoming appointments, cancelled appointments, and prescriptions written.
export default function DoctorDetailsModal({ doctorId, doctorName, onClose }: DoctorDetailsModalProps) {
  const [data, setData] = useState<DoctorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    fetch(`/api/doctors/${doctorId}/summary`, { credentials: 'include' })
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [doctorId]);

  return (
    <Modal isOpen onClose={onClose} title={doctorName}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Could not load this doctor's activity.</p>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({data.upcoming.length})</TabsTrigger>
            <TabsTrigger value="consulted">Consulted ({data.consulted.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({data.cancelled.length})</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions ({data.prescriptions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <AppointmentList items={data.upcoming} emptyMessage="No upcoming appointments." />
          </TabsContent>
          <TabsContent value="consulted">
            <AppointmentList items={data.consulted} emptyMessage="No patients consulted yet." />
          </TabsContent>
          <TabsContent value="cancelled">
            <AppointmentList items={data.cancelled} emptyMessage="No cancelled appointments." />
          </TabsContent>
          <TabsContent value="prescriptions">
            {data.prescriptions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No prescriptions written yet.</p>
            ) : (
              <div className="space-y-2">
                {data.prescriptions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.patientName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {p.date} · {p.diagnosis || 'No diagnosis noted'}
                      </p>
                    </div>
                    {p.pdfUrl && (
                      <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm font-medium">
                        View PDF
                      </a>
                    )}
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
