'use client';

import { useEffect, useMemo, useState } from 'react';

interface Slot {
  slot: string;
  taken: boolean;
}

interface DateTimePickerProps {
  name: string;
  doctorId: string;
  date: string;
  slot: string;
  onChange: (value: { date: string; slot: string }) => void;
  error?: string;
  closedDates?: string[];
  closedWeekdays?: number[];
  daysToShow?: number;
}

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(d: Date): { weekday: string; day: string; month: string } {
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
    day: d.toLocaleDateString(undefined, { day: 'numeric' }),
    month: d.toLocaleDateString(undefined, { month: 'short' }),
  };
}

function formatSlotLabel(slot: string): string {
  const [h] = slot.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:00 ${period}`;
}

export default function DateTimePicker({
  name,
  doctorId,
  date,
  slot,
  onChange,
  error,
  closedDates = [],
  closedWeekdays = [],
  daysToShow = 14,
}: DateTimePickerProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const list: { key: string; date: Date; disabled: boolean }[] = [];
    for (let i = 1; i <= daysToShow; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const key = formatDateKey(d);
      const disabled = closedDates.includes(key) || closedWeekdays.includes(d.getDay());
      list.push({ key, date: d, disabled });
    }
    return list;
  }, [daysToShow, closedDates, closedWeekdays]);

  useEffect(() => {
    if (!date || !doctorId) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    setFetchError(null);

    fetch(`/api/appointment/availability?date=${date}&doctorId=${doctorId}`)
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load availability');
        return result;
      })
      .then((result) => {
        if (cancelled) return;
        if (result.closed) {
          setSlots([]);
          setFetchError('This date is not available. Please pick another day.');
        } else {
          setSlots(result.slots || []);
        }
      })
      .catch(() => {
        if (!cancelled) setFetchError('Could not load available times. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, doctorId]);

  const selectDay = (key: string) => {
    onChange({ date: key, slot: '' });
  };

  const selectSlot = (slotValue: string) => {
    onChange({ date, slot: slotValue });
  };

  return (
    <div>
      <input type="hidden" name={name} value={date && slot ? `${date} ${slot}` : ''} />

      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
        Choose a day <span className="text-red-500">*</span>
      </p>
      {/* This row is the one intentional horizontal scroller — contained to
          its own width (min-w-0 stops it from forcing the modal itself to
          overflow) so only the day strip scrolls, never the whole dialog. */}
      <div className="min-w-0 flex gap-1.5 overflow-x-auto pt-1 pb-2 -mx-1 px-1">
        {days.map(({ key, date: d, disabled }) => {
          const { weekday, day, month } = formatDayLabel(d);
          const isSelected = key === date;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => selectDay(key)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-12 py-1.5 rounded-lg border-2 transition-all duration-200 ${
                disabled
                  ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'
                  : isSelected
                    ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-primary-400 dark:hover:border-primary-600'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wide">{weekday}</span>
              <span className="text-sm font-bold leading-tight">{day}</span>
              <span className="text-[9px]">{month}</span>
            </button>
          );
        })}
      </div>

      {date && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Choose a time <span className="text-red-500">*</span>
          </p>
          {!doctorId ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose a doctor above to see their available times.
            </p>
          ) : loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              Loading available times...
            </div>
          ) : fetchError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No time slots are available for this day. Please choose a different day.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {slots.map(({ slot: s, taken }) => {
                const isSelected = s === slot;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={taken}
                    onClick={() => selectSlot(s)}
                    className={`px-2 py-2 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                      taken
                        ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 line-through'
                        : isSelected
                          ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                          : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-primary-400 dark:hover:border-primary-600'
                    }`}
                  >
                    {formatSlotLabel(s)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
