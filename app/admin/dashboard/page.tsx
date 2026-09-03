'use client';

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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import ImageUpload from '@/components/ImageUpload';
import { useToast } from '@/components/ToastProvider';
import type { CMSData } from '@/lib/cms';
import ServiceDetailEditor from '@/components/admin/ServiceDetailEditor';
import DoctorsEditor from '@/components/admin/DoctorsEditor';
import BookingSettingsEditor from '@/components/admin/BookingSettingsEditor';
import DashboardHome from '@/components/admin/DashboardHome';
import AppointmentsView from '@/components/admin/AppointmentsView';
import PrescriptionsListView from '@/components/admin/PrescriptionsListView';
import PatientsView from '@/components/admin/PatientsView';
// Billing disabled for now — see the commented-out sidebar entry below.
// import BillingListView from '@/components/admin/BillingListView';
import IconPicker from '@/components/admin/IconPicker';
import VariableReference from '@/components/admin/VariableReference';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminField';
import AdminSaveButton from '@/components/admin/AdminSaveButton';
import {
  House,
  ListBullets,
  Image,
  Briefcase,
  Info,
  TextAlignLeft,
  EnvelopeSimple,
  FileText,
  UserCircle,
  CalendarCheck,
  ClipboardText,
  UsersThree,
  Envelope,
  Gear,
} from '@phosphor-icons/react';

type CMSDataSection = keyof CMSData;

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  image: string;
  features?: string[];
  duration?: string;
  price?: string;
}

