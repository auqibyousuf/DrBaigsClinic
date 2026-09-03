'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash, Clock } from '@phosphor-icons/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AdminInput, AdminSelect } from '@/components/admin/AdminField';
import { useToast } from '@/components/ToastProvider';
import type { CMSData } from '@/lib/cms';

type Doctor = NonNullable<CMSData['doctors']>['items'][number];

interface DoctorSchedule {
  id: string;
  doctor_id: string;
  slot_duration_minutes: number;
  start_time: string;
  end_time: string;
  days_of_week: number[];
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DURATION_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
];

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

interface DoctorSchedulesEditorProps {
  doctors: Doctor[];
}

// Recurring weekly availability per doctor (MEDISRAY_AUDIT.md finding #5) —
// replaces the single flat "same slots every day" list in Booking Settings.
export default function DoctorSchedulesEditor({ doctors }: DoctorSchedulesEditorProps) {
  const activeDoctors = doctors.filter((d) => d.isActive !== false);
  const [activeDoctorId, setActiveDoctorId] = useState(activeDoctors[0]?.id || '');
  const [schedulesByDoctor, setSchedulesByDoctor] = useState<Record<string, DoctorSchedule[]>>({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchSchedules = async (doctorId: string) => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/doctor-schedules?doctorId=${doctorId}`, { credentials: 'include' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to load schedules');
      setSchedulesByDoctor((prev) => ({ ...prev, [doctorId]: result.schedules || [] }));
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeDoctorId) fetchSchedules(activeDoctorId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoctorId]);

  const deleteScheduleRow = async (id: string) => {
    try {
      const res = await fetch(`/api/doctor-schedules/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete schedule');
      showToast('success', 'Schedule removed');
      fetchSchedules(activeDoctorId);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  if (activeDoctors.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4">
        Add an active doctor first, then set up their weekly schedule here.
      </p>
    );
  }

  return (
    <div>
      <Tabs value={activeDoctorId} onValueChange={setActiveDoctorId}>
        <TabsList>
          {activeDoctors.map((doctor) => (
            <TabsTrigger key={doctor.id} value={doctor.id}>
              {doctor.name || 'Untitled doctor'}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeDoctors.map((doctor) => (
          <TabsContent key={doctor.id} value={doctor.id}>
            <DoctorScheduleTabPanel
              doctorId={doctor.id}
              schedules={schedulesByDoctor[doctor.id] || []}
              loading={loading}
              onChanged={() => fetchSchedules(doctor.id)}
              onDelete={deleteScheduleRow}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function DoctorScheduleTabPanel({
  doctorId,
  schedules,
  loading,
  onChanged,
  onDelete,
}: {
  doctorId: string;
  schedules: DoctorSchedule[];
  loading: boolean;
  onChanged: () => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [duration, setDuration] = useState('30');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [days, setDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const toggleDay = (day: number) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const resetForm = () => {
    setDuration('30');
    setStartTime('10:00');
    setEndTime('14:00');
    setDays([]);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (days.length === 0) {
      showToast('error', 'Pick at least one day of the week');
      return;
    }
    if (endTime <= startTime) {
      showToast('error', 'End time must be after start time');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/doctor-schedules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          slotDurationMinutes: Number(duration),
          startTime,
          endTime,
          daysOfWeek: days,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save schedule');
      showToast('success', 'Schedule added');
      resetForm();
      onChanged();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : schedules.length === 0 && !showForm ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4">
          No recurring schedule set for this doctor yet — patients can't book with them until you add one.
        </p>
      ) : (
        <div className="space-y-2">
          {schedules.map((sched) => (
            <div
              key={sched.id}
              className="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Clock className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTime(sched.start_time)} – {formatTime(sched.end_time)}
                    <span className="text-gray-400 dark:text-gray-500 font-normal"> · {sched.slot_duration_minutes} min slots</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {sched.days_of_week
                      .slice()
                      .sort()
                      .map((d) => WEEKDAY_LABELS[d].slice(0, 3))
                      .join(', ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDelete(sched.id)}
                className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                title="Delete schedule"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="p-4 border border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50/40 dark:bg-primary-900/10 space-y-4">
          <AdminSelect
            label="Slot duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            options={DURATION_OPTIONS}
          />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput
              label="Start time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <AdminInput
              label="End time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Days of week
            </label>
            <div className="flex gap-2">
              {WEEKDAYS.map((label, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  title={WEEKDAY_LABELS[day]}
                  className={`w-10 h-10 rounded-lg border-2 text-sm font-semibold transition-colors cursor-pointer ${
                    days.includes(day)
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      )}
    </div>
  );
}
