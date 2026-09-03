'use client';

import { FileText } from '@phosphor-icons/react';

interface PrescriptionSummaryProps {
  prescription: {
    diagnosis: string | null;
    symptoms?: { value: string; since?: string; severity?: string }[];
    medications?: { name: string; dosage: string; frequency: string; duration: string }[];
    investigations?: string[];
    advices?: string[];
    followUpDate?: string | null;
    pdfUrl: string | null;
  };
  date: string;
  doctorName?: string;
}

// A real prescription summary — symptoms, diagnosis, a proper medications
// table, investigations, advices, follow-up — instead of just showing the
// diagnosis line and a "View PDF" link, which threw away everything else
// that was actually recorded.
export default function PrescriptionSummary({ prescription, date, doctorName }: PrescriptionSummaryProps) {
  const {
    diagnosis,
    symptoms = [],
    medications = [],
    investigations = [],
    advices = [],
    followUpDate,
    pdfUrl,
  } = prescription;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {doctorName && <p className="text-xs text-gray-500 dark:text-gray-400">{doctorName}</p>}
        </div>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            <FileText className="w-4 h-4" />
            View PDF
          </a>
        )}
      </div>

      <div className="p-4 space-y-3">
        {symptoms.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
              Symptoms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {symptoms.map((s, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs"
                >
                  {s.value}
                  {s.since ? ` · ${s.since}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {diagnosis && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
              Diagnosis
            </p>
            <p className="text-sm text-gray-900 dark:text-white">{diagnosis}</p>
          </div>
        )}

        {medications.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
              Medications
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 text-left">
                    <th className="px-2 py-1.5 font-medium">Medicine</th>
                    <th className="px-2 py-1.5 font-medium">Dosage</th>
                    <th className="px-2 py-1.5 font-medium">Frequency</th>
                    <th className="px-2 py-1.5 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((m, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-2 py-1.5 font-medium text-gray-900 dark:text-white">{m.name}</td>
                      <td className="px-2 py-1.5 text-gray-600 dark:text-gray-300">{m.dosage}</td>
                      <td className="px-2 py-1.5 text-gray-600 dark:text-gray-300">{m.frequency}</td>
                      <td className="px-2 py-1.5 text-gray-600 dark:text-gray-300">{m.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {investigations.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
              Lab Investigation
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{investigations.join(', ')}</p>
          </div>
        )}

        {advices.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
              Advices
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{advices.join(', ')}</p>
          </div>
        )}

        {followUpDate && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Follow-up: <span className="font-medium text-gray-700 dark:text-gray-300">{followUpDate}</span>
          </p>
        )}

        {!diagnosis && symptoms.length === 0 && medications.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">No clinical details recorded.</p>
        )}
      </div>
    </div>
  );
}
