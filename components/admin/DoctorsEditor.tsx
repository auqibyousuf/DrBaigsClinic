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
import { PencilSimple, TrashSimple, UserCircle, DotsSixVertical, Check } from '@phosphor-icons/react';
import { Eye } from '@phosphor-icons/react';
import ImageUpload from '@/components/ImageUpload';
import { useToast } from '@/components/ToastProvider';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminField';
import DoctorDetailPage from '@/components/admin/DoctorDetailPage';
import AdminSaveButton from '@/components/admin/AdminSaveButton';
import type { CMSData } from '@/lib/cms';

type Doctor = NonNullable<CMSData['doctors']>['items'][number];

interface DoctorsEditorProps {
  data: Partial<NonNullable<CMSData['doctors']>>;
  onSave: (section: keyof CMSData, sectionData: Partial<CMSData[keyof CMSData]>) => Promise<void>;
  saving: boolean;
}

function SortableDoctorItem({
  doctor,
  index,
  isExpanded,
  onUpdate,
  onDelete,
  onToggleExpand,
  onViewDetails,
}: {
  doctor: Doctor;
  index: number;
  isExpanded: boolean;
  onUpdate: (index: number, doctor: Doctor) => void;
  onDelete: (index: number) => void;
  onToggleExpand: (id: string) => void;
  onViewDetails: () => void;
}) {
  const id = doctor.id || `doctor-${index}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  // Collapsed row — a scannable summary with Edit/Delete, so a growing
  // doctor list stays a list instead of every entry being a full open form.
  if (!isExpanded) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm mb-2"
      >
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400"
        >
          <DotsSixVertical className="w-4 h-4" />
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          {doctor.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
          ) : (
            <UserCircle className="w-6 h-6 text-gray-400" weight="duotone" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {doctor.name || 'Untitled doctor'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {doctor.specialty || 'No specialty set'}
            {!doctor.isActive && ' · Hidden from booking'}
          </p>
        </div>
        <button
          type="button"
          onClick={onViewDetails}
          className="flex-shrink-0 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="View details, consulted patients, and appointments"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onToggleExpand(id)}
          className="flex-shrink-0 text-primary-600 hover:text-primary-700 dark:text-primary-400 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
          title="Edit doctor"
        >
          <PencilSimple className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          title="Delete doctor"
        >
          <TrashSimple className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 border border-primary-300 dark:border-primary-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 shadow-sm mb-3"
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <DotsSixVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 space-y-3 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AdminInput
              label="Name"
              required
              placeholder="e.g., Dr. Ahmed Baig"
              value={doctor.name || ''}
              onChange={(e) => onUpdate(index, { ...doctor, name: e.target.value })}
            />
            <AdminInput
              label="Specialty"
              placeholder="e.g., Dermatologist"
              value={doctor.specialty || ''}
              onChange={(e) => onUpdate(index, { ...doctor, specialty: e.target.value })}
            />
          </div>
          <AdminInput
            label="Qualification"
            placeholder="e.g., MD MS"
            value={doctor.qualification || ''}
            onChange={(e) => onUpdate(index, { ...doctor, qualification: e.target.value })}
            hint="Shown under the doctor's name on the prescription document."
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Photo
            </label>
            <ImageUpload
              value={doctor.photo || ''}
              onChange={(url) => onUpdate(index, { ...doctor, photo: url })}
              description="Photo shown in the doctor selection dropdown (optional)"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AdminInput
              label="Notification Phone"
              required
              type="tel"
              placeholder="e.g., +91XXXXXXXXXX"
              value={doctor.phone || ''}
              onChange={(e) => onUpdate(index, { ...doctor, phone: e.target.value })}
              hint="Where this doctor's WhatsApp/SMS booking alerts are sent."
            />
            <AdminInput
              label="Notification Email"
              type="email"
              placeholder="e.g., doctor@clinic.com"
              value={doctor.email || ''}
              onChange={(e) => onUpdate(index, { ...doctor, email: e.target.value })}
            />
          </div>
          <AdminTextarea
            label="Bio"
            placeholder="Short bio shown to patients (optional)"
            value={doctor.bio || ''}
            onChange={(e) => onUpdate(index, { ...doctor, bio: e.target.value })}
            rows={2}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={doctor.isActive ?? true}
              onChange={(e) => onUpdate(index, { ...doctor, isActive: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Visible in the public booking dropdown
          </label>
          <button
            type="button"
            onClick={() => onToggleExpand(id)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            <Check className="w-4 h-4" />
            Done
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          title="Delete doctor"
        >
          <TrashSimple className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function DoctorsEditor({ data, onSave, saving }: DoctorsEditorProps) {
  const [formData, setFormData] = useState<Partial<NonNullable<CMSData['doctors']>>>(data || {});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  const { showToast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const items = (formData.items || []) as Doctor[];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((d, i) => (d.id || `doctor-${i}`) === active.id);
      const newIndex = items.findIndex((d, i) => (d.id || `doctor-${i}`) === over.id);
      setFormData({ ...formData, items: arrayMove(items, oldIndex, newIndex) });
    }
  };

  const updateDoctor = (index: number, doctor: Doctor) => {
    const next = [...items];
    next[index] = doctor;
    setFormData({ ...formData, items: next });
  };

  const deleteDoctor = (index: number) => {
    setFormData({ ...formData, items: items.filter((_, i) => i !== index) });
    showToast('info', 'Doctor removed. Click "Save Changes" to apply.');
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('doctors', formData as Partial<CMSData['doctors']>);
  };

  if (viewingDoctor) {
    return (
      <DoctorDetailPage
        doctorId={viewingDoctor.id}
        doctorName={viewingDoctor.name || 'Untitled doctor'}
        onBack={() => setViewingDoctor(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Doctors</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage doctors patients can choose from when booking, and where each doctor's booking alerts go.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((d, i) => d.id || `doctor-${i}`)} strategy={verticalListSortingStrategy}>
          {items.map((doctor, index) => {
            const id = doctor.id || `doctor-${index}`;
            return (
              <SortableDoctorItem
                key={id}
                doctor={doctor}
                index={index}
                isExpanded={expandedIds.has(id)}
                onUpdate={updateDoctor}
                onDelete={deleteDoctor}
                onToggleExpand={toggleExpand}
                onViewDetails={() => setViewingDoctor(doctor)}
              />
            );
          })}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => {
          const id = `doctor-${Date.now()}`;
          setFormData({
            ...formData,
            items: [
              ...items,
              {
                id,
                name: '',
                specialty: '',
                photo: '',
                phone: '',
                email: '',
                bio: '',
                isActive: true,
              },
            ],
          });
          // A brand-new doctor is blank — open it straight into edit mode
          // instead of adding an empty-looking collapsed row.
          setExpandedIds((prev) => new Set(prev).add(id));
        }}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        + Add Doctor
      </button>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <AdminSaveButton saving={saving} />
      </div>
    </form>
  );
}
