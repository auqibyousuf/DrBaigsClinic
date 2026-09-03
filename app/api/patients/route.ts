import { NextRequest, NextResponse } from 'next/server';
import { createPatientProfile } from '@/lib/patients';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

// Admin-initiated "+ Add New Patient" — used by the Patients tab and the
// walk-in consultation search (see MEDISRAY_AUDIT.md finding #4).
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const patient = await createPatientProfile({
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim(),
      date_of_birth: body.dateOfBirth || undefined,
      gender: body.gender || undefined,
      blood_group: body.bloodGroup || undefined,
      marital_status: body.maritalStatus || undefined,
      occupation: body.occupation?.trim(),
      address_street: body.addressStreet?.trim(),
      address_city: body.addressCity?.trim(),
      address_state: body.addressState?.trim(),
      address_pincode: body.addressPincode?.trim(),
      photo_url: body.photoUrl || undefined,
      reference_id: body.referenceId?.trim(),
      aadhaar_number: body.aadhaarNumber?.trim(),
    });

    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error('Create patient error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create patient' },
      { status: 500 }
    );
  }
}
