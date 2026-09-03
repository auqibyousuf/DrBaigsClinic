'use client';

import { AdminInput } from '@/components/admin/AdminField';

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
// dated reading per visit, using the same AdminInput everywhere else uses.
export default function VitalsPanel({ reading, onChange }: VitalsPanelProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {FIELDS.map(({ key, label, unit }) => (
        <AdminInput
          key={key}
          label={`${label} (${unit})`}
          value={reading[key] || ''}
          onChange={(e) => onChange({ ...reading, [key]: e.target.value })}
          placeholder="Enter"
        />
      ))}
    </div>
  );
}
