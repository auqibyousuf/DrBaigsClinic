'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import ToastProvider from '@/components/ToastProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/cms/auth', {
      method: 'DELETE',
      credentials: 'include'
    });
    router.push('/logout-success');
  };

  // Close logout dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#admin-header-dropdown') && !target.closest('#admin-name-button')) {
        setShowLogout(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Don't show header on login page
  if (pathname === '/admin' && !pathname.includes('dashboard')) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Admin Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50" role="banner">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 min-h-[56px]">
              <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
                <Image
                  src="/icon.svg"
                  alt="Dr Baig's Clinic Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                  priority
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
                    <span className="hidden sm:inline">Dr Baig's Clinic - </span>CMS
                  </h1>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Content Management System
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center space-x-1"
                  aria-label="Preview website in new tab"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline">Preview</span>
                  <span className="sm:hidden">Preview</span>
                </a>
                <a
                  href="/logout-success"
                  onClick={async (e) => {
                    e.preventDefault();
                    await fetch('/api/cms/auth', {
                      method: 'DELETE',
                      credentials: 'include'
                    });
                    router.push('/logout-success');
                  }}
                  className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="View website and logout"
                >
                  <span className="hidden sm:inline">View Website</span>
                  <span className="sm:hidden">View</span>
                  <span className="hidden md:inline ml-1">→</span>
                </a>
                <div className="relative">
                  <button
                    id="admin-name-button"
                    onClick={() => setShowLogout(!showLogout)}
                    aria-expanded={showLogout}
                    aria-haspopup="true"
                    aria-label="Admin menu"
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden sm:inline">Dr Baig</span>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${showLogout ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showLogout && (
                    <div
                      id="admin-header-dropdown"
                      role="menu"
                      aria-orientation="vertical"
                      className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Dr Baig's Clinic</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Manage your website</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          role="menuitem"
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                          aria-label="Logout from admin panel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </ToastProvider>
  );
}
