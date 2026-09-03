'use client';

import CustomSelect from '@/components/CustomSelect';

interface FloatingLabelInputProps {
  id: string;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  as?: 'input' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

// Exported so other field components (e.g. components/admin/AdminField.tsx)
// can render the exact same look/focus behavior instead of hand-rolling
// their own `border focus:ring-2 ...` classes — that divergence is why
// admin CMS fields looked and focused differently from the booking form.
export const fieldStyle = (icon: React.ReactNode | undefined): React.CSSProperties => ({
  paddingBlock: 'var(--field-py)',
  paddingInlineEnd: 'var(--field-px)',
  paddingInlineStart: icon ? 'var(--field-pl-icon)' : 'var(--field-px)',
  fontSize: 'var(--text-sm)',
  borderRadius: 'var(--field-radius)',
});

export const fieldClasses = (error?: string) =>
  `w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border transition-colors duration-150 focus:outline-none focus-visible:outline-none placeholder-gray-400 dark:placeholder-gray-500 ${
    error
      ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
      : 'border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-gray-300 dark:hover:border-gray-600'
  }`;

const iconClasses =
  'absolute left-3 z-10 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-500 transition-colors duration-150 [&>svg]:w-[clamp(1rem,0.9rem+0.3vw,1.125rem)] [&>svg]:h-[clamp(1rem,0.9rem+0.3vw,1.125rem)]';

const FieldError = ({ id, error }: { id: string; error?: string }) =>
  error ? (
    <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center space-x-1 animate-slide-in-right">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </p>
  ) : null;

const FloatingLabelInput = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  icon,
  as = 'input',
  options,
  onKeyDown,
}: FloatingLabelInputProps) => {
  // For select dropdowns - use custom select
  if (as === 'select' && options) {
    return (
      <CustomSelect
        id={id}
        name={name}
        value={value}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        options={options}
        placeholder={placeholder}
        error={error}
        icon={icon}
      />
    );
  }

  // For textarea
  if (as === 'textarea') {
    return (
      <div className="relative group">
        <div className="relative">
          {icon && (
            <div className={iconClasses} style={{ top: 'var(--field-py)' }}>
              {icon}
            </div>
          )}
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            style={fieldStyle(icon)}
            className={`${fieldClasses(error)} resize-none`}
            rows={3}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>
        <FieldError id={id} error={error} />
      </div>
    );
  }

  // For regular input - simple placeholder only
  return (
    <div className="relative group">
      <div className="relative">
        {icon && (
          <div className={`${iconClasses} top-1/2 -translate-y-1/2`}>
            {icon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          onKeyDown={onKeyDown}
          style={fieldStyle(icon)}
          className={fieldClasses(error)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
};

export default FloatingLabelInput;
