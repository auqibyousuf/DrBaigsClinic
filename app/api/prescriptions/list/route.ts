import { NextRequest, NextResponse } from 'next/server';
import { listAllPrescriptions } from '@/lib/prescriptions';
import { getAppointmentById } from '@/lib/appointments';
import { getPatientById } from '@/lib/patients';
import { getCMSData } from '@/lib/cms';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [prescriptions, cmsData] = await Promise.all([listAllPrescriptions(), getCMSData()]);
    const doctors = cmsData.doctors?.items || [];

    const enriched = await Promise.all(
      prescriptions.map(async (p) => {
        const [appointment, patient] = await Promise.all([
          getAppointmentById(p.appointment_id),
          getPatientById(p.patient_id),
        ]);
        return {
          id: p.id,
          appointmentId: p.appointment_id,
          doctorId: p.doctor_id,
          createdAt: p.created_at,
          diagnosis: p.diagnosis,
          pdfUrl: p.pdf_url,
          doctorName: doctors.find((d) => d.id === p.doctor_id)?.name || 'Unknown',
          patientName: patient?.name || appointment?.patient_name || 'Unknown',
          patientCode: patient?.patient_code || null,
          patientPhone: patient?.phone || appointment?.patient_phone || null,
          appointmentDate: appointment?.appointment_date || null,
          slot: appointment?.slot_start || null,
          reason: appointment?.reason || '',
          medications: p.medications,
          symptoms: p.symptoms,
          examinations: p.examinations,
          investigations: p.investigations,
          advices: p.advices,
          vitals: p.vitals,
          followUpDate: p.follow_up_date,
          additionalNotes: p.additional_notes,
          privateNotes: p.private_notes,
          medicalHistoryTags: p.medical_history_tags,
          medicalHistoryNoKnown: p.medical_history_no_known,
          medicalRecords: p.medical_records,
        };
      })
    );

    return NextResponse.json({ prescriptions: enriched });
  } catch (error) {
    console.error('List prescriptions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list prescriptions' },
      { status: 500 }
    );
  }
}
