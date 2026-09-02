import { NextRequest, NextResponse } from 'next/server';
import { getPatientByCode } from '@/lib/patients';
import { getAppointmentsForPatient } from '@/lib/appointments';
import { getLatestPrescriptionForPatient } from '@/lib/prescriptions';
import { getCMSData } from '@/lib/cms';

export async function POST(request: NextRequest) {
  try {
    const { patientCode } = await request.json();
    if (!patientCode || typeof patientCode !== 'string') {
      return NextResponse.json({ error: 'Please enter your Patient ID' }, { status: 400 });
    }

    const patient = await getPatientByCode(patientCode);
    if (!patient) {
      return NextResponse.json({ error: 'No patient found with that ID' }, { status: 404 });
    }

    const [visits, latestPrescription, cmsData] = await Promise.all([
      getAppointmentsForPatient(patient.id),
      getLatestPrescriptionForPatient(patient.id),
      getCMSData(),
    ]);

    const doctors = cmsData.doctors?.items || [];
    const visitsWithDoctor = visits.map((v) => ({
      id: v.id,
      date: v.appointment_date,
      slot: v.slot_start,
      status: v.status,
      reason: v.reason,
      doctorName: doctors.find((d) => d.id === v.doctor_id)?.name || 'Unknown',
    }));

    return NextResponse.json({
      patient: { name: patient.name, patientCode: patient.patient_code },
      visits: visitsWithDoctor,
      latestPrescription: latestPrescription
        ? {
            createdAt: latestPrescription.created_at,
            diagnosis: latestPrescription.diagnosis,
            medications: latestPrescription.medications,
            pdfUrl: latestPrescription.pdf_url,
          }
        : null,
    });
  } catch (error) {
    console.error('Patient lookup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to look up patient' },
      { status: 500 }
    );
  }
}
