'use client';

import { useCMSReady } from '@/lib/cms-client';

// Nothing renders — not even the header — until the CMS data every section
// needs has actually arrived. Replaces the old behavior where the header,
// hero, and footer each fetched independently and popped in one at a time
// (visible as a blank/placeholder logo swapping to the real one, layout
// shifting as sections resolved). The page now appears once, fully formed.
export default function SiteReadyGate({ children }: { children: React.ReactNode }) {
  const ready = useCMSReady();

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white dark:bg-gray-950">
        <div
          className="w-10 h-10 rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-primary-600 animate-spin"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return <>{children}</>;
}
