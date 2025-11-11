'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Button from '@/components/Button';
import ThemeToggle from '@/components/ThemeToggle';
import { useCMSData } from '@/lib/cms-client';

const iconMap: Record<string, JSX.Element> = {
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  services: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  about: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  contact: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
};

const defaultNavItems = [
  { id: 'home', label: 'Home', href: '/', icon: 'home' },
  { id: 'services', label: 'Services', href: '#services', icon: 'services' },
  { id: 'about', label: 'About', href: '#about', icon: 'about' },
  { id: 'contact', label: 'Contact', href: '#contact', icon: 'contact' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: headerData } = useCMSData('header');

  // Check if we're on admin login page
  const isAdminLoginPage = pathname === '/admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const brandName = headerData?.brandName || "Dr Baig's Clinic";
  const logo = headerData?.logo || '/logo.png';
  const navItems = headerData?.navItems || defaultNavItems;
  const ctaButton = headerData?.ctaButton || { text: 'Book Appointment', href: '#contact' };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white dark:bg-gray-900 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
          : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-transparent'
      }`}
    >
      <nav
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-1.5 sm:space-x-2 text-xl sm:text-2xl md:text-3xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-300 group"
          >
            {logo && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img
                  src={logo}
                  alt={`${brandName} Logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <span>{brandName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {!isAdminLoginPage &&
              navItems.map((item: any) => (
                <Link
                  key={item.href || item.id}
                  href={item.href}
                  className="relative px-3 xl:px-4 py-2 xl:py-2.5 text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 font-medium text-sm xl:text-base group flex items-center space-x-1.5 xl:space-x-2 rounded-xl hover:bg-primary-50/80 dark:hover:bg-primary-900/30"
                >
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                    {iconMap[item.icon] || iconMap[item.id]}
                  </span>
                  <span>{item.label}</span>
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
                </Link>
              ))}
            {isAdminLoginPage && (
              <Link
                href="/"
                className="relative px-3 xl:px-4 py-2 xl:py-2.5 text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 font-medium text-sm xl:text-base group flex items-center space-x-1.5 xl:space-x-2 rounded-xl hover:bg-primary-50/80 dark:hover:bg-primary-900/30"
              >
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                  {iconMap.home}
                </span>
                <span>Home</span>
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
              </Link>
            )}
            <div className="flex items-center space-x-2 ml-2">
              <ThemeToggle />
              {!isAdminLoginPage && (
                <>
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Go to admin panel"
                  >
                    <span className="flex items-center space-x-1.5">
                      <svg
                        className="w-3.5 h-3.5 xl:w-4 xl:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="hidden xl:inline">Admin</span>
                    </span>
                  </Link>
                  <Button
                    href={ctaButton.href}
                    variant="primary"
                    size="sm"
                    className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    <span className="flex items-center space-x-1.5 xl:space-x-2">
                      <svg
                        className="w-3.5 h-3.5 xl:w-4 xl:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="hidden xl:inline">{ctaButton.text}</span>
                      <span className="xl:hidden">{ctaButton.text.split(' ')[0]}</span>
                    </span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <button
            className="lg:hidden p-2 sm:p-2.5 text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6 transition-transform duration-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile/Tablet Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 sm:mt-5 pb-4 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="pt-4 space-y-1">
              {!isAdminLoginPage &&
                navItems.map((item: any) => (
                  <Link
                    key={item.href || item.id}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all font-medium group active:bg-primary-100 dark:active:bg-primary-900/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-primary-600 dark:text-primary-400 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {iconMap[item.icon] || iconMap[item.id]}
                    </span>
                    <span className="text-base">{item.label}</span>
                  </Link>
                ))}
              {isAdminLoginPage && (
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all font-medium group active:bg-primary-100 dark:active:bg-primary-900/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-primary-600 dark:text-primary-400 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {iconMap.home}
                  </span>
                  <span className="text-base">Home</span>
                </Link>
              )}
              <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50 mt-2 space-y-2">
                <div className="flex items-center justify-center">
                  <ThemeToggle />
                </div>
                {!isAdminLoginPage && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      aria-label="Go to admin panel"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Admin Login</span>
                    </Link>
                    <Button
                      href={ctaButton.href}
                      variant="primary"
                      size="md"
                      className="w-full shadow-md"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{ctaButton.text}</span>
                      </span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
