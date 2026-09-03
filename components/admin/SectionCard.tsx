'use client';

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

// One consistent per-module card shell (icon chip + title + body) — mirrors
// Medisray's Digital-Rx layout (MEDISRAY_AUDIT.md finding #2/#9), used for
// every consultation section so they all read as one system instead of a
// mix of ad hoc labeled blocks.
export default function SectionCard({ icon, title, children, className = '' }: SectionCardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 ${className}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex-shrink-0">
          {icon}
        </span>
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
      </div>
      {children}
    </div>
  );
}
