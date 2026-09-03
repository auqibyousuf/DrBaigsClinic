import { createClient } from '@supabase/supabase-js';

// Default daily time slots — used whenever the admin hasn't customized them
// via Booking Settings in the CMS (bookingSettings.slots).
export const DEFAULT_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
export type SlotStart = string;

export function getConfiguredSlots(bookingSettings?: { slots?: string[] } | null): string[] {
  return bookingSettings?.slots?.length ? bookingSettings.slots : [...DEFAULT_SLOTS];
}

export type AppointmentStatus = 'confirmed' | 'finished' | 'cancelled';

export interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  patient_id: string | null;
  reason: string;
  service_id: string | null;
  doctor_id: string;
  appointment_date: string;
  slot_start: string | null;
  status: AppointmentStatus;
  is_walk_in: boolean;
  manage_token: string;
  created_at: string;
  updated_at: string;
}

export interface NewAppointment {
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  patient_id?: string | null;
  reason: string;
  service_id?: string | null;
  doctor_id: string;
  appointment_date: string;
  slot_start: string;
}

// A walk-in creates-and-enters a consultation in the same motion — no
// pre-picked slot, no availability check (see MEDISRAY_AUDIT.md finding #1).
export interface NewWalkIn {
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  patient_id: string;
  doctor_id: string;
  reason?: string;
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }
  return createClient(url, key);
}

export class SlotTakenError extends Error {
  constructor() {
    super('This slot was just booked, please pick another.');
    this.name = 'SlotTakenError';
  }
}

export async function createAppointment(input: NewAppointment): Promise<Appointment> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...input, status: 'confirmed' })
    .select()
    .single();

  if (error) {
    // Postgres unique_violation
    if (error.code === '23505') {
      throw new SlotTakenError();
    }
    throw new Error(`Failed to create appointment: ${error.message}`);
  }

  return data as Appointment;
}

export async function createWalkIn(input: NewWalkIn): Promise<Appointment> {
  const supabase = getClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_name: input.patient_name,
      patient_phone: input.patient_phone,
      patient_email: input.patient_email || '',
      patient_id: input.patient_id,
      doctor_id: input.doctor_id,
      reason: input.reason || 'Walk-in consultation',
      appointment_date: today,
      slot_start: null,
      is_walk_in: true,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to start walk-in consultation: ${error.message}`);
  }
  return data as Appointment;
}

export async function finishAppointment(id: string): Promise<Appointment> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'finished' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to finish appointment: ${error.message}`);
  }
  return data as Appointment;
}

export async function getAppointmentsForDate(
  date: string,
  doctorId: string
): Promise<Appointment[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('appointment_date', date)
    .eq('doctor_id', doctorId)
    .in('status', ['confirmed', 'finished']);

  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`);
  }

  return (data || []) as Appointment[];
}

export async function listAppointmentsForDate(date: string): Promise<Appointment[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('appointment_date', date)
    .in('status', ['confirmed', 'finished'])
    .order('slot_start', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`);
  }

  return (data || []) as Appointment[];
}

export async function getAppointmentsForPatient(patientId: string): Promise<Appointment[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: false })
    .order('slot_start', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch patient appointments: ${error.message}`);
  }

  return (data || []) as Appointment[];
}

export async function listUpcomingAppointments(): Promise<Appointment[]> {
  const supabase = getClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('appointment_date', today)
    .order('appointment_date', { ascending: true })
    .order('slot_start', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`);
  }

  return (data || []) as Appointment[];
}

// Every appointment regardless of date — the admin needs to see past visits
// too (e.g. to write a prescription for one), not just what's upcoming.
export async function listAllAppointments(): Promise<Appointment[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: false })
    .order('slot_start', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`);
  }

  return (data || []) as Appointment[];
}

export async function getAppointmentByToken(token: string): Promise<Appointment | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('manage_token', token)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch appointment: ${error.message}`);
  }

  return (data as Appointment) || null;
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch appointment: ${error.message}`);
  }

  return (data as Appointment) || null;
}

export interface AppointmentDetailsUpdate {
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  reason?: string;
}

export async function updateAppointmentDetails(
  id: string,
  updates: AppointmentDetailsUpdate
): Promise<Appointment> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update appointment: ${error.message}`);
  }

  return data as Appointment;
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cancel appointment: ${error.message}`);
  }

  return data as Appointment;
}

// Hard delete — distinct from cancelAppointment (status: 'cancelled', kept
// for the record). Also removes any prescription linked to this visit,
// since a prescription can't outlive the appointment it belongs to.
export async function deleteAppointment(id: string): Promise<void> {
  const supabase = getClient();
  await supabase.from('invoices').delete().eq('appointment_id', id);
  await supabase.from('prescriptions').delete().eq('appointment_id', id);
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete appointment: ${error.message}`);
  }
}

export async function rescheduleAppointment(
  id: string,
  newDate: string,
  newSlot: string
): Promise<Appointment> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('appointments')
    .update({ appointment_date: newDate, slot_start: newSlot })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new SlotTakenError();
    }
    throw new Error(`Failed to reschedule appointment: ${error.message}`);
  }

  return data as Appointment;
}

// The 4-hour patient self-service cutoff. Server-side only — never trust the client for this.
export function isPastPatientCutoff(appointment: Appointment): boolean {
  const start = new Date(`${appointment.appointment_date}T${appointment.slot_start}:00`);
  const cutoff = new Date(start.getTime() - 4 * 60 * 60 * 1000);
  return new Date() >= cutoff;
}

interface BookingSettings {
  closedDates?: string[];
  closedWeekdays?: number[];
}

// Server-side source of truth for "is this date bookable" — the UI hiding a day
// is a courtesy, this is the real guard. `dateStr` is YYYY-MM-DD.
export function isDateBookable(dateStr: string, settings?: BookingSettings | null): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateStr}T00:00:00`);

  if (date <= today) {
    return false; // no same-day or past bookings
  }
  if (settings?.closedDates?.includes(dateStr)) {
    return false;
  }
  if (settings?.closedWeekdays?.includes(date.getDay())) {
    return false;
  }
  return true;
}
