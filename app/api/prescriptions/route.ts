import { NextRequest, NextResponse } from 'next/server';
import {
  getAppointmentById,
  finishAppointment,
  createFollowUpAppointment,
  getAppointmentsForDate,
  getAppointmentsForPatient,
} from '@/lib/appointments';
import { listSchedulesForDoctor, expandSlotsForDate } from '@/lib/schedules';
import { getPatientById } from '@/lib/patients';
import { generatePrescriptionPdf } from '@/lib/prescription-pdf';
import {
  setPrescriptionPdfUrl,
  summarizeMedicalHistory,
  upsertPrescription,
  uploadPrescriptionPdf,
} from '@/lib/prescriptions';
import { getCMSData } from '@/lib/cms';
import { sendPatientConfirmation } from '@/lib/notifications';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      appointmentId,
      diagnosis,
      medications = [],
      symptoms = [],
      examinations = [],
      investigations = [],
      advices = [],
      vitals = [],
      followUpDate,
      additionalNotes,
      privateNotes,
      medicalHistoryTags = [],
      medicalHistoryNoKnown = [],
      medicalRecords = [],
      notes,
    } = await request.json();

    const hasAnyContent =
      medications.length > 0 ||
      symptoms.length > 0 ||
      diagnosis ||
      examinations.length > 0 ||
      investigations.length > 0;

    if (!appointmentId || !hasAnyContent) {
      return NextResponse.json(
        { error: 'appointmentId and at least one clinical entry (symptom, diagnosis, medication, etc.) are required' },
        { status: 400 }
      );
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    if (!appointment.patient_id) {
      return NextResponse.json(
        { error: 'This appointment has no linked patient record (booked before the patient system existed)' },
        { status: 400 }
      );
    }

    const patient = await getPatientById(appointment.patient_id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const cmsData = await getCMSData();
    const doctor = cmsData.doctors?.items?.find((d) => d.id === appointment.doctor_id);

    const prescription = await upsertPrescription({
      appointment_id: appointment.id,
      patient_id: patient.id,
      doctor_id: appointment.doctor_id,
      diagnosis,
      medications,
      symptoms,
      examinations,
      investigations,
      advices,
      vitals,
      follow_up_date: followUpDate || null,
      additional_notes: additionalNotes,
      private_notes: privateNotes,
      medical_history: summarizeMedicalHistory(medicalHistoryTags, medicalHistoryNoKnown),
      medical_history_tags: medicalHistoryTags,
      medical_history_no_known: medicalHistoryNoKnown,
      medical_records: medicalRecords,
      notes,
    });

    const pdfBytes = await generatePrescriptionPdf(prescription, patient, {
      name: doctor?.name || 'Doctor',
      specialty: doctor?.specialty,
      qualification: doctor?.qualification,
    });
    const pdfUrl = await uploadPrescriptionPdf(prescription.id, pdfBytes);
    await setPrescriptionPdfUrl(prescription.id, pdfUrl);

    // Writing a prescription is this app's "End Visit" moment — mirrors
    // Medisray, where finishing the consultation and generating the
    // prescription happen together, moving the appointment out of the Queue.
    if (appointment.status === 'confirmed') {
      await finishAppointment(appointment.id);
    }

    // A follow-up date on the prescription auto-books the next visit and
    // tells the patient, instead of leaving them to remember to call back —
    // matches how a booking confirmation already works. Skipped if a
    // confirmed follow-up already exists for this patient/doctor/date (e.g.
    // the admin re-saves the same prescription) so we don't double-book.
    let followUpAppointment = null;
    if (followUpDate) {
      const existingVisits = await getAppointmentsForPatient(patient.id);
      const alreadyBooked = existingVisits.some(
        (v) =>
          v.doctor_id === appointment.doctor_id &&
          v.appointment_date === followUpDate &&
          v.status === 'confirmed'
      );

      if (!alreadyBooked) {
        const [bookedOnDay, schedules] = await Promise.all([
          getAppointmentsForDate(followUpDate, appointment.doctor_id),
          listSchedulesForDoctor(appointment.doctor_id),
        ]);
        const takenSlots = new Set(bookedOnDay.map((a) => a.slot_start));
        const candidateSlots = expandSlotsForDate(schedules, followUpDate, cmsData.bookingSettings);
        const freeSlot = candidateSlots.find((s) => !takenSlots.has(s)) || null;

        followUpAppointment = await createFollowUpAppointment({
          patient_name: patient.name,
          patient_phone: patient.phone,
          patient_email: patient.email || undefined,
          patient_id: patient.id,
          doctor_id: appointment.doctor_id,
          appointment_date: followUpDate,
          slot_start: freeSlot,
          reason: `Follow-up: ${diagnosis || appointment.reason}`,
        });

        try {
          await sendPatientConfirmation({
            patientName: patient.name,
            patientPhone: patient.phone,
            patientCode: patient.patient_code,
            doctorName: doctor?.name || 'your doctor',
            doctorPhone: doctor?.phone,
            date: followUpDate,
            slot: freeSlot || 'to be confirmed by the clinic',
            reason: followUpAppointment.reason,
            manageLink: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/manage-appointment/${followUpAppointment.manage_token}`,
            patientSmsTemplate: cmsData.contact?.patientSmsTemplate,
          });
        } catch (notifyErr) {
          // Booking succeeded even if the message failed to send — never
          // let a notification failure undo a real appointment.
          console.error('Follow-up notification failed:', notifyErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      prescription: { ...prescription, pdf_url: pdfUrl },
      followUpAppointment,
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save prescription' },
      { status: 500 }
    );
  }
}
