'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Reusable tabbed-navigation primitive — no per-usage hand-rolled tab bars.
// Plain context + role="tablist"/"tab"/"tabpanel" (no external primitive
// ships a Tabs component in this project's base-ui package), styled once
// here so every tab bar in the app looks and behaves the same.

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* components must be used within <Tabs>');
  return ctx;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, setValue: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex flex-wrap items-center gap-1 border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: active, setValue } = useTabsContext();
  const isActive = active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setValue(value)}
      className={cn(
        'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer',
        'border-b-2 -mb-px',
        isActive
          ? 'border-primary-600 text-primary-700 dark:text-primary-400'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: active } = useTabsContext();
  if (active !== value) return null;
  return (
    <div role="tabpanel" className={cn('pt-5', className)}>
      {children}
    </div>
  );
}
