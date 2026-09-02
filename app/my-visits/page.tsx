'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import FloatingLabelInput from '@/components/FloatingLabelInput';

interface Visit {
  id: string;
  date: string;
  slot: string;
  status: string;
  reason: string;
  doctorName: string;
}

interface LatestPrescription {
  createdAt: string;
  diagnosis: string | null;
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  pdfUrl: string | null;
}

interface LookupResult {
  patient: { name: string; patientCode: string };
  visits: Visit[];
  latestPrescription: LatestPrescription | null;
}

export default function MyVisitsPage() {
  const [patientCode, setPatientCode] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/patients/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientCode: patientCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not find that Patient ID');
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 sm:py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            My Visits & Prescriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the Patient ID you received after booking to see your visit history and latest
            prescription.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <FloatingLabelInput
                id="patientCode"
                name="patientCode"
                placeholder="Patient ID (e.g., DRB-4K9X2P)"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
              />
            </div>
            <Button type="submit" variant="primary" size="md" disabled={loading}>
              {loading ? 'Looking up...' : 'View My Visits'}
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>

        {result && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome, {result.patient.name}
              </h2>

              {result.visits.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No visits found yet.</p>
              ) : (
                <div className="space-y-3">
                  {result.visits.map((visit) => (
                    <div
                      key={visit.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {visit.date} at {visit.slot}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {visit.doctorName} — {visit.reason}
                        </p>
                      </div>
                      <span
                        className={`mt-2 sm:mt-0 self-start sm:self-auto px-3 py-1 rounded-full text-xs font-medium ${
                          visit.status === 'confirmed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {visit.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result.latestPrescription ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Latest Prescription
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {new Date(result.latestPrescription.createdAt).toLocaleDateString()}
                </p>
                {result.latestPrescription.diagnosis && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <span className="font-medium">Diagnosis:</span>{' '}
                    {result.latestPrescription.diagnosis}
                  </p>
                )}
                <ul className="space-y-1 mb-6">
                  {result.latestPrescription.medications.map((med, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                      {med.name} — {med.dosage}, {med.frequency}, {med.duration}
                    </li>
                  ))}
                </ul>
                {result.latestPrescription.pdfUrl ? (
                  <a
                    href={result.latestPrescription.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" size="md">
                      Download Prescription (PDF)
                    </Button>
                  </a>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PDF is not available yet for this prescription.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No prescriptions on file yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
