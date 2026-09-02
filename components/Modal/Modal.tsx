'use client';

// Thin wrapper around shadcn/ui's Dialog (components/ui/dialog.tsx, built on
// Base UI's portaled Dialog primitive), preserving this project's original
// Modal API (`isOpen`/`onClose`/`title`/`children`) so BookingModalProvider
// and every future consumer stay unchanged. Portaling to document.body with
// proper focus-trap/Escape/scroll-lock handling comes for free from Base UI
// instead of being hand-rolled here.

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[min(94vw,var(--modal-w-lg))] max-w-[min(94vw,var(--modal-w-lg))] sm:max-w-[min(94vw,var(--modal-w-lg))] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl p-0 shadow-elevated"
      >
        {/* DialogTitle is required for accessibility (announced by screen
            readers) even when we don't want a visible header bar here — the
            actual visual heading is rendered by each modal's own content. */}
        <DialogTitle className="sr-only">{title || 'Dialog'}</DialogTitle>
        <div style={{ padding: 'var(--space-lg)' }}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
