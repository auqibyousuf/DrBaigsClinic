'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

interface CMSData {
  header?: any;
  hero?: any;
  services?: any;
  about?: any;
  footer?: any;
  contact?: any;
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<string>('header');
  const [data, setData] = useState<CMSData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      const isAuth = await checkAuth();
      if (isAuth) {
        await fetchData();
      }
    };
    initialize();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/cms/auth', {
        method: 'GET',
        credentials: 'include'
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
        credentials: 'include'
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
      credentials: 'include'
    });
    router.push('/admin');
  };

  const handleSectionChange = (sectionId: string) => {
    setSectionLoading(true);
    setActiveSection(sectionId);
    // Simulate loading for smooth transition
    setTimeout(() => setSectionLoading(false), 300);
  };

  const sections = [
    {
      id: 'header',
      name: 'Header',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      id: 'hero',
      name: 'Hero Section',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    {
      id: 'services',
      name: 'Services',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'about',
      name: 'About Section',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'footer',
      name: 'Footer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'contact',
      name: 'Contact',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                CMS Admin Panel
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your website content
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
              >
                View Website →
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sections
              </h2>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                        activeSection === section.id
                          ? 'bg-primary-600 text-white shadow-md font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className={`${activeSection === section.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {section.icon}
                      </span>
                      <span>{section.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {sectionLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {activeSection === 'header' && <HeaderEditor data={data.header} onSave={handleSave} saving={saving} />}
                  {activeSection === 'hero' && <HeroEditor data={data.hero} onSave={handleSave} saving={saving} />}
                  {activeSection === 'services' && <ServicesEditor data={data.services} onSave={handleSave} saving={saving} />}
                  {activeSection === 'about' && <AboutEditor data={data.about} onSave={handleSave} saving={saving} />}
                  {activeSection === 'footer' && <FooterEditor data={data.footer} onSave={handleSave} saving={saving} />}
                  {activeSection === 'contact' && <ContactEditor data={data.contact} onSave={handleSave} saving={saving} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  async function handleSave(section: string, sectionData: any) {
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
        setData((prev) => ({ ...prev, [section]: result.data }));
        alert('Saved successfully!');
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }
}

// Editor Components
function HeaderEditor({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('header', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Header Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your website header, navigation, and branding</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Brand Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.brandName || ''}
          onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
          placeholder="e.g., Dr Baig's Clinic"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The name displayed in the header logo area</p>
      </div>

      <div>
        <ImageUpload
          value={formData.logo || ''}
          onChange={(url) => setFormData({ ...formData, logo: url })}
          label="Logo"
          description="Upload your clinic logo or enter an image URL. Recommended size: 200x50px"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CTA Button Text <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.ctaButton?.text || ''}
          onChange={(e) => setFormData({
            ...formData,
            ctaButton: { ...formData.ctaButton, text: e.target.value }
          })}
          placeholder="e.g., Book Appointment"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Text displayed on the call-to-action button in the header</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CTA Button Link <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.ctaButton?.href || ''}
          onChange={(e) => setFormData({
            ...formData,
            ctaButton: { ...formData.ctaButton, href: e.target.value }
          })}
          placeholder="e.g., #contact or /appointment"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Where the button should link to (use #contact for same page anchor)</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Navigation Items</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Manage the menu items in your header navigation</p>
        {(formData.navItems || []).map((item: any, index: number) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Menu Label</label>
                <input
                  type="text"
                  placeholder="e.g., Home, Services, About"
                  value={item.label || ''}
                  onChange={(e) => {
                    const newItems = [...(formData.navItems || [])];
                    newItems[index].label = e.target.value;
                    setFormData({ ...formData, navItems: newItems });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Link URL</label>
                <input
                  type="text"
                  placeholder="e.g., /, #services, /about"
                  value={item.href || ''}
                  onChange={(e) => {
                    const newItems = [...(formData.navItems || [])];
                    newItems[index].href = e.target.value;
                    setFormData({ ...formData, navItems: newItems });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const newItems = (formData.navItems || []).filter((_: any, i: number) => i !== index);
                setFormData({ ...formData, navItems: newItems });
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Remove Item</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setFormData({
              ...formData,
              navItems: [...(formData.navItems || []), { id: `nav-${Date.now()}`, label: '', href: '', icon: 'home' }]
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
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function HeroEditor({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('hero', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Section</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure the main hero banner at the top of your homepage</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Hero Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Transform Your Skin & Hair"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Main headline displayed prominently on the hero section</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Hero Subtitle <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.subtitle || ''}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          rows={3}
          placeholder="e.g., Experience world-class treatments at Dr Baig's Clinic. Your journey to confidence starts here."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supporting text that appears below the main title</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CTA Button Text <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.ctaText || ''}
          onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
          placeholder="e.g., Book Consultation"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Text on the call-to-action button in the hero section</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CTA Button Link <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.ctaHref || ''}
          onChange={(e) => setFormData({ ...formData, ctaHref: e.target.value })}
          placeholder="e.g., #contact or /appointment"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Where the CTA button should link to</p>
      </div>

      <div>
        <ImageUpload
          value={formData.backgroundImage || ''}
          onChange={(url) => setFormData({ ...formData, backgroundImage: url })}
          label="Background Image"
          description="Upload a background image for the hero section. Recommended size: 1920x1080px or larger"
        />
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function ServicesEditor({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('services', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your service offerings and details</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Our Services"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Main heading for the services section</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section Subtitle
        </label>
        <textarea
          value={formData.subtitle || ''}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          rows={2}
          placeholder="e.g., Comprehensive skin and hair care solutions tailored to your needs"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supporting text below the section title</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Service Items</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add, edit, or remove services from your website</p>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(formData.items || []).map((service: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Service Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Hair Restoration, Skin Care"
                    value={service.title || ''}
                    onChange={(e) => {
                      const newItems = [...(formData.items || [])];
                      newItems[index].title = e.target.value;
                      setFormData({ ...formData, items: newItems });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    placeholder="e.g., Advanced hair restoration treatments to help you regain confidence..."
                    value={service.description || ''}
                    onChange={(e) => {
                      const newItems = [...(formData.items || [])];
                      newItems[index].description = e.target.value;
                      setFormData({ ...formData, items: newItems });
                    }}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Service Image</label>
                  <ImageUpload
                    value={service.image || ''}
                    onChange={(url) => {
                      const newItems = [...(formData.items || [])];
                      newItems[index].image = url;
                      setFormData({ ...formData, items: newItems });
                    }}
                    label=""
                    description="Upload an image for this service"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 60-90 minutes"
                      value={service.duration || ''}
                      onChange={(e) => {
                        const newItems = [...(formData.items || [])];
                        newItems[index].duration = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Price</label>
                    <input
                      type="text"
                      placeholder="e.g., Starting from $299"
                      value={service.price || ''}
                      onChange={(e) => {
                        const newItems = [...(formData.items || [])];
                        newItems[index].price = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newItems = (formData.items || []).filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove Service
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setFormData({
              ...formData,
              items: [...(formData.items || []), {
                id: `service-${Date.now()}`,
                title: '',
                description: '',
                image: '',
                features: [],
                duration: '',
                price: ''
              }]
            });
          }}
          className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          + Add Service
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function AboutEditor({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('about', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About Section</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure the about section that highlights your clinic's features</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Why Choose Baig's Clinic?"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Main heading for the about section</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section Subtitle
        </label>
        <input
          type="text"
          value={formData.subtitle || ''}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="e.g., Excellence in every treatment"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supporting text below the title</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Feature Cards</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add feature cards that showcase your clinic's strengths</p>
        {(formData.features || []).map((feature: any, index: number) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Feature Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., Expert Team, Advanced Technology"
                value={feature.title || ''}
                onChange={(e) => {
                  const newFeatures = [...(formData.features || [])];
                  newFeatures[index].title = e.target.value;
                  setFormData({ ...formData, features: newFeatures });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                placeholder="e.g., Board-certified specialists with years of experience..."
                value={feature.description || ''}
                onChange={(e) => {
                  const newFeatures = [...(formData.features || [])];
                  newFeatures[index].description = e.target.value;
                  setFormData({ ...formData, features: newFeatures });
                }}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const newFeatures = (formData.features || []).filter((_: any, i: number) => i !== index);
                setFormData({ ...formData, features: newFeatures });
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
              features: [...(formData.features || []), { id: `feature-${Date.now()}`, title: '', description: '', icon: 'shield' }]
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
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function FooterEditor({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('footer', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Footer Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure footer content, contact information, and social media links</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Brand Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.brandName || ''}
          onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
          placeholder="e.g., Dr Baig's Clinic"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Brand name displayed in the footer</p>
      </div>

      <div>
        <ImageUpload
          value={formData.logo || ''}
          onChange={(url) => setFormData({ ...formData, logo: url })}
          label="Logo"
          description="Upload your clinic logo or enter an image URL. Recommended size: 200x50px"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Footer Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="e.g., Your trusted partner for comprehensive skin and hair care solutions..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Brief description about your clinic shown in the footer</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Contact details displayed in the footer</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Address</label>
            <textarea
              placeholder="e.g., 123 Health Street\nCity, State 12345"
              value={formData.contact?.address || ''}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, address: e.target.value }
              })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="e.g., +1 (234) 567-890"
              value={formData.contact?.phone || ''}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, phone: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g., info@clinic.com"
              value={formData.contact?.email || ''}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, email: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Social Media Links</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add your social media profile URLs</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Facebook URL</label>
            <input
              type="text"
              placeholder="e.g., https://facebook.com/yourpage"
              value={formData.socialMedia?.facebook || ''}
              onChange={(e) => setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, facebook: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Instagram URL</label>
            <input
              type="text"
              placeholder="e.g., https://instagram.com/yourpage"
              value={formData.socialMedia?.instagram || ''}
              onChange={(e) => setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, instagram: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Twitter/X URL</label>
            <input
              type="text"
              placeholder="e.g., https://twitter.com/yourpage"
              value={formData.socialMedia?.twitter || ''}
              onChange={(e) => setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, twitter: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Copyright Text
        </label>
        <input
          type="text"
          value={formData.copyright || ''}
          onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
          placeholder="e.g., Glow Clinic or Dr Baig's Clinic"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Text shown in the copyright notice (year is added automatically)</p>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function ContactEditor({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave('contact', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Section</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure the contact/appointment booking section</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Book Your Appointment"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Main heading for the contact section</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section Subtitle
        </label>
        <textarea
          value={formData.subtitle || ''}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          rows={2}
          placeholder="e.g., Start your journey to healthier skin and hair today"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supporting text that encourages users to book</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address for Appointments <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="e.g., appointments@clinic.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email address where appointment booking requests will be sent</p>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Template Configuration</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Customize the email subject and body that will be sent when someone books an appointment.
          Use placeholders: {'{name}'}, {'{email}'}, {'{phone}'}, {'{service}'}, {'{message}'}, {'{date}'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.emailSubject || ''}
          onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
          placeholder="e.g., New Appointment Booking Request - {service}"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Subject line for appointment emails. Use {'{service}'} to include the selected service name.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Body Template <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.emailBody || ''}
          onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
          rows={10}
          placeholder="e.g., New Appointment Booking Request&#10;&#10;Name: {name}&#10;Email: {email}&#10;Phone: {phone}&#10;Service: {service}&#10;Message: {message}&#10;&#10;Submitted on: {date}"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Email body template. Available placeholders: {'{name}'}, {'{email}'}, {'{phone}'}, {'{service}'}, {'{message}'}, {'{date}'}
        </p>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
