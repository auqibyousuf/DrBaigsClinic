'use client';

// Admin-form field components (label above, no floating placeholder-as-label
// like the public FloatingLabelInput) that share the exact same box/focus
// styling — same tokens, same rounded focus ring — instead of the raw
// `<input className="px-4 py-2 border ...">` markup scattered through the
// admin dashboard, which looked and focused differently from every public
// form (square-ish focus vs. the rounded one everywhere else).
import { fieldStyle, fieldClasses } from '@/components/FloatingLabelInput/FloatingLabelInput';
import CustomSelect from '@/components/CustomSelect';

interface FieldWrapperProps {
  label?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, required, hint, children }: FieldWrapperProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

interface AdminInputProps extends Omit<FieldWrapperProps, 'children'> {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
}

export function AdminInput({ label, required, hint, type = 'text', value, onChange, placeholder, name, id, disabled }: AdminInputProps) {
  return (
    <FieldWrapper label={label} required={required} hint={hint}>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={fieldStyle(undefined)}
        className={`${fieldClasses()} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
    </FieldWrapper>
  );
}

interface AdminTextareaProps extends Omit<FieldWrapperProps, 'children'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  name?: string;
  id?: string;
}

export function AdminTextarea({
  label,
  required,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
  mono = false,
  name,
  id,
}: AdminTextareaProps) {
  return (
    <FieldWrapper label={label} required={required} hint={hint}>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={fieldStyle(undefined)}
        className={`${fieldClasses()} resize-y ${mono ? 'font-mono' : ''}`}
      />
    </FieldWrapper>
  );
}

interface AdminSelectProps extends Omit<FieldWrapperProps, 'children'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  name?: string;
  id?: string;
}

export function AdminSelect({ label, required, hint, value, onChange, options, placeholder, name, id }: AdminSelectProps) {
  return (
    <FieldWrapper label={label} required={required} hint={hint}>
      <CustomSelect
        id={id || name || 'admin-select'}
        name={name || id || 'admin-select'}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
      />
    </FieldWrapper>
  );
}
