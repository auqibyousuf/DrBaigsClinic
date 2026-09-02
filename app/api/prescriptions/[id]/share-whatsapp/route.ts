import { NextRequest, NextResponse } from 'next/server';
import { getPrescriptionById } from '@/lib/prescriptions';
import { getPatientById } from '@/lib/patients';
import { getCMSData } from '@/lib/cms';
import { sendPrescriptionWhatsApp } from '@/lib/notifications';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const prescription = await getPrescriptionById(params.id);
    if (!prescription || !prescription.pdf_url) {
      return NextResponse.json({ error: 'Prescription or PDF not found' }, { status: 404 });
    }

    const patient = await getPatientById(prescription.patient_id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const cmsData = await getCMSData();
    const doctor = cmsData.doctors?.items?.find((d) => d.id === prescription.doctor_id);

    await sendPrescriptionWhatsApp(patient.phone, prescription.pdf_url, doctor?.name || 'your doctor');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share prescription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to share prescription' },
      { status: 500 }
    );
  }
}
