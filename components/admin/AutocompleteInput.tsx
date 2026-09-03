'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { fieldStyle, fieldClasses } from '@/components/FloatingLabelInput/FloatingLabelInput';
import type { ClinicalTermCategory } from '@/lib/clinical-terms';

interface AutocompleteInputProps {
  category: ClinicalTermCategory;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Single-value sibling of AutocompleteTagInput — same field look (shared
// fieldStyle/fieldClasses) and same "search or add" behavior, just for a
// field like a medication's name where each row is one value, not a
// multi-value tag list. The suggestion list is portaled to document.body
// (like CustomSelect/DropdownMenu already do) because this input lives
// inside the Medications table's horizontally-scrolling wrapper, which
// would otherwise clip an absolutely-positioned dropdown.
export default function AutocompleteInput({ category, value, onChange, placeholder }: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openDropdown = () => {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect();
      setRect({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
    }
    setOpen(true);
  };

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
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          openDropdown();
        }}
        onFocus={openDropdown}
        onBlur={() => persistTerm(value)}
        placeholder={placeholder}
        style={fieldStyle(undefined)}
        className={fieldClasses()}
      />
      {open &&
        filtered.length > 0 &&
        rect &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: 'absolute', top: rect.top, left: rect.left, width: rect.width }}
            className="z-50 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
          >
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
          </div>,
          document.body
        )}
    </div>
  );
}
