'use client';

export interface VitalsReading {
  recorded_at: string;
  temperature?: string;
  pulse?: string;
  resp_rate?: string;
  systolic?: string;
  diastolic?: string;
  spo2?: string;
  rbs?: string;
}

interface VitalsPanelProps {
  reading: VitalsReading;
  onChange: (reading: VitalsReading) => void;
}

const FIELDS: { key: keyof VitalsReading; label: string; unit: string }[] = [
  { key: 'temperature', label: 'Temperature', unit: '°F' },
  { key: 'pulse', label: 'Pulse', unit: '/min' },
  { key: 'resp_rate', label: 'Resp. Rate', unit: '/min' },
  { key: 'systolic', label: 'Systolic', unit: 'mmHg' },
  { key: 'diastolic', label: 'Diastolic', unit: 'mmHg' },
  { key: 'spo2', label: 'SPO2', unit: '%' },
  { key: 'rbs', label: 'General RBS', unit: 'mg/dl' },
];

// Vitals & Body Composition module (MEDISRAY_AUDIT.md finding #2) — a single
// dated reading per visit, laid out as a row list (name | value + unit) to
// match Medisray's own layout, rather than a generic form grid.
export default function VitalsPanel({ reading, onChange }: VitalsPanelProps) {
  const dateLabel = new Date(reading.recorded_at).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-900/40 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <span>Names</span>
        <span>Date: {dateLabel}</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {FIELDS.map(({ key, label, unit }) => (
          <div key={key} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-32 flex-shrink-0 text-sm font-medium text-gray-900 dark:text-white">{label}</span>
            <div className="flex-1 flex items-stretch rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-1 focus-within:ring-primary-500">
              <input
                value={reading[key] || ''}
                onChange={(e) => onChange({ ...reading, [key]: e.target.value })}
                placeholder="Enter"
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus-visible:outline-none"
              />
              <span className="flex items-center justify-center w-16 flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/40 border-l border-gray-200 dark:border-gray-700">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
