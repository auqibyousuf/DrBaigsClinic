'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import Modal from '@/components/Modal';
import BookingForm from '@/components/BookingForm';

interface BookingModalContextType {
  open: () => void;
  close: () => void;
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined);

export function useBookingModal() {
  const context = useContext(BookingModalContext);
  if (!context) {
    throw new Error('useBookingModal must be used within BookingModalProvider');
  }
  return context;
}

export default function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <BookingModalContext.Provider value={{ open, close }}>
      {children}
      <Modal isOpen={isOpen} onClose={close} title="Book an Appointment">
        <h2
          className="font-bold text-gray-900 dark:text-white mb-1"
          style={{ fontSize: 'var(--text-2xl)' }}
        >
          Book Your Appointment
        </h2>
        <p
          className="text-gray-500 dark:text-gray-400"
          style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}
        >
          Choose a doctor, pick a day and time, and tell us why you'd like to visit.
        </p>
        <BookingForm onSuccess={close} />
      </Modal>
    </BookingModalContext.Provider>
  );
}
