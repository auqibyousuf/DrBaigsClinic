'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import FloatingLabelInput from '@/components/FloatingLabelInput';
import DateTimePicker from '@/components/DateTimePicker';
import { useToast } from '@/components/ToastProvider';
import { useCMSData } from '@/lib/cms-client';
import { defaultServices } from '@/lib/default-services';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  doctor?: string;
  dateTime?: string;
  reason?: string;
}

interface BookingFormProps {
  onSuccess?: () => void;
}

export default function BookingForm({ onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    doctor: '',
    date: '',
    slot: '',
    reason: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const { data: servicesData, loading: servicesLoading } = useCMSData('services');
  const { data: doctorsData } = useCMSData('doctors');
  const { data: bookingSettingsData } = useCMSData('bookingSettings');

  // Trust whatever's actually in the CMS once it has loaded — including an
  // empty list, if the admin deleted every service — rather than silently
  // reverting to the hardcoded defaults, which would hide real add/delete
  // changes from the booking form. The hardcoded list is only ever a
  // placeholder while the real data is still in flight.
  const services = servicesLoading ? defaultServices : servicesData?.items || [];
  const doctors = (doctorsData?.items || []).filter((d: { isActive: boolean }) => d.isActive);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      newErrors.name = 'Full name is required';
    } else if (nameTrimmed.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (nameTrimmed.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(nameTrimmed)) {
      newErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = 'Please enter a valid email address (e.g., name@example.com)';
      } else if (emailTrimmed.length > 100) {
        newErrors.email = 'Email address cannot exceed 100 characters';
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailTrimmed)) {
        newErrors.email = 'Email format is invalid. Please check and try again';
      }
    }

    const phoneTrimmed = formData.phone.trim();
    if (!phoneTrimmed) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneDigits = phoneTrimmed.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = 'Phone number must contain at least 10 digits';
      } else if (phoneDigits.length > 15) {
        newErrors.phone = 'Phone number cannot exceed 15 digits';
      } else if (!/^[\d\s\-\+\(\)]+$/.test(phoneTrimmed)) {
        newErrors.phone = 'Phone number can only contain digits, spaces, hyphens, parentheses, and + sign';
      }
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service';
    }

    if (!formData.doctor) {
      newErrors.doctor = 'Please choose a doctor';
    }

    if (!formData.date || !formData.slot) {
      newErrors.dateTime = 'Please choose a day and time for your appointment';
    }

    const reasonTrimmed = formData.reason.trim();
    if (!reasonTrimmed) {
      newErrors.reason = 'Please tell us the reason for your consultation';
    } else if (reasonTrimmed.length < 10) {
      newErrors.reason = 'Please provide a bit more detail (at least 10 characters)';
    } else if (reasonTrimmed.length > 500) {
      newErrors.reason = 'Reason cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateTimeChange = ({ date, slot }: { date: string; slot: string }) => {
    setFormData((prev) => ({ ...prev, date, slot }));
    if (errors.dateTime) {
      setErrors((prev) => ({ ...prev, dateTime: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      showToast('error', 'Please fix the validation errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedService = services.find((s: { id: string; title: string }) => s.id === formData.service);
      const serviceName = selectedService ? selectedService.title : 'Unknown Service';

      const response = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          service: serviceName,
          doctorId: formData.doctor,
          date: formData.date,
          slot: formData.slot,
          reason: formData.reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to submit appointment request';
        const errorDetails = data.details ? ` ${data.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      showToast('success', 'Thank you! Your appointment has been booked. You will receive a confirmation shortly.');

      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        doctor: '',
        date: '',
        slot: '',
        reason: '',
      });
      setErrors({});
      onSuccess?.();
    } catch (error) {
      console.error('Appointment submission error:', error);
      showToast('error', error instanceof Error ? error.message : 'Failed to submit your appointment request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate aria-label="Appointment booking form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-field">
          <FloatingLabelInput
            id="name"
            name="name"
            type="text"
            placeholder="Full Name *"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        </div>
        <div className="form-field" style={{ animationDelay: '0.1s' }}>
          <FloatingLabelInput
            id="email"
            name="email"
            type="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-field" style={{ animationDelay: '0.2s' }}>
          <FloatingLabelInput
            id="phone"
            name="phone"
            type="tel"
            placeholder="Phone Number *"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />
        </div>
        <div className="form-field" style={{ animationDelay: '0.3s' }}>
          <FloatingLabelInput
            id="service"
            name="service"
            placeholder="Select a service *"
            value={formData.service}
            onChange={handleChange}
            error={errors.service}
            as="select"
            options={[
              { value: '', label: 'Select a service' },
              ...services.map((s: { id: string; title: string }) => ({ value: s.id, label: s.title })),
            ]}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>
      </div>
      <div className="form-field" style={{ animationDelay: '0.35s' }}>
        <FloatingLabelInput
          id="doctor"
          name="doctor"
          placeholder="Choose a doctor *"
          value={formData.doctor}
          onChange={handleChange}
          error={errors.doctor}
          as="select"
          options={[
            { value: '', label: 'Choose a doctor' },
            ...doctors.map((d: { id: string; name: string; specialty: string }) => ({
              value: d.id,
              label: d.specialty ? `${d.name} — ${d.specialty}` : d.name,
            })),
          ]}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>
      <div className="form-field" style={{ animationDelay: '0.4s' }}>
        <DateTimePicker
          name="dateTime"
          doctorId={formData.doctor}
          date={formData.date}
          slot={formData.slot}
          onChange={handleDateTimeChange}
          error={errors.dateTime}
          closedDates={bookingSettingsData?.closedDates || []}
          closedWeekdays={bookingSettingsData?.closedWeekdays || []}
        />
      </div>
      <div className="form-field" style={{ animationDelay: '0.45s' }}>
        <FloatingLabelInput
          id="reason"
          name="reason"
          placeholder="Reason for consultation *"
          value={formData.reason}
          onChange={handleChange}
          error={errors.reason}
          as="textarea"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
      </div>
      <div className="pt-1">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          className="w-full text-sm sm:text-base"
        >
          <span className="flex items-center justify-center space-x-2">
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Book Appointment</span>
              </>
            )}
          </span>
        </Button>
      </div>
    </form>
  );
}
