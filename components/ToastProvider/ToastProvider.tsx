'use client';

// Thin wrapper preserving this project's original `useToast()` API
// (`showToast('success' | 'error' | 'info', message)`, called from ~30 sites
// across the app) while delegating the actual rendering to shadcn/ui's
// sonner-based Toaster — no consuming file needs to change.

import { ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export function useToast() {
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    if (type === 'success') sonnerToast.success(message);
    else if (type === 'error') sonnerToast.error(message);
    else sonnerToast.info(message);
  };

  return { showToast };
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
