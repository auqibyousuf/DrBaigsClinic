'use client';

import { AdminInput, AdminSelect } from '@/components/admin/AdminField';
import ImageUpload from '@/components/ImageUpload';

export interface PatientProfileFormState {
  name: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  referenceId: string;
  bloodGroup: string;
  maritalStatus: string;
  occupation: string;
  aadhaarNumber: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressPincode: string;
  photoUrl: string;
}

// Shared validation — same rule set for both "+ Add New Patient" and the
// edit row, run on submit before hitting the API.
export function validatePatientProfile(
  value: PatientProfileFormState
): Partial<Record<keyof PatientProfileFormState, string>> {
  const errors: Partial<Record<keyof PatientProfileFormState, string>> = {};
  if (!value.name.trim()) errors.name = 'Name is required';
  if (!value.phone.trim()) errors.phone = 'Mobile number is required';
  else if (!/^\+?[0-9\s-]{7,15}$/.test(value.phone.trim())) errors.phone = 'Enter a valid phone number';
  if (value.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  return errors;
}

export const emptyPatientProfile: PatientProfileFormState = {
  name: '',
  phone: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  referenceId: '',
  bloodGroup: '',
  maritalStatus: '',
  occupation: '',
  aadhaarNumber: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressPincode: '',
  photoUrl: '',
};

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({
  value: v,
  label: v,
}));

const MARITAL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'].map((v) => ({
  value: v,
  label: v,
}));

interface PatientProfileFormProps {
  value: PatientProfileFormState;
  onChange: (next: PatientProfileFormState) => void;
  errors?: Partial<Record<keyof PatientProfileFormState, string>>;
}

// Shared full patient profile form (MEDISRAY_AUDIT.md finding #4) — used by
// both "+ Add New Patient" and the Patients tab's edit row, so the field set
// stays identical instead of drifting between create and edit.
export default function PatientProfileForm({ value, onChange, errors = {} }: PatientProfileFormProps) {
  const set = (field: keyof PatientProfileFormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AdminInput
          label="Full Name"
          required
          value={value.name}
          onChange={set('name')}
          placeholder="Enter full name"
          error={errors.name}
        />
        <AdminInput
          label="Mobile Number"
          required
          value={value.phone}
          onChange={set('phone')}
          placeholder="Enter mobile number"
          error={errors.phone}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminSelect
          label="Gender"
          value={value.gender}
          onChange={set('gender')}
          options={GENDER_OPTIONS}
          placeholder="Select gender"
        />
        <AdminInput label="Date of Birth" type="date" value={value.dateOfBirth} onChange={set('dateOfBirth')} />
        <AdminInput
          label="Patient Reference ID"
          value={value.referenceId}
          onChange={set('referenceId')}
          placeholder="Optional clinic reference"
        />
      </div>

      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pt-2">
        Secondary Details
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminSelect
          label="Blood Group"
          value={value.bloodGroup}
          onChange={set('bloodGroup')}
          options={BLOOD_GROUP_OPTIONS}
          placeholder="Select blood group"
        />
        <AdminSelect
          label="Marital Status"
          value={value.maritalStatus}
          onChange={set('maritalStatus')}
          options={MARITAL_STATUS_OPTIONS}
          placeholder="Select marital status"
        />
        <AdminInput label="Email ID" type="email" value={value.email} onChange={set('email')} placeholder="Enter email ID" error={errors.email} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AdminInput label="Occupation" value={value.occupation} onChange={set('occupation')} placeholder="Enter occupation" />
        <AdminInput
          label="Aadhaar Card Number"
          value={value.aadhaarNumber}
          onChange={set('aadhaarNumber')}
          placeholder="Enter Aadhaar Card number"
          hint="Sensitive — only collect if your clinic's records require it."
        />
      </div>

      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pt-2">
        Address Details
      </h4>
      <AdminInput
        label="Street Address"
        value={value.addressStreet}
        onChange={set('addressStreet')}
        placeholder="Street / building / area"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminInput label="City" value={value.addressCity} onChange={set('addressCity')} placeholder="Enter city" />
        <AdminInput label="State" value={value.addressState} onChange={set('addressState')} placeholder="Enter state" />
        <AdminInput label="Pincode" value={value.addressPincode} onChange={set('addressPincode')} placeholder="Enter pincode" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Profile Photo
        </label>
        <ImageUpload value={value.photoUrl} onChange={(url) => onChange({ ...value, photoUrl: url })} label="" description="Optional" />
      </div>
    </div>
  );
}
