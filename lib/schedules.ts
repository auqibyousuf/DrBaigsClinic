import { createClient } from '@supabase/supabase-js';
import { getConfiguredSlots } from './appointments';

// Recurring weekly availability per doctor — see MEDISRAY_AUDIT.md finding #5.
// Replaces the single flat "same slots every day" list with real per-doctor,
// per-weekday schedules (e.g. half-day Saturdays, doctor off on Wednesdays).

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  slot_duration_minutes: number;
  start_time: string; // "HH:MM", 24h
  end_time: string; // "HH:MM", 24h, exclusive upper bound
  days_of_week: number[]; // 0=Sun .. 6=Sat
  created_at: string;
  updated_at: string;
}

export interface NewDoctorSchedule {
  doctor_id: string;
  slot_duration_minutes: number;
  start_time: string;
  end_time: string;
  days_of_week: number[];
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }
  return createClient(url, key);
}

export async function listSchedulesForDoctor(doctorId: string): Promise<DoctorSchedule[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('doctor_schedules')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch schedules: ${error.message}`);
  }
  return (data || []) as DoctorSchedule[];
}

export async function listAllSchedules(): Promise<DoctorSchedule[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('doctor_schedules')
    .select('*')
    .order('doctor_id', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch schedules: ${error.message}`);
  }
  return (data || []) as DoctorSchedule[];
}

export async function createSchedule(input: NewDoctorSchedule): Promise<DoctorSchedule> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('doctor_schedules')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create schedule: ${error.message}`);
  }
  return data as DoctorSchedule;
}

export async function updateSchedule(
  id: string,
  updates: Partial<NewDoctorSchedule>
): Promise<DoctorSchedule> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('doctor_schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update schedule: ${error.message}`);
  }
  return data as DoctorSchedule;
}

export async function deleteSchedule(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('doctor_schedules').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }
}

// Expands a doctor's recurring weekly schedule rows into concrete slot-start
// times ("HH:MM") for one specific date, respecting day-of-week and each
// schedule's own slot duration. Falls back to the flat CMS slot list when the
// doctor has no schedules configured yet, so existing clinics keep working
// without forcing schedule setup before anyone can book.
export function expandSlotsForDate(
  schedules: DoctorSchedule[],
  dateStr: string,
  bookingSettingsFallback?: { slots?: string[] } | null
): string[] {
  const weekday = new Date(`${dateStr}T00:00:00`).getDay();
  const applicable = schedules.filter((s) => s.days_of_week.includes(weekday));

  if (applicable.length === 0) {
    return getConfiguredSlots(bookingSettingsFallback);
  }

  const slots = new Set<string>();
  for (const sched of applicable) {
    const [startH, startM] = sched.start_time.split(':').map(Number);
    const [endH, endM] = sched.end_time.split(':').map(Number);
    const endMinutes = endH * 60 + endM;
    for (
      let cursor = startH * 60 + startM;
      cursor + sched.slot_duration_minutes <= endMinutes;
      cursor += sched.slot_duration_minutes
    ) {
      const h = Math.floor(cursor / 60);
      const m = cursor % 60;
      slots.add(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return Array.from(slots).sort();
}
