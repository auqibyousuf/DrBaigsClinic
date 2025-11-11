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
}

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
            <div className="absolute left-3 top-3.5 z-10 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-500 transition-colors duration-200">
              {icon}
            </div>
          )}
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 rounded-lg resize-none transition-all duration-200 ${
              icon ? 'pl-9 sm:pl-10' : 'pl-3'
            } ${
              error
                ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-gray-300 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-primary-400 dark:hover:border-primary-600'
            } focus:outline-none shadow-sm hover:shadow-md focus:shadow-md placeholder-gray-400 dark:placeholder-gray-500`}
            rows={4}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>
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

  // For regular input - simple placeholder only
  return (
    <div className="relative group">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-500 transition-colors duration-200">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          className={`w-full px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 rounded-lg transition-all duration-200 ${
            icon ? 'pl-9 sm:pl-10' : 'pl-3'
          } ${
            error
              ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-300 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-primary-400 dark:hover:border-primary-600'
          } focus:outline-none shadow-sm hover:shadow-md focus:shadow-md placeholder-gray-400 dark:placeholder-gray-500`}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
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
};

export default FloatingLabelInput;
