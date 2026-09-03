'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { fieldStyle, fieldClasses } from '@/components/FloatingLabelInput/FloatingLabelInput';
import type { ClinicalTermCategory } from '@/lib/clinical-terms';

interface AutocompleteTagInputProps {
  label?: string;
  category: ClinicalTermCategory;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

// Reusable "search or add" tag input shared by every modular Digital-Rx
// section (Symptoms/Diagnosis/Examinations/Investigation/Advices/Medications)
// — one component, one look, one focus style, instead of each section
// hand-rolling its own input. See MEDISRAY_AUDIT.md finding #2.
export default function AutocompleteTagInput({
  label,
  category,
  values,
  onChange,
  placeholder,
}: AutocompleteTagInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/clinical-terms?category=${category}&query=${encodeURIComponent(query)}`,
          { credentials: 'include' }
        );
        if (!res.ok) return;
        const result = await res.json();
        setSuggestions((result.terms || []).map((t: { value: string }) => t.value));
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [query, category]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addValue = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setQuery('');
    setOpen(false);
    try {
      await fetch('/api/clinical-terms', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, value: trimmed }),
      });
    } catch {
      // Best-effort — usage tracking failing shouldn't block the doctor.
    }
  };

  const removeValue = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  const filteredSuggestions = suggestions.filter((s) => !values.includes(s));
  const exactMatch = filteredSuggestions.some((s) => s.toLowerCase() === query.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                className="cursor-pointer text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                aria-label={`Remove ${value}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.trim()) {
            e.preventDefault();
            addValue(query);
          }
        }}
        placeholder={placeholder || `Search ${label?.toLowerCase() || 'options'}`}
        style={fieldStyle(undefined)}
        className={fieldClasses()}
      />

      {open && (filteredSuggestions.length > 0 || query.trim()) && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addValue(s)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/30 cursor-pointer"
            >
              {s}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={() => addValue(query)}
              className="w-full text-left px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 cursor-pointer border-t border-gray-100 dark:border-gray-700"
            >
              + Add custom &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
