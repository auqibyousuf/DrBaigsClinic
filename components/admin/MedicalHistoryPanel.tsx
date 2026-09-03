'use client';

import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminField';
import type { MedicalHistoryCategory, MedicalHistoryTag } from '@/lib/prescriptions';

const CATEGORIES: { id: MedicalHistoryCategory; label: string; presets: string[] }[] = [
  {
    id: 'condition',
    label: 'Medical Condition',
    presets: [
      'Rheumatoid Arthritis',
      'CABG (Coronary)',
      'Arthroplasty N',
      'Osteoarthritis',
      'Fractures',
      'ACL Reconstruction',
      'THA',
      'Lower back pain',
    ],
  },
  { id: 'allergy', label: 'Allergies', presets: ['Nuts', 'Mustard', 'Gluten', 'Peanuts', 'Milk', 'Soya', 'Fish', 'Eggs'] },
  {
    id: 'family',
    label: 'Family History',
    presets: ['Asthma', 'Food intolerance', 'Hypertension', 'CKD', 'Rheumatoid arthritis', 'Hypothyroidism', 'Hyperthyroidism', 'Diabetes'],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    presets: ['Smoking', 'Alcohol Use', 'Tobacco Use', 'Sedentary Lifestyle', 'Regular Exercise'],
  },
];

interface MedicalHistoryPanelProps {
  tags: MedicalHistoryTag[];
  onChangeTags: (tags: MedicalHistoryTag[]) => void;
  noKnown: MedicalHistoryCategory[];
  onChangeNoKnown: (categories: MedicalHistoryCategory[]) => void;
}

// Medical History module (Medisray-style): categorized tag pickers —
// clicking "+" on a tag selects it and opens its detail (since/status/note)
// in the side panel; "No known history" clears and disables a category.
export default function MedicalHistoryPanel({ tags, onChangeTags, noKnown, onChangeNoKnown }: MedicalHistoryPanelProps) {
  const [selected, setSelected] = useState<{ category: MedicalHistoryCategory; value: string } | null>(null);
  // Custom values typed in this session — merged with presets so a typed
  // tag stays visible as a chip even before/after it's selected.
  const [customEntries, setCustomEntries] = useState<Record<MedicalHistoryCategory, string[]>>({
    condition: [],
    allergy: [],
    family: [],
    lifestyle: [],
  });
  const [addingTo, setAddingTo] = useState<MedicalHistoryCategory | null>(null);
  const [customValue, setCustomValue] = useState('');

  const getTag = (category: MedicalHistoryCategory, value: string) =>
    tags.find((t) => t.category === category && t.value === value);

  const toggleTag = (category: MedicalHistoryCategory, value: string) => {
    if (getTag(category, value)) {
      onChangeTags(tags.filter((t) => !(t.category === category && t.value === value)));
      if (selected?.category === category && selected.value === value) setSelected(null);
    } else {
      onChangeTags([...tags, { category, value, status: 'active' }]);
      setSelected({ category, value });
    }
  };

  const updateSelectedTag = (partial: Partial<MedicalHistoryTag>) => {
    if (!selected) return;
    onChangeTags(
      tags.map((t) => (t.category === selected.category && t.value === selected.value ? { ...t, ...partial } : t))
    );
  };

  const toggleNoKnown = (category: MedicalHistoryCategory) => {
    if (noKnown.includes(category)) {
      onChangeNoKnown(noKnown.filter((c) => c !== category));
    } else {
      onChangeNoKnown([...noKnown, category]);
      onChangeTags(tags.filter((t) => t.category !== category));
      if (selected?.category === category) setSelected(null);
    }
  };

  const selectedTag = selected ? getTag(selected.category, selected.value) : null;

  // A previously-saved custom tag (not in the preset list) still needs a
  // chip to render, even before this session added it to customEntries.
  const chipsFor = (cat: (typeof CATEGORIES)[number]) => {
    const savedCustom = tags.filter((t) => t.category === cat.id && !cat.presets.includes(t.value)).map((t) => t.value);
    return Array.from(new Set([...cat.presets, ...customEntries[cat.id], ...savedCustom]));
  };

  const submitCustom = (category: MedicalHistoryCategory) => {
    const value = customValue.trim();
    if (!value) {
      setAddingTo(null);
      return;
    }
    setCustomEntries((prev) => ({ ...prev, [category]: [...prev[category], value] }));
    if (!getTag(category, value)) toggleTag(category, value);
    setCustomValue('');
    setAddingTo(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
        {CATEGORIES.map((cat) => {
          const disabled = noKnown.includes(cat.id);
          return (
            <div key={cat.id} className={disabled ? 'opacity-50' : ''}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{cat.label}</h4>
                <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={disabled}
                    onChange={() => toggleNoKnown(cat.id)}
                    className="rounded border-gray-300"
                  />
                  No known history
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {chipsFor(cat).map((value) => {
                  const active = !!getTag(cat.id, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleTag(cat.id, value)}
                      aria-pressed={active}
                      aria-label={active ? `Remove ${value}` : `Add ${value}`}
                      className={`flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full border text-sm cursor-pointer disabled:cursor-not-allowed ${
                        active
                          ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <span>{value}</span>
                      <span
                        aria-hidden="true"
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs leading-none flex-shrink-0 ${
                          active
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {active ? '−' : '+'}
                      </span>
                    </button>
                  );
                })}

                {addingTo === cat.id ? (
                  <div className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full border border-primary-400 bg-white dark:bg-gray-800">
                    <input
                      autoFocus
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitCustom(cat.id);
                        if (e.key === 'Escape') {
                          setCustomValue('');
                          setAddingTo(null);
                        }
                      }}
                      onBlur={() => submitCustom(cat.id)}
                      placeholder="Type and press Enter"
                      className="text-sm outline-none bg-transparent w-36 text-gray-900 dark:text-white"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setAddingTo(cat.id)}
                    className="flex items-center gap-1 pl-2.5 pr-3.5 py-1.5 rounded-full border border-dashed border-primary-300 dark:border-primary-700 text-xs text-primary-600 dark:text-primary-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-primary-200 dark:border-primary-800 bg-primary-50/40 dark:bg-primary-900/10 p-4 min-h-[220px] flex items-center justify-center">
        {selectedTag ? (
          <div className="w-full space-y-3">
            <h4 className="text-base font-bold text-gray-900 dark:text-white">{selectedTag.value}</h4>
            <AdminInput
              label="Since"
              placeholder="e.g. 3 days"
              value={selectedTag.since || ''}
              onChange={(e) => updateSelectedTag({ since: e.target.value })}
            />
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</span>
              <div className="grid grid-cols-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {(['active', 'inactive'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateSelectedTag({ status: s })}
                    className={`py-2 text-sm font-medium capitalize cursor-pointer ${
                      (selectedTag.status || 'active') === s
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <AdminTextarea
              label="Note"
              placeholder="Enter any specific notes here"
              rows={3}
              value={selectedTag.note || ''}
              onChange={(e) => updateSelectedTag({ note: e.target.value })}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            Please select a tag for medical history
          </p>
        )}
      </div>
    </div>
  );
}
