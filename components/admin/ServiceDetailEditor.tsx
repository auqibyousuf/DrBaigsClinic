'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageUpload from '@/components/ImageUpload';
import { useToast } from '@/components/ToastProvider';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminField';
import type { CMSData } from '@/lib/cms';

type ServiceItem = CMSData['services']['items'][number];
type Step = { title: string; description: string };
type FAQ = { question: string; answer: string };

interface ServiceDetailEditorProps {
  data: Partial<CMSData['services']>;
  onSave: (section: keyof CMSData, sectionData: Partial<CMSData[keyof CMSData]>) => Promise<void>;
  saving: boolean;
}

function SortableRow({
  id,
  children,
  onDelete,
}: {
  id: string;
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 shadow-sm mb-3"
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="flex-1 space-y-2 min-w-0">{children}</div>
        <button
          type="button"
          onClick={onDelete}
          className="flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ServiceDetailEditor({ data, onSave, saving }: ServiceDetailEditorProps) {
  const items = (data.items || []) as ServiceItem[];
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id || '');
  const [formItems, setFormItems] = useState<ServiceItem[]>(items);
  const { showToast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setFormItems((data.items || []) as ServiceItem[]);
    if (!selectedId && data.items?.[0]) {
      setSelectedId(data.items[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const selectedIndex = formItems.findIndex((s) => s.id === selectedId);
  const selected = formItems[selectedIndex];

  const updateSelected = (partial: Partial<ServiceItem>) => {
    if (selectedIndex < 0) return;
    const next = [...formItems];
    next[selectedIndex] = { ...next[selectedIndex], ...partial };
    setFormItems(next);
  };

  const steps: Step[] = selected?.steps || [];
  const faqs: FAQ[] = selected?.faqs || [];

  const handleStepsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((_, i) => `step-${i}` === active.id);
      const newIndex = steps.findIndex((_, i) => `step-${i}` === over.id);
      updateSelected({ steps: arrayMove(steps, oldIndex, newIndex) });
    }
  };

  const handleFaqsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = faqs.findIndex((_, i) => `faq-${i}` === active.id);
      const newIndex = faqs.findIndex((_, i) => `faq-${i}` === over.id);
      updateSelected({ faqs: arrayMove(faqs, oldIndex, newIndex) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('services', { ...data, items: formItems } as Partial<CMSData['services']>);
  };

  if (formItems.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Add a service in the Services tab first, then come back here to edit its detail page.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Details</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Edit the full detail page content for each service — overview, hero image, treatment steps, and FAQs.
        </p>
      </div>

      <AdminSelect
        label="Choose a service to edit"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        options={formItems.map((s) => ({
          value: s.id,
          label: `${s.title || 'Untitled service'}${s.price ? ` — ${s.price}` : ''}`,
        }))}
      />

      {/* Preview of the currently selected service — the dropdown above
          only shows a title, which isn't enough to tell services apart at a
          glance, so this confirms exactly which one is being edited. */}
      {selected && (
        <div className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/40">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            {selected.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {selected.title || 'Untitled service'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {selected.description || 'No description set'}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
              {selected.duration && <span>Duration: {selected.duration}</span>}
              {selected.price && <span>Price: {selected.price}</span>}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Image
            </label>
            <ImageUpload
              value={selected.heroImage || ''}
              onChange={(url) => updateSelected({ heroImage: url })}
              description="Larger banner image shown at the top of the detail page (falls back to the service list image if empty)"
            />
          </div>

          <AdminTextarea
            label="Treatment Overview"
            value={selected.overview || ''}
            onChange={(e) => updateSelected({ overview: e.target.value })}
            rows={4}
            placeholder="Describe this treatment in more depth..."
          />

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              What to Expect — Treatment Steps
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Leave empty to use the default generic steps.
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStepsDragEnd}>
              <SortableContext items={steps.map((_, i) => `step-${i}`)} strategy={verticalListSortingStrategy}>
                {steps.map((step, index) => (
                  <SortableRow
                    key={`step-${index}`}
                    id={`step-${index}`}
                    onDelete={() => {
                      updateSelected({ steps: steps.filter((_, i) => i !== index) });
                      showToast('info', 'Step removed. Click "Save Changes" to apply.');
                    }}
                  >
                    <AdminInput
                      placeholder="Step title"
                      value={step.title}
                      onChange={(e) => {
                        const next = [...steps];
                        next[index] = { ...next[index], title: e.target.value };
                        updateSelected({ steps: next });
                      }}
                    />
                    <AdminTextarea
                      placeholder="Step description"
                      value={step.description}
                      onChange={(e) => {
                        const next = [...steps];
                        next[index] = { ...next[index], description: e.target.value };
                        updateSelected({ steps: next });
                      }}
                      rows={2}
                    />
                  </SortableRow>
                ))}
              </SortableContext>
            </DndContext>
            <button
              type="button"
              onClick={() => updateSelected({ steps: [...steps, { title: '', description: '' }] })}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add Step
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">FAQs</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Optional — the FAQ section only appears on the page if at least one is added.
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFaqsDragEnd}>
              <SortableContext items={faqs.map((_, i) => `faq-${i}`)} strategy={verticalListSortingStrategy}>
                {faqs.map((faq, index) => (
                  <SortableRow
                    key={`faq-${index}`}
                    id={`faq-${index}`}
                    onDelete={() => {
                      updateSelected({ faqs: faqs.filter((_, i) => i !== index) });
                      showToast('info', 'FAQ removed. Click "Save Changes" to apply.');
                    }}
                  >
                    <AdminInput
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => {
                        const next = [...faqs];
                        next[index] = { ...next[index], question: e.target.value };
                        updateSelected({ faqs: next });
                      }}
                    />
                    <AdminTextarea
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => {
                        const next = [...faqs];
                        next[index] = { ...next[index], answer: e.target.value };
                        updateSelected({ faqs: next });
                      }}
                      rows={2}
                    />
                  </SortableRow>
                ))}
              </SortableContext>
            </DndContext>
            <button
              type="button"
              onClick={() => updateSelected({ faqs: [...faqs, { question: '', answer: '' }] })}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add FAQ
            </button>
          </div>
        </>
      )}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </form>
  );
}
