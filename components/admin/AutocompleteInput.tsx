'use client';

import { useEffect, useRef, useState } from 'react';
import type { ClinicalTermCategory } from '@/lib/clinical-terms';

interface AutocompleteInputProps {
  category: ClinicalTermCategory;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Single-value sibling of AutocompleteTagInput — for fields like a
// medication's name, where each row is one value (not a multi-value tag
// list), but should still suggest from and save to the shared clinical
// terms list like Symptoms/Diagnosis/etc.
export default function AutocompleteInput({ category, value, onChange, placeholder }: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/clinical-terms?category=${category}&query=${encodeURIComponent(value)}`,
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
  }, [value, category]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const persistTerm = async (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return;
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

  const filtered = suggestions.filter((s) => s.toLowerCase() !== value.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => persistTerm(value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus-visible:outline-none focus:ring-1 focus:ring-primary-500"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(s);
                setOpen(false);
                persistTerm(s);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/30 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
