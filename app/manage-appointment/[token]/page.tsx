'use client';

import { useEffect, useState } from 'react';
import DateTimePicker from '@/components/DateTimePicker';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastProvider';

interface AppointmentInfo {
  appointment: {
    id: string;
    patient_name: string;
    reason: string;
    doctor_id: string;
    appointment_date: string;
    slot_start: string;
    status: 'confirmed' | 'cancelled';
  };
  doctorName: string;
  canManage: boolean;
}

export default function ManageAppointmentPage({ params }: { params: { token: string } }) {
  const [info, setInfo] = useState<AppointmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointment/manage/${params.token}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Appointment not found');
      setInfo(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your appointment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointment/manage/${params.token}/cancel`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to cancel');
      showToast('success', 'Your appointment has been cancelled.');
      fetchInfo();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to cancel appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newSlot) {
      showToast('error', 'Please choose a new day and time');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointment/manage/${params.token}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, slot: newSlot }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to reschedule');
      showToast('success', 'Your appointment has been rescheduled.');
      setRescheduling(false);
      fetchInfo();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Appointment not found</h1>
          <p className="text-gray-600 dark:text-gray-400">{error || 'This link is invalid.'}</p>
        </div>
      </div>
    );
  }

  const { appointment, doctorName, canManage } = info;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Your Appointment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Dr Baig's Clinic</p>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Patient</span>
            <span className="font-medium text-gray-900 dark:text-white">{appointment.patient_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Doctor</span>
            <span className="font-medium text-gray-900 dark:text-white">{doctorName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Date</span>
            <span className="font-medium text-gray-900 dark:text-white">{appointment.appointment_date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Time</span>
            <span className="font-medium text-gray-900 dark:text-white">{appointment.slot_start}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Reason</span>
            <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">
              {appointment.reason}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <span
              className={`font-medium ${
                appointment.status === 'confirmed' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
              }`}
            >
              {appointment.status}
            </span>
          </div>
        </div>

        {appointment.status === 'cancelled' ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">This appointment has been cancelled.</p>
        ) : !canManage ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Online changes close 4 hours before your visit. Please call the clinic directly to cancel or
            reschedule this appointment.
          </p>
        ) : rescheduling ? (
          <div>
            <DateTimePicker
              name="reschedule"
              doctorId={appointment.doctor_id}
              date={newDate}
              slot={newSlot}
              onChange={({ date, slot }) => {
                setNewDate(date);
                setNewSlot(slot);
              }}
            />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleReschedule} disabled={submitting} variant="primary" size="md">
                Confirm New Time
              </Button>
              <Button onClick={() => setRescheduling(false)} variant="outline" size="md">
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setRescheduling(true)} variant="primary" size="md">
              Reschedule
            </Button>
            <Button onClick={handleCancel} disabled={submitting} variant="outline" size="md">
              Cancel Appointment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
