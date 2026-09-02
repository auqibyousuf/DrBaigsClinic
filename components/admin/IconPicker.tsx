'use client';

import { useMemo, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { allIconNames, suggestedIconNames, getIcon } from '@/lib/icons';

function IconGrid({
  names,
  value,
  onPick,
}: {
  names: string[];
  value: string | undefined;
  onPick: (name: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
      {names.map((name) => {
        const Icon = getIcon(name);
        if (!Icon) return null;
        return (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onPick(name)}
            className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border transition-colors ${
              value === name
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20'
            }`}
          >
            <Icon className="w-5 h-5" weight="duotone" />
          </button>
        );
      })}
    </div>
  );
}

interface IconPickerProps {
  value?: string;
  onChange: (name: string) => void;
  label?: string;
}

// Click the current icon to open the full Phosphor library (~1,500 icons,
// lib/icons.ts). A short "Suggested" shortlist sits at the top for quick
// picks, and the entire library is always browsable below it in a
// scrolling grid — nobody has 1,500 icon names memorized, so search is a
// filter on top of browsing, not the only way in. Close without picking to
// cancel.
export default function IconPicker({ value, onChange, label = 'Icon' }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const CurrentIcon = getIcon(value);

  const filteredAll = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allIconNames;
    return allIconNames.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  const filteredSuggested = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestedIconNames;
    return suggestedIconNames.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
      >
        <span className="w-6 h-6 flex items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex-shrink-0">
          {CurrentIcon ? <CurrentIcon className="w-4 h-4" weight="duotone" /> : <span className="text-xs">?</span>}
        </span>
        <span className="truncate">{value || 'Choose icon'}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(94vw,var(--modal-w-lg))] max-w-[min(94vw,var(--modal-w-lg))] sm:max-w-[min(94vw,var(--modal-w-lg))] max-h-[85vh] overflow-hidden flex flex-col rounded-2xl p-0">
          <DialogTitle className="sr-only">Choose an icon</DialogTitle>
          <div className="p-5 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white" style={{ fontSize: 'var(--text-xl)' }}>
                Choose an icon
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">{allIconNames.length} icons in library</span>
            </div>
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all icons..."
                style={{
                  paddingBlock: 'var(--field-py)',
                  paddingInlineStart: 'var(--field-pl-icon)',
                  paddingInlineEnd: 'var(--field-px)',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--field-radius)',
                }}
                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
              />
            </div>
          </div>

          <div className="overflow-y-auto p-5 space-y-5">
            {filteredSuggested.length === 0 && filteredAll.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No icons match "{query}".</p>
            )}

            {filteredSuggested.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  Suggested
                </p>
                <IconGrid names={filteredSuggested} value={value} onPick={(name) => { onChange(name); setOpen(false); }} />
              </div>
            )}

            {filteredAll.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  All icons ({filteredAll.length})
                </p>
                <IconGrid names={filteredAll} value={value} onPick={(name) => { onChange(name); setOpen(false); }} />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
