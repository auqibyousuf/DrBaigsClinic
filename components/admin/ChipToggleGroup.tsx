'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { fieldStyle, fieldClasses } from '@/components/FloatingLabelInput/FloatingLabelInput';

interface ChipToggleGroupProps {
  label: string;
  presets: string[];
  values: string[];
  onChange: (values: string[]) => void;
  noKnownHistory: boolean;
  onNoKnownHistoryChange: (checked: boolean) => void;
}

// The Medisray "Medical History" pattern (MEDISRAY_AUDIT.md finding #2): a
// grid of preset chips that toggle on/off, a "No known history" escape
// hatch, and a custom-entry field for anything not in the preset list —
// reused across Medical Condition/Allergies/Family History/Lifestyle/
// Surgical History instead of five bespoke implementations.
export default function ChipToggleGroup({
  label,
  presets,
  values,
  onChange,
  noKnownHistory,
  onNoKnownHistoryChange,
}: ChipToggleGroupProps) {
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggle = (preset: string) => {
    onChange(values.includes(preset) ? values.filter((v) => v !== preset) : [...values, preset]);
  };

  const addCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setCustomValue('');
    setShowCustomInput(false);
  };

  const allChips = Array.from(new Set([...presets, ...values]));

  return (
    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 first:border-0 first:pt-0">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white">{label}</h4>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={noKnownHistory}
            onChange={(e) => onNoKnownHistoryChange(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
          No known history
        </label>
      </div>

      {!noKnownHistory && (
        <>
          <div className="flex flex-wrap gap-2">
            {allChips.map((chip) => {
              const active = values.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggle(chip)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowCustomInput((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {showCustomInput && (
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
                placeholder={`Add custom ${label.toLowerCase()} entry`}
                style={fieldStyle(undefined)}
                className={fieldClasses()}
                autoFocus
              />
              <button
                type="button"
                onClick={addCustom}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium cursor-pointer"
              >
                Add
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
