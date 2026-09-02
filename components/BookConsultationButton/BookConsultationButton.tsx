'use client';

import Button from '@/components/Button';
import { useBookingModal } from '@/components/BookingModalProvider';
import { CalendarCheck } from '@phosphor-icons/react';

interface BookConsultationButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

// Service detail pages are server components (they fetch CMS data at
// request time), so the "Book Consultation" button there needs this small
// client boundary to reach useBookingModal and open the modal directly
// instead of scrolling to a page section that no longer exists.
export default function BookConsultationButton({
  variant = 'primary',
  size = 'lg',
  className,
  children = 'Book Consultation',
}: BookConsultationButtonProps) {
  const { open } = useBookingModal();

  return (
    <Button onClick={open} variant={variant} size={size} icon={<CalendarCheck weight="bold" />} className={className}>
      {children}
    </Button>
  );
}
