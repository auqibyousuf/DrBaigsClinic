import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getCMSData } from '@/lib/cms';
import {
  createAppointment,
  isDateBookable,
  SlotTakenError,
  getConfiguredSlots,
} from '@/lib/appointments';
import { sendAdminAlert, sendPatientConfirmation } from '@/lib/notifications';
import { findOrCreatePatientByPhone } from '@/lib/patients';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, service, reason, date, slot, doctorId } = body;

    if (!name || !email || !phone || !reason || !date || !slot || !doctorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cmsData = await getCMSData();

    if (!getConfiguredSlots(cmsData.bookingSettings).includes(slot)) {
      return NextResponse.json({ error: 'Invalid time slot' }, { status: 400 });
    }

    // Never trust the client for booking rules — re-validate server-side.
    if (!isDateBookable(date, cmsData.bookingSettings)) {
      return NextResponse.json(
        { error: 'This date is not available for booking' },
        { status: 400 }
      );
    }

    const doctor = cmsData.doctors?.items?.find((d) => d.id === doctorId && d.isActive);
    if (!doctor) {
      return NextResponse.json({ error: 'Selected doctor is not available' }, { status: 400 });
    }

    const patient = await findOrCreatePatientByPhone(phone, name, email);

    let appointment;
    try {
      appointment = await createAppointment({
        patient_name: name,
        patient_phone: phone,
        patient_email: email,
        patient_id: patient.id,
        reason,
        service_id: service || null,
        doctor_id: doctorId,
        appointment_date: date,
        slot_start: slot,
      });
    } catch (err) {
      if (err instanceof SlotTakenError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }

    const contactData = cmsData.contact || {};
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const manageLink = `${siteUrl}/manage-appointment/${appointment.manage_token}`;

    // Email (existing Resend flow, now with date/time/reason/manage-link placeholders)
    const recipientEmail = contactData.email || process.env.APPOINTMENT_EMAIL || 'yauqib@gmail.com';
    const emailSubjectTemplate = contactData.emailSubject || 'New Appointment Booking Request';
    const emailBodyTemplate =
      contactData.emailBody ||
      `New Appointment Booking Request\n\n` +
        `Name: {name}\nEmail: {email}\nPhone: {phone}\nDoctor: {doctor}\n` +
        `Date: {date}\nTime: {time}\nReason: {reason}\n\nSubmitted on: {submittedAt}`;

    const fillTemplate = (template: string) =>
      template
        .replace(/{name}/g, name)
        .replace(/{email}/g, email)
        .replace(/{phone}/g, phone)
        .replace(/{service}/g, service || 'Not specified')
        .replace(/{doctor}/g, doctor.name)
        .replace(/{date}/g, date)
        .replace(/{time}/g, slot)
        .replace(/{reason}/g, reason)
        .replace(/{manageLink}/g, manageLink)
        .replace(/{patientId}/g, patient.patient_code)
        .replace(/{submittedAt}/g, new Date().toLocaleString());

    if (process.env.RESEND_API_KEY) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      try {
        await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          subject: fillTemplate(emailSubjectTemplate),
          text: fillTemplate(emailBodyTemplate),
        });

        if (doctor.email) {
          await resend.emails.send({
            from: fromEmail,
            to: doctor.email,
            subject: fillTemplate(emailSubjectTemplate),
            text: fillTemplate(emailBodyTemplate),
          });
        }

        const customerEmailSubjectTemplate =
          contactData.customerEmailSubject || 'Your Appointment Confirmation';
        const customerEmailBodyTemplate =
          contactData.customerEmailBody ||
          `Dear {name},\n\nYour appointment with {doctor} is confirmed for {date} at {time}.\n\n` +
            `Manage or reschedule your booking: {manageLink}\n\n` +
            `Your Patient ID is {patientId} — save this to view your visit history and download ` +
            `prescriptions anytime at ${siteUrl}/my-visits\n\nBest regards,\nDr Baig's Clinic`;

        if (email.includes('@')) {
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: fillTemplate(customerEmailSubjectTemplate),
            text: fillTemplate(customerEmailBodyTemplate),
          });
        }
      } catch (emailError) {
        // Don't fail the booking if email delivery has an issue — the appointment is already saved.
        console.error('Error sending appointment emails:', emailError);
      }
    } else {
      console.warn('RESEND_API_KEY not set, skipping appointment emails.');
    }

    // WhatsApp/SMS (best-effort, never blocks the booking response)
    const notificationInput = {
      patientName: name,
      patientPhone: phone,
      patientCode: patient.patient_code,
      doctorName: doctor.name,
      doctorPhone: doctor.phone,
      doctorEmail: doctor.email,
      date,
      slot,
      reason,
      manageLink,
      adminPhone: contactData.notificationPhone,
      patientSmsTemplate: contactData.patientSmsTemplate,
      adminSmsTemplate: contactData.adminSmsTemplate,
    };
    await Promise.all([
      sendPatientConfirmation(notificationInput),
      sendAdminAlert(notificationInput),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      manageToken: appointment.manage_token,
    });
  } catch (error) {
    console.error('Appointment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
