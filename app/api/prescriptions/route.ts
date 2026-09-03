import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, finishAppointment } from '@/lib/appointments';
import { getPatientById } from '@/lib/patients';
import { generatePrescriptionPdf } from '@/lib/prescription-pdf';
import { setPrescriptionPdfUrl, upsertPrescription, uploadPrescriptionPdf } from '@/lib/prescriptions';
import { getCMSData } from '@/lib/cms';

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

    return NextResponse.json({ success: true, prescription: { ...prescription, pdf_url: pdfUrl } });
  } catch (error) {
    console.error('Create prescription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save prescription' },
      { status: 500 }
    );
  }
}
