'use client';

import { useEffect, useState } from 'react';
import { X } from '@phosphor-icons/react';
import type { CMSData } from '@/lib/cms';
import { DEFAULT_SLOTS } from '@/lib/appointments';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AdminInput } from '@/components/admin/AdminField';
import AdminSaveButton from '@/components/admin/AdminSaveButton';
import DoctorSchedulesEditor from '@/components/admin/DoctorSchedulesEditor';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatSlotLabel(slot: string): string {
  const [h] = slot.split(':').map(Number);
  if (Number.isNaN(h)) return slot;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:00 ${period}`;
}

interface BookingSettingsEditorProps {
  data: Partial<NonNullable<CMSData['bookingSettings']>>;
  doctors: NonNullable<CMSData['doctors']>['items'];
  onSave: (section: keyof CMSData, sectionData: Partial<CMSData[keyof CMSData]>) => Promise<void>;
  saving: boolean;
}

export default function BookingSettingsEditor({
  data,
  doctors,
  onSave,
  saving,
}: BookingSettingsEditorProps) {
  const [formData, setFormData] = useState<Partial<NonNullable<CMSData['bookingSettings']>>>(
    data || {}
  );
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [tab, setTab] = useState('schedules');

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const closedDates = formData.closedDates || [];
  const closedWeekdays = formData.closedWeekdays || [];
  const slots = formData.slots?.length ? formData.slots : DEFAULT_SLOTS;

  const addSlot = () => {
    if (!newSlot || slots.includes(newSlot)) return;
    setFormData({ ...formData, slots: [...slots, newSlot].sort() });
    setNewSlot('');
  };

  const removeSlot = (slot: string) => {
    setFormData({ ...formData, slots: slots.filter((s) => s !== slot) });
  };

  const toggleWeekday = (day: number) => {
    setFormData({
      ...formData,
      closedWeekdays: closedWeekdays.includes(day)
        ? closedWeekdays.filter((d) => d !== day)
        : [...closedWeekdays, day],
    });
  };

  const addDate = () => {
    if (!newDate || closedDates.includes(newDate)) return;
    setFormData({ ...formData, closedDates: [...closedDates, newDate].sort() });
    setNewDate('');
  };

  const removeDate = (date: string) => {
    setFormData({ ...formData, closedDates: closedDates.filter((d) => d !== date) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('bookingSettings', formData as Partial<CMSData['bookingSettings']>);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set each doctor's recurring weekly availability, mark clinic-wide closures, and configure
          fallback time slots.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="schedules">Doctor Schedules</TabsTrigger>
          <TabsTrigger value="general">Closures &amp; Fallback Slots</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules">
          <DoctorSchedulesEditor doctors={doctors} />
        </TabsContent>

        <TabsContent value="general">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fallback time slots
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Used only for doctors with no recurring schedule configured in the "Doctor Schedules"
                tab — set that up instead whenever possible, since it supports different hours per day.
              </p>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <AdminInput
                    type="time"
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={addSlot}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex-shrink-0 h-fit"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <span
                    key={slot}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200"
                  >
                    {formatSlotLabel(slot)}
                    <button
                      type="button"
                      onClick={() => removeSlot(slot)}
                      className="text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Closed weekdays (applies to all doctors)
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((label, day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWeekday(day)}
                    className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                      closedWeekdays.includes(day)
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Closed dates (holidays, one-off closures)
              </label>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <AdminInput type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </div>
                <button
                  type="button"
                  onClick={addDate}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex-shrink-0 h-fit"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {closedDates.map((date) => (
                  <span
                    key={date}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200"
                  >
                    {date}
                    <button
                      type="button"
                      onClick={() => removeDate(date)}
                      className="text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {closedDates.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No specific closed dates yet.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <AdminSaveButton saving={saving} />
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
