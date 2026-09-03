'use client';

// Thin wrapper around shadcn/ui's Select (components/ui/select.tsx, built on
// Base UI's portaled Select primitive) that preserves the exact external API
// this project's forms already call (`value`/`onChange` as a synthetic
// change-event, `options`, `error`, `icon`, `placeholder`) — so no consuming
// file (FloatingLabelInput, BookingForm, every admin editor) needs to change.
// Portaling the dropdown to document.body is what actually fixes the
// z-index/stacking bugs we kept hitting with the old hand-rolled version.

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  // Smaller fixed padding for dense contexts (table filter bars) instead of
  // the fluid --field-py token sized for standalone form fields.
  compact?: boolean;
}

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  icon,
  className = '',
  compact = false,
}: CustomSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);
  // The empty-value placeholder ("Select an option") is shown via `placeholder`
  // already — it shouldn't also appear as a selectable row. Also drop any
  // option with a blank label (e.g. an unfinished CMS entry).
  const selectableOptions = options.filter((opt) => opt.value !== '' && opt.label?.trim());

  const handleValueChange = (newValue: string | null) => {
    const syntheticEvent = {
      target: { name, value: newValue ?? '' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <div className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />
      {/* Always pass a defined value (never undefined) so the Select stays
          controlled from the very first render — switching between
          undefined/defined mid-lifecycle is what Base UI was warning about. */}
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger
          id={id}
          style={
            compact
              ? { borderRadius: 'var(--field-radius)' }
              : {
                  paddingBlock: 'var(--field-py)',
                  paddingInlineEnd: 'var(--field-px)',
                  paddingInlineStart: icon ? 'var(--field-pl-icon)' : 'var(--field-px)',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--field-radius)',
                }
          }
          className={`w-full !h-auto cursor-pointer bg-white dark:bg-gray-800 transition-colors duration-150 data-open:bg-white dark:data-open:bg-gray-800 focus-visible:outline-none ${
            compact ? 'py-1.5 px-3 text-sm' : ''
          } ${
            error
              ? 'border border-red-300 dark:border-red-600 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/15'
              : 'border border-gray-200 dark:border-gray-700 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/15 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none [&>svg]:w-[clamp(1rem,0.9rem+0.3vw,1.125rem)] [&>svg]:h-[clamp(1rem,0.9rem+0.3vw,1.125rem)]">
              {icon}
            </div>
          )}
          <span
            className={`truncate flex-1 text-left ${
              selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </SelectTrigger>
        <SelectContent className={`w-[var(--anchor-width)] p-1.5 ${compact ? 'min-w-0' : ''}`}>
          {selectableOptions.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              No options available
            </div>
          ) : (
            selectableOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer text-sm rounded-lg"
                style={{ paddingBlock: 'var(--field-py)', paddingInline: 'var(--field-px)' }}
              >
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center space-x-1 animate-slide-in-right">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