interface AboutFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface EditorProps {
  data: Partial<CMSData[keyof CMSData]>;
  onSave: (section: CMSDataSection, sectionData: Partial<CMSData[keyof CMSData]>) => Promise<void>;
  saving: boolean;
  isEditLinks?: boolean;
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  // Both groups start open (each its own card) — an accordion toggle per
  // card lets the admin collapse either one, but neither is collapsed by
  // default the way a single-open accordion would force.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ website: true, app: true });
  // Below `lg`, the sidebar is a hamburger-triggered slide-over instead of
  // two always-expanded cards pushing the content down the page.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [data, setData] = useState<Partial<CMSData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [isEditLinks, setIsEditLinks] = useState<boolean>(
    process.env.NEXT_PUBLIC_ENABLE_LINK_EDITING === 'true'
  );
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      const isAuth = await checkAuth();
      if (isAuth) {
        await fetchData();
      }
    };
    initialize();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdown = document.getElementById('admin-dropdown');
      const button = target.closest('button');

      if (dropdown && !dropdown.contains(target) && !button?.contains(target)) {
        dropdown.classList.add('hidden');
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/cms/auth', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        console.log('Not authenticated, redirecting to login');
        router.push('/admin');
        return false;
      }

      const data = await response.json();
      if (!data.authenticated) {
        console.log('Not authenticated, redirecting to login');
        router.push('/admin');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin');
      return false;
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/cms', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch data');
      }

      const cmsData = await response.json();
      setData(cmsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/cms/auth', {
      method: 'DELETE',
      credentials: 'include',
    });
    router.push('/logout-success');
  };

  const handleSectionChange = (sectionId: string) => {
    setSectionLoading(true);
    setActiveSection(sectionId);
    setMobileNavOpen(false);
    // Simulate loading for smooth transition
    setTimeout(() => setSectionLoading(false), 300);
  };

  const sections = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <House className="w-5 h-5" />,
    },
    {
      id: 'header',
      name: 'Header',
      icon: <ListBullets className="w-5 h-5" />,
    },
    {
      id: 'hero',
      name: 'Hero Section',
      icon: <Image className="w-5 h-5" />,
    },
    {
      id: 'services',
      name: 'Services',
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: 'about',
      name: 'About Section',
      icon: <Info className="w-5 h-5" />,
    },
    {
      id: 'footer',
      name: 'Footer',
      icon: <TextAlignLeft className="w-5 h-5" />,
    },
    {
      id: 'contact',
      name: 'Contact',
      icon: <EnvelopeSimple className="w-5 h-5" />,
    },
    {
      id: 'serviceDetails',
      name: 'Service Details',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'doctors',
      name: 'Doctors',
      icon: <UserCircle className="w-5 h-5" />,
    },
    {
      id: 'appointments',
      name: 'Appointments',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: 'prescriptions',
      name: 'Prescriptions',
      icon: <ClipboardText className="w-5 h-5" />,
    },
    // Billing tab disabled for now — the clinic already runs a standalone
    // inventory/billing application; this in-app billing module may be
    // dropped in favor of that instead of duplicating it. Commented out
    // rather than deleted so it can come back if we decide to keep it.
    // {
    //   id: 'billing',
    //   name: 'Billing',
    //   icon: <CurrencyCircleDollar className="w-5 h-5" />,
    // },
    {
      id: 'patients',
      name: 'Patients',
      icon: <UsersThree className="w-5 h-5" />,
    },
    {
      id: 'templates',
      name: 'Templates',
      icon: <Envelope className="w-5 h-5" />,
    },
    {
      id: 'bookingSettings',
      name: 'Booking Settings',
      icon: <Gear className="w-5 h-5" />,
    },
  ];

  // Grouped into two collapsible accordion categories — the flat 14-item
  // list was becoming unwieldy. "Website" edits public-facing content,
  // "App" runs day-to-day clinic operations (appointments/patients/etc).
  const WEBSITE_SECTION_IDS = ['header', 'hero', 'services', 'about', 'footer', 'contact', 'serviceDetails'];
  const sectionGroups = [
    { id: 'website', label: 'Website', sections: sections.filter((s) => WEBSITE_SECTION_IDS.includes(s.id)) },
    { id: 'app', label: 'App', sections: sections.filter((s) => !WEBSITE_SECTION_IDS.includes(s.id)) },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Mobile-only top bar: hamburger + current section name — replaces
            the always-expanded sidebar cards, which used to push all page
            content down below the fold on small screens. */}
        <div className="lg:hidden flex items-center gap-2 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm px-3 py-2.5">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="p-1.5 -ml-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {sections.find((s) => s.id === activeSection)?.name || 'Dashboard'}
          </span>
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-gray-50 dark:bg-gray-900 overflow-y-auto p-3 space-y-4 shadow-xl">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {sectionGroups.map((group) => {
                const isOpen = openGroups[group.id];
                return (
                  <nav
                    key={group.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2"
                    aria-label={`${group.label} sections navigation`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 cursor-pointer"
                    >
                      {group.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <ul className="space-y-0.5 pb-1" role="list">
                        {group.sections.map((section) => (
                          <li key={section.id}>
                            <button
                              onClick={() => handleSectionChange(section.id)}
                              aria-current={activeSection === section.id ? 'page' : undefined}
                              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 text-xs cursor-pointer ${
                                activeSection === section.id
                                  ? 'bg-primary-600 text-white font-medium'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span
                                className={`flex-shrink-0 [&_svg]:w-4 [&_svg]:h-4 ${activeSection === section.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                aria-hidden="true"
                              >
                                {section.icon}
                              </span>
                              <span>{section.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </nav>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6">
          {/* Sidebar — Website and App are two separate cards with a gap
              between them (not one nav block), both open by default; each
              still collapses independently via its own accordion toggle.
              Hidden below `lg` — the mobile hamburger drawer above replaces
              it there. */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            {sectionGroups.map((group) => {
              const isOpen = openGroups[group.id];
              return (
                <nav
                  key={group.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 sm:p-3"
                  aria-label={`${group.label} sections navigation`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:text-gray-600 dark:focus-visible:text-gray-300 cursor-pointer"
                  >
                    {group.label}
                    <svg
                      className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <ul className="space-y-1 pb-1" role="list">
                      {group.sections.map((section) => (
                        <li key={section.id}>
                          <button
                            onClick={() => handleSectionChange(section.id)}
                            aria-current={activeSection === section.id ? 'page' : undefined}
                            className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 sm:space-x-3 text-sm focus-visible:outline-none ${
                              activeSection === section.id
                                ? 'bg-primary-600 text-white shadow-md font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`flex-shrink-0 ${activeSection === section.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                              aria-hidden="true"
                            >
                              {section.icon}
                            </span>
                            <span>{section.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </nav>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
              {sectionLoading ? (
                <div
                  className="flex items-center justify-center py-12"
                  role="status"
                  aria-live="polite"
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"
                    aria-label="Loading content"
                  ></div>
                </div>
              ) : (
                <>
                  {activeSection === 'dashboard' && <DashboardHome doctors={data.doctors?.items || []} />}
                  {activeSection === 'header' && (
                    <HeaderEditor
                      data={data.header || {}}
                      onSave={handleSave}
                      saving={saving}
                      isEditLinks={isEditLinks}
                    />
                  )}
                  {activeSection === 'hero' && (
                    <HeroEditor
                      data={data.hero || {}}
                      onSave={handleSave}
                      saving={saving}
                      isEditLinks={isEditLinks}
                    />
                  )}
                  {activeSection === 'services' && (
                    <ServicesEditor
                      data={data.services || {}}
                      onSave={handleSave}
                      saving={saving}
                    />
                  )}
                  {activeSection === 'about' && (
                    <AboutEditor data={data.about || {}} onSave={handleSave} saving={saving} />
                  )}
                  {activeSection === 'footer' && (
                    <FooterEditor data={data.footer || {}} onSave={handleSave} saving={saving} />
                  )}
                  {activeSection === 'contact' && (
                    <ContactEditor data={data.contact || {}} onSave={handleSave} saving={saving} />
                  )}
                  {activeSection === 'serviceDetails' && (
                    <ServiceDetailEditor data={data.services || {}} onSave={handleSave} saving={saving} />
                  )}
                  {activeSection === 'doctors' && (
                    <DoctorsEditor data={data.doctors || {}} onSave={handleSave} saving={saving} />
                  )}
                  {activeSection === 'bookingSettings' && (
                    <BookingSettingsEditor
                      data={data.bookingSettings || {}}
                      doctors={data.doctors?.items || []}
                      onSave={handleSave}
                      saving={saving}
                    />
                  )}
                  {activeSection === 'appointments' && (
                    <AppointmentsView doctors={data.doctors?.items || []} />
                  )}
                  {activeSection === 'prescriptions' && (
                    <PrescriptionsListView doctors={data.doctors?.items || []} />
                  )}
                  {activeSection === 'patients' && <PatientsView />}
                  {/* Billing disabled for now — see the commented-out sidebar entry above. */}
                  {/* {activeSection === 'billing' && <BillingListView />} */}
                  {activeSection === 'templates' && (
                    <TemplatesEditor data={data.contact || {}} onSave={handleSave} saving={saving} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  async function handleSave(section: CMSDataSection, sectionData: Partial<CMSData[keyof CMSData]>) {
    setSaving(true);
    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data: sectionData }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setData((prev) => ({ ...prev, [section]: result.data }) as Partial<CMSData>);
        showToast('success', 'Changes saved successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Show detailed error message including suggestions for serverless hosting
        const errorMessage = errorData.error || 'Failed to save changes. Please try again.';
        const suggestion = errorData.suggestion ? ` ${errorData.suggestion}` : '';

        // Only show the full error if it's a read-only filesystem error
        // Otherwise show a simpler message
        if (errorData.code === 'READ_ONLY_FILESYSTEM') {
          showToast('error', errorMessage + suggestion);
        } else {
          showToast('error', errorMessage);
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      showToast('error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }
}

// Sortable Item Component for Navigation
interface SortableNavItemProps {
  item: NavItem;
  index: number;
  onUpdate: (index: number, item: NavItem) => void;
  onDelete: (index: number) => void;
  isEditLinks?: boolean;
}

function SortableNavItem({
  item,
  index,
  onUpdate,
  onDelete,
  isEditLinks = false,
}: SortableNavItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id || `nav-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminInput
            label="Menu Label"
            placeholder="e.g., Home, Services, About"
            value={item.label || ''}
            onChange={(e) => onUpdate(index, { ...item, label: e.target.value })}
          />
          <div>
            <AdminInput
              label={
                isEditLinks
                  ? 'Link URL'
                  : 'Link URL (Disabled - Single page anchors only)'
              }
              placeholder="e.g., /#services, /#about, /#contact"
              value={item.href || ''}
              onChange={(e) => onUpdate(index, { ...item, href: e.target.value })}
              disabled={!isEditLinks}
            />
            {!isEditLinks && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Links are disabled for single-page anchor navigation.
              </p>
            )}
          </div>
          <IconPicker
            value={item.icon}
            onChange={(name) => onUpdate(index, { ...item, icon: name })}
          />
        </div>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-red-600 hover:text-red-700 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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

// Editor Components
function HeaderEditor({ data, onSave, saving, isEditLinks = false }: EditorProps) {
  const [formData, setFormData] = useState<Partial<CMSData['header']>>(
    (data as Partial<CMSData['header']>) || {}
  );
  const { showToast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setFormData((data as Partial<CMSData['header']>) || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('header', formData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const navItems = (formData.navItems || []) as NavItem[];
      const oldIndex = navItems.findIndex((item, idx) => (item.id || `nav-${idx}`) === active.id);
      const newIndex = navItems.findIndex((item, idx) => (item.id || `nav-${idx}`) === over.id);
      const newItems = arrayMove(navItems, oldIndex, newIndex);
      setFormData({ ...formData, navItems: newItems as CMSData['header']['navItems'] });
    }
  };

  const updateNavItem = (index: number, updatedItem: NavItem) => {
    const newItems = [...((formData.navItems || []) as NavItem[])];
    newItems[index] = { ...updatedItem, id: updatedItem.id || `nav-${Date.now()}` };
    setFormData({ ...formData, navItems: newItems as CMSData['header']['navItems'] });
  };

  const deleteNavItem = (index: number) => {
    const newItems = ((formData.navItems || []) as NavItem[]).filter((_, i) => i !== index);
    setFormData({ ...formData, navItems: newItems as CMSData['header']['navItems'] });
    showToast('info', 'Navigation item removed. Click "Save Changes" to apply.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Header Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure your website header, navigation, and branding
        </p>
      </div>

      <AdminInput
        label="Brand Name"
        required
        value={formData.brandName || ''}
        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
        placeholder="e.g., Dr Baig's Clinic"
        hint="The name displayed in the header logo area"
      />

      <div>
        <ImageUpload
          value={formData.logo || ''}
          onChange={(url) => setFormData({ ...formData, logo: url })}
          label="Logo"
          description="Upload your clinic logo or enter an image URL. Recommended size: 200x50px"
        />
      </div>

      <div>
        <ImageUpload
          value={formData.favicon || ''}
          onChange={(url) => setFormData({ ...formData, favicon: url })}
          label="Favicon"
          description="The small icon shown in the browser tab. Falls back to the logo above if not set. Recommended: a square image, 32x32px or larger."
        />
      </div>

      <AdminInput
        label="CTA Button Text"
        required
        value={formData.ctaButton?.text || ''}
        onChange={(e) =>
          setFormData({
            ...formData,
            ctaButton: {
              ...formData.ctaButton,
              text: e.target.value,
              href: formData.ctaButton?.href || '',
            },
          })
        }
        placeholder="e.g., Book Appointment"
        hint="Text displayed on the call-to-action button in the header"
      />

      <AdminInput
        label={
          isEditLinks
            ? 'CTA Button Link'
            : 'CTA Button Link (Disabled - Single page anchors only)'
        }
        required
        value={formData.ctaButton?.href || ''}
        onChange={(e) =>
          setFormData({
            ...formData,
            ctaButton: { text: formData.ctaButton?.text || '', href: e.target.value },
          })
        }
        placeholder="e.g., #contact"
        disabled={!isEditLinks}
        hint={
          isEditLinks
            ? 'Where the button should link to (use #contact for same page anchor)'
            : 'Links are disabled for single-page anchor navigation.'
        }
      />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Navigation Items
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Drag and drop to reorder menu items
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={((formData.navItems || []) as NavItem[]).map(
              (item, idx) => item.id || `nav-${idx}`
            )}
            strategy={verticalListSortingStrategy}
          >
            {((formData.navItems || []) as NavItem[]).map((item, index) => (
              <SortableNavItem
                key={item.id || `nav-${index}`}
                item={item}
                index={index}
                onUpdate={updateNavItem}
                onDelete={deleteNavItem}
                isEditLinks={isEditLinks}
              />
            ))}
          </SortableContext>
        </DndContext>
        <button
          type="button"
          onClick={() => {
            setFormData({
              ...formData,
              navItems: [
                ...(formData.navItems || []),
                { id: `nav-${Date.now()}`, label: '', href: '', icon: 'home' },
              ],
            });
          }}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-2 px-4 py-2 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Navigation Item</span>
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <AdminSaveButton saving={saving} />
      </div>
    </form>
  );
}

function HeroEditor({ data, onSave, saving, isEditLinks = false }: EditorProps) {
  const [formData, setFormData] = useState<Partial<CMSData['hero']>>(
    (data as Partial<CMSData['hero']>) || {}
  );

  useEffect(() => {
    setFormData((data as Partial<CMSData['hero']>) || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('hero', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Section</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure the main hero banner at the top of your homepage
        </p>
      </div>

      <AdminInput
        label="Hero Title"
        required
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Transform Your Skin & Hair"
        hint="Main headline displayed prominently on the hero section"
      />

      <AdminTextarea
        label="Hero Subtitle"
        required
        value={formData.subtitle || ''}
        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
        rows={3}
        placeholder="e.g., Experience world-class treatments at Dr Baig's Clinic. Your journey to confidence starts here."
        hint="Supporting text that appears below the main title"
      />

      <AdminInput
        label="CTA Button Text"
        required
        value={formData.ctaText || ''}
        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
        placeholder="e.g., Book Consultation"
        hint="Text on the call-to-action button in the hero section"
      />

      <AdminInput
        label={
          isEditLinks
            ? 'CTA Button Link'
            : 'CTA Button Link (Disabled - Single page anchors only)'
        }
        required
        value={formData.ctaHref || ''}
        onChange={(e) => setFormData({ ...formData, ctaHref: e.target.value })}
        placeholder="e.g., #contact"
        disabled={!isEditLinks}
        hint={
          isEditLinks
            ? 'Where the hero CTA button should link to (use #contact for same page anchor)'
            : 'Links are disabled for single-page anchor navigation.'
        }
      />

      <div>
        <ImageUpload
          value={formData.backgroundImage || ''}
          onChange={(url) => setFormData({ ...formData, backgroundImage: url })}
          label="Background Image"
          description="Upload a background image for the hero section. Recommended size: 1920x1080px or larger"
        />
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <AdminSaveButton saving={saving} />
      </div>
    </form>
  );
}

// Sortable Service Item Component
interface SortableServiceItemProps {
  service: ServiceItem;
  index: number;
  onUpdate: (index: number, service: ServiceItem) => void;
  onDelete: (index: number) => void;
}

function SortableServiceItem({ service, index, onUpdate, onDelete }: SortableServiceItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.id || `service-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-all mb-3"
    >
      <div className="flex items-start gap-3">
        {/* Enhanced Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600 transition-all group"
          title="Drag to reorder"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
        <div className="flex-1 space-y-3 min-w-0">
          <AdminInput
            label="Service Title"
            required
            placeholder="e.g., Hair Restoration, Skin Care"
            value={service.title || ''}
            onChange={(e) => onUpdate(index, { ...service, title: e.target.value })}
          />
          <AdminTextarea
            label="Description"
            required
            placeholder="e.g., Advanced hair restoration treatments..."
            value={service.description || ''}
            onChange={(e) => onUpdate(index, { ...service, description: e.target.value })}
            rows={2}
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Service Image
            </label>
            <ImageUpload
              value={service.image || ''}
              onChange={(url) => onUpdate(index, { ...service, image: url })}
              label=""
              description="Upload an image for this service"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminInput
              label="Duration"
              placeholder="e.g., 60-90 minutes"
              value={service.duration || ''}
              onChange={(e) => onUpdate(index, { ...service, duration: e.target.value })}
            />
            <AdminInput
              label="Price"
              placeholder="e.g., Starting from $299"
              value={service.price || ''}
              onChange={(e) => onUpdate(index, { ...service, price: e.target.value })}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Delete service"
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

function ServicesEditor({ data, onSave, saving }: EditorProps) {
  const [formData, setFormData] = useState<Partial<CMSData['services']>>(
    (data as Partial<CMSData['services']>) || {}
  );
  const { showToast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setFormData((data as Partial<CMSData['services']>) || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Drop any service left with a blank title — an untitled entry can't be
    // shown as a real option in the public booking dropdown.
    const items = ((formData.items || []) as ServiceItem[]).filter((s) => s.title?.trim());
    onSave('services', { ...formData, items } as Partial<CMSData['services']>);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const items = (formData.items || []) as ServiceItem[];
      const oldIndex = items.findIndex((item, idx) => (item.id || `service-${idx}`) === active.id);
      const newIndex = items.findIndex((item, idx) => (item.id || `service-${idx}`) === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setFormData({ ...formData, items: newItems as CMSData['services']['items'] });
    }
  };

  const updateService = (index: number, updatedService: ServiceItem) => {
    const newItems = [...((formData.items || []) as ServiceItem[])];
    newItems[index] = updatedService;
    setFormData({ ...formData, items: newItems as CMSData['services']['items'] });
  };

  const deleteService = (index: number) => {
    const newItems = ((formData.items || []) as ServiceItem[]).filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems as CMSData['services']['items'] });
    showToast('info', 'Service removed. Click "Save Changes" to apply.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your service offerings and details
        </p>
      </div>

      <AdminInput
        label="Section Title"
        required
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Our Services"
        hint="Main heading for the services section"
      />

      <AdminTextarea
        label="Section Subtitle"
        value={formData.subtitle || ''}
        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
        rows={2}
        placeholder="e.g., Comprehensive skin and hair care solutions tailored to your needs"
        hint="Supporting text below the section title"
      />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Service Items</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Drag and drop to reorder services
        </p>
        <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={((formData.items || []) as ServiceItem[]).map(
                (item, idx) => item.id || `service-${idx}`
              )}
              strategy={rectSortingStrategy}
            >
              {((formData.items || []) as ServiceItem[]).map((service, index) => (
                <SortableServiceItem
                  key={service.id || `service-${index}`}
                  service={service}
                  index={index}
                  onUpdate={updateService}
                  onDelete={deleteService}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormData({
              ...formData,
              items: [
                ...(formData.items || []),
                {
                  id: `service-${Date.now()}`,
                  title: '',
                  description: '',
                  image: '',
                  features: [],
                  duration: '',
                  price: '',
                },
              ],
            });
          }}
          className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          + Add Service
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <AdminSaveButton saving={saving} />
      </div>
    </form>
  );
}

function AboutEditor({ data, onSave, saving }: EditorProps) {
  const [formData, setFormData] = useState<Partial<CMSData['about']>>(
    (data as Partial<CMSData['about']>) || {}
  );

  useEffect(() => {
    setFormData((data as Partial<CMSData['about']>) || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('about', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About Section</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure the about section that highlights your clinic's features
        </p>
      </div>

      <AdminInput
        label="Section Title"
        required
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Why Choose Baig's Clinic?"
        hint="Main heading for the about section"
      />

      <AdminInput
        label="Section Subtitle"
        value={formData.subtitle || ''}
        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
        placeholder="e.g., Excellence in every treatment"
        hint="Supporting text below the title"
      />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Feature Cards</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Add feature cards that showcase your clinic's strengths
        </p>
        {((formData.features || []) as AboutFeature[]).map((feature, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="mb-2">
              <AdminInput
                label="Feature Title"
                required
                placeholder="e.g., Expert Team, Advanced Technology"
                value={feature.title || ''}
                onChange={(e) => {
                  const newFeatures = [...((formData.features || []) as AboutFeature[])];
                  (newFeatures[index] as AboutFeature).title = e.target.value;
                  setFormData({ ...formData, features: newFeatures });
                }}
              />
            </div>
            <div className="mb-3">
              <AdminTextarea
                label="Description"
                required
                placeholder="e.g., Board-certified specialists with years of experience..."
                value={feature.description || ''}
                onChange={(e) => {
                  const newFeatures = [...((formData.features || []) as AboutFeature[])];
                  (newFeatures[index] as AboutFeature).description = e.target.value;
                  setFormData({ ...formData, features: newFeatures });
                }}
                rows={3}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const newFeatures = ((formData.features || []) as AboutFeature[]).filter(
                  (_, i) => i !== index
                );
                setFormData({ ...formData, features: newFeatures });
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Remove Feature</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setFormData({
              ...formData,
              features: [
                ...(formData.features || []),
                { id: `feature-${Date.now()}`, title: '', description: '', icon: 'shield' },
              ],
            });
          }}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-2 px-4 py-2 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Feature</span>
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <AdminSaveButton saving={saving} />
      </div>
    </form>
  );
}

function FooterEditor({ data, onSave, saving }: EditorProps) {
  const [formData, setFormData] = useState<Partial<CMSData['footer']>>(
    (data as Partial<CMSData['footer']>) || {}
  );
  const { showToast } = useToast();

  useEffect(() => {
    setFormData((data as Partial<CMSData['footer']>) || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('footer', formData);
  };

  const updateSocialMediaItem = (index: number, field: 'name' | 'url' | 'icon', value: string) => {
    const socialMedia = (formData.socialMedia || []) as CMSData['footer']['socialMedia'];
    const newItems = [...socialMedia];
    if (newItems[index]) {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setFormData({ ...formData, socialMedia: newItems });
  };

  const addSocialMediaItem = () => {
    const socialMedia = (formData.socialMedia || []) as CMSData['footer']['socialMedia'];
    setFormData({
      ...formData,
      socialMedia: [...socialMedia, { id: `social-${Date.now()}`, name: '', url: '', icon: '' }],
    });
  };

  const removeSocialMediaItem = (index: number) => {
    const socialMedia = (formData.socialMedia || []) as CMSData['footer']['socialMedia'];
    setFormData({
      ...formData,
      socialMedia: socialMedia.filter((_, i) => i !== index),
    });
    showToast('info', 'Social media link removed. Click "Save Changes" to apply.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Footer Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure footer content, contact information, and social media links
        </p>
      </div>

      <AdminInput
        label="Brand Name"
        required
        value={formData.brandName || ''}
        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
        placeholder="e.g., Dr Baig's Clinic"
        hint="Brand name displayed in the footer"
      />

      <div>
        <ImageUpload
          value={formData.logo || ''}
          onChange={(url) => setFormData({ ...formData, logo: url })}
          label="Logo"
          description="Upload your clinic logo or enter an image URL. Recommended size: 200x50px"
        />
      </div>

      <AdminTextarea
        label="Footer Description"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        placeholder="e.g., Your trusted partner for comprehensive skin and hair care solutions..."
        hint="Brief description about your clinic shown in the footer"
      />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Contact Information
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Contact details displayed in the footer
        </p>
        <div className="space-y-3">
          <AdminTextarea
            label="Address"
            placeholder="e.g., 123 Health Street\nCity, State 12345"
            value={formData.contact?.address || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact: {
                  address: e.target.value,
                  phone: formData.contact?.phone || '',
                  email: formData.contact?.email || '',
                },
              })
            }
            rows={2}
          />
          <AdminInput
            label="Phone Number"
            placeholder="e.g., +1 (234) 567-890"
            value={formData.contact?.phone || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact: {
                  address: formData.contact?.address || '',
                  phone: e.target.value,
                  email: formData.contact?.email || '',
                },
              })
            }
          />
          <AdminInput
            label="Email Address"
            type="email"
            placeholder="e.g., info@clinic.com"
            value={formData.contact?.email || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact: {
                  address: formData.contact?.address || '',
                  phone: formData.contact?.phone || '',
                  email: e.target.value,
                },
              })
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Social Media Links
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Add your social media platforms with custom names, URLs, and icons
        </p>
        <div className="space-y-4">
          {((formData.socialMedia || []) as CMSData['footer']['socialMedia']).map((item, index) => (
            <div
              key={item.id || `social-${index}`}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Social Media #{index + 1}
                </label>
                <button
                  type="button"
                  onClick={() => removeSocialMediaItem(index)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Remove this social media link"
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
              <div className="space-y-3">
                <AdminInput
                  label="Platform Name"
                  required
                  placeholder="e.g., Facebook, Instagram, Twitter, LinkedIn, etc."
                  value={item.name || ''}
                  onChange={(e) => updateSocialMediaItem(index, 'name', e.target.value)}
                />
                <AdminInput
                  label="URL"
                  required
                  placeholder="e.g., https://facebook.com/yourpage"
                  value={item.url || ''}
                  onChange={(e) => updateSocialMediaItem(index, 'url', e.target.value)}
                />
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Custom Icon (Optional)
                  </label>
                  <ImageUpload
                    value={item.icon || ''}
                    onChange={(url) => updateSocialMediaItem(index, 'icon', url)}
                    label=""
                    description="Upload a custom icon for this platform (optional)"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSocialMediaItem}
            className="w-full text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add More Social Media</span>
          </button>
        </div>
      </div>

      <AdminInput
        label="Copyright Text"
        value={formData.copyright || ''}
        onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
        placeholder="e.g., Glow Clinic or Dr Baig's Clinic"
        hint="Text shown in the copyright notice (year is added automatically)"
      />

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <AdminSaveButton saving={saving} />
      </div>
    </form>
  );
}

function ContactEditor({ data, onSave, saving }: EditorProps) {
  const [formData, setFormData] = useState<Partial<CMSData['contact']>>(
    (data as Partial<CMSData['contact']>) || {}
  );

  useEffect(() => {
    setFormData((data as Partial<CMSData['contact']>) || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('contact', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Section</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure the contact/appointment booking section
        </p>
      </div>

      <AdminInput
        label="Section Title"
        required
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Book Your Appointment"
        hint="Main heading for the contact section"
      />

      <AdminTextarea
        label="Section Subtitle"
        value={formData.subtitle || ''}
        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
        rows={2}
        placeholder="e.g., Start your journey to healthier skin and hair today"
        hint="Supporting text that encourages users to book"
      />

      <AdminInput
        label="Email Address for Appointments"
        required
        type="email"
        value={formData.email || ''}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="e.g., appointments@clinic.com"
        hint="Email address where appointment booking requests will be sent"
      />

      <AdminInput
        label="Front-Desk WhatsApp/SMS Number"
        type="tel"
        value={formData.notificationPhone || ''}
        onChange={(e) => setFormData({ ...formData, notificationPhone: e.target.value })}
        placeholder="e.g., +91XXXXXXXXXX"
        hint="Receives a WhatsApp/SMS alert for every new booking and the daily appointments digest, in addition to each doctor's own number (set per-doctor in the Doctors tab)."
      />

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <AdminSaveButton saving={saving} />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          Looking for the email/SMS/WhatsApp message templates? They moved to their own{' '}
          <span className="font-medium">Templates</span> tab in the sidebar.
        </p>
      </div>
    </form>
  );
}

function TemplatesEditor({ data, onSave, saving }: EditorProps) {
  const [formData, setFormData] = useState<Partial<CMSData['contact']>>(
    (data as Partial<CMSData['contact']>) || {}
  );

  useEffect(() => {
    setFormData((data as Partial<CMSData['contact']>) || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('contact', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Every message sent automatically by the booking system — email, SMS, and WhatsApp — in
          one place.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Email Templates
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Customize the emails sent when someone books an appointment — one to the clinic/doctor,
          one to the patient as their confirmation.
        </p>
        <VariableReference />
      </div>

      <AdminInput
        label="Email Subject"
        required
        value={formData.emailSubject || ''}
        onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
        placeholder="e.g., New Appointment Booking - {doctor}"
        hint="Subject line for the clinic/doctor's booking-alert email."
      />

      <AdminTextarea
        label="Email Body Template"
        required
        mono
        value={formData.emailBody || ''}
        onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
        rows={10}
        placeholder="e.g., New Appointment Booking Request&#10;&#10;Name: {name}&#10;Email: {email}&#10;Phone: {phone}&#10;Doctor: {doctor}&#10;Date: {date}&#10;Time: {time}&#10;Reason: {reason}&#10;&#10;Submitted on: {submittedAt}"
        hint="Sent to the clinic (and the assigned doctor, if they have an email set)."
      />

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Customer Thank You Email Template
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Customize the confirmation email sent to the patient after they book. Make sure to
          include {'{doctor}'}, {'{date}'}, {'{time}'}, and {'{patientId}'} so they know when their
          appointment is and can look up their visit history later.
        </p>
      </div>

      <AdminInput
        label="Customer Email Subject"
        required
        value={formData.customerEmailSubject || ''}
        onChange={(e) => setFormData({ ...formData, customerEmailSubject: e.target.value })}
        placeholder="e.g., Your Appointment is Confirmed - Dr Baig's Clinic"
        hint="Subject line for customer confirmation emails."
      />

      <AdminTextarea
        label="Customer Email Body Template"
        required
        mono
        value={formData.customerEmailBody || ''}
        onChange={(e) => setFormData({ ...formData, customerEmailBody: e.target.value })}
        rows={10}
        placeholder="e.g., Dear {name},&#10;&#10;Your appointment with {doctor} is confirmed for {date} at {time}.&#10;&#10;Manage or reschedule your booking: {manageLink}&#10;&#10;Your Patient ID is {patientId} — save this to view your visit history and prescriptions.&#10;&#10;Best regards,&#10;Dr Baig's Clinic Team"
      />

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          SMS / WhatsApp Templates
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          These send over WhatsApp when configured, falling back to plain SMS automatically —
          keep them short and plain text (no formatting, unlike email). Leave either blank to use
          the built-in default wording.
        </p>
        <VariableReference />
      </div>

      <AdminTextarea
        label="Patient Confirmation (SMS/WhatsApp)"
        mono
        value={formData.patientSmsTemplate || ''}
        onChange={(e) => setFormData({ ...formData, patientSmsTemplate: e.target.value })}
        rows={4}
        placeholder="e.g., Hi {name}, your appointment with {doctor} at Dr Baig's Clinic is confirmed for {date} at {time}. Manage your booking: {manageLink}"
        hint="Sent to the patient right after they book. If {patientId} isn't included here and the patient has one, it's appended automatically as a second line."
      />

      <AdminTextarea
        label="Clinic/Doctor Alert (SMS/WhatsApp)"
        mono
        value={formData.adminSmsTemplate || ''}
        onChange={(e) => setFormData({ ...formData, adminSmsTemplate: e.target.value })}
        rows={4}
        placeholder="e.g., New appointment: {name} ({phone}) with {doctor} on {date} at {time}. Reason: {reason}"
        hint="Sent to the notification phone (set in the Contact tab) and to the assigned doctor (if they have a phone set in the Doctors tab)."
      />

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <AdminSaveButton saving={saving} />
      </div>
    </form>
  );
}
