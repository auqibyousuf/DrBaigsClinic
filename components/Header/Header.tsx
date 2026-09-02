'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Button from '@/components/Button';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import { useCMSData } from '@/lib/cms-client';
import { useBookingModal } from '@/components/BookingModalProvider';
import { CalendarCheck, ShieldCheck, List, X, House } from '@phosphor-icons/react';
import { getIcon } from '@/lib/icons';

// Renders whichever icon the admin picked (any name from lib/icons.ts) —
// falls back to House so a nav item never renders with no icon at all.
function NavIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = getIcon(name) || House;
  return <Icon className={className} weight="duotone" />;
}

const defaultNavItems = [
  { id: 'home', label: 'Home', href: '/', icon: 'home' },
  { id: 'services', label: 'Services', href: '/#services', icon: 'services' },
  { id: 'about', label: 'About', href: '/#about', icon: 'about' },
  { id: 'contact', label: 'Contact', href: '/#contact', icon: 'contact' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { open: openBookingModal } = useBookingModal();
  const { data: headerData } = useCMSData('header');

  // Check if we're on admin login page
  const isAdminLoginPage = pathname === '/admin';
  // The whole /admin section has its own header (app/admin/layout.tsx) — the
  // public site nav has no business rendering there too.
  const isAdminSection = pathname?.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const brandName = headerData?.brandName || "Dr Baig's Clinic";
  const logo = headerData?.logo || '/icon.svg';
  const navItems = headerData?.navItems?.length ? headerData.navItems : defaultNavItems;
  const ctaButton = headerData?.ctaButton || { text: 'Book Appointment', href: '/#contact' };

  if (isAdminSection) {
    return null;
  }

  return (
    // The bar still floats into an inset, rounded, shadowed pill on scroll —
    // but its own max-width and the <nav> content's max-width are now both
    // pinned to the same 1366px, so the visible content never shrinks or
    // rewraps between states; only the margin/radius/shadow "pill" chrome
    // toggles.
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none">
      <header
        className={`relative pointer-events-auto w-full transition-[margin,border-radius,box-shadow,background-color] duration-500 ease-out ${
          isScrolled
            ? 'max-w-[1366px] mt-3 sm:mt-4 mx-4 rounded-full shadow-hover bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
            : 'max-w-none mt-0 mx-0 rounded-none bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
        }`}
      >
        {!isScrolled && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500"
            aria-hidden="true"
          />
        )}
        <nav
          className={`mx-auto w-full max-w-[1366px] transition-all duration-500 ${
            isScrolled
              ? 'px-4 sm:px-6 py-3 sm:py-3.5'
              : 'px-4 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-5'
          }`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-base sm:text-lg font-extrabold transition-opacity duration-300 hover:opacity-80 group flex-shrink-0"
            >
              {logo && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <Logo src={logo} />
                </div>
              )}
              <span className="whitespace-nowrap bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                {brandName}
              </span>
            </Link>

            {/* Desktop Navigation — underline-on-hover, not filled pills, for
                a crisper, less "button soup" nav row. */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              {!isAdminLoginPage &&
                navItems.map((item: any) => (
                  <Link
                    key={item.href || item.id}
                    href={item.href}
                    className="group relative flex items-center gap-1.5 py-1.5 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-semibold text-xs xl:text-sm whitespace-nowrap"
                  >
                    <span className="opacity-60 group-hover:opacity-100 transition-opacity [&>svg]:w-4 [&>svg]:h-4">
                      <NavIcon name={item.icon || item.id} />
                    </span>
                    {item.label}
                    <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              {isAdminLoginPage && (
                <Link
                  href="/"
                  className="group relative flex items-center gap-1.5 py-1.5 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-semibold text-xs xl:text-sm whitespace-nowrap"
                >
                  <span className="opacity-60 group-hover:opacity-100 transition-opacity [&>svg]:w-4 [&>svg]:h-4">
                    <NavIcon name="home" className="w-5 h-5" />
                  </span>
                  Home
                  <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
              <div className="flex items-center gap-1.5 ml-1.5 pl-4 border-l border-gray-200 dark:border-gray-700">
                <ThemeToggle />
                {!isAdminLoginPage && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-1 px-2 xl:px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap"
                      aria-label="Go to admin panel"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" weight="duotone" />
                      Admin
                    </Link>
                    <Button
                      onClick={openBookingModal}
                      variant="primary"
                      size="sm"
                      icon={<CalendarCheck weight="bold" />}
                      className="!px-4 !py-1.5 !text-xs whitespace-nowrap"
                    >
                      {ctaButton.text}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile/Tablet Menu Button */}
            <button
              className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" weight="bold" />
              ) : (
                <List className="w-6 h-6" weight="bold" />
              )}
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
                      className="flex items-center space-x-3 px-4 py-3 text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all font-semibold group active:bg-primary-100 dark:active:bg-primary-900/50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-primary-600 dark:text-primary-400 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <NavIcon name={item.icon || item.id} className="w-5 h-5" />
                      </span>
                      <span className="text-base">{item.label}</span>
                    </Link>
                  ))}
                {isAdminLoginPage && (
                  <Link
                    href="/"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all font-semibold group active:bg-primary-100 dark:active:bg-primary-900/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-primary-600 dark:text-primary-400 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <NavIcon name="home" className="w-5 h-5" />
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
                        className="flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        aria-label="Go to admin panel"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShieldCheck className="w-4 h-4" weight="duotone" />
                        <span>Admin Login</span>
                      </Link>
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          openBookingModal();
                        }}
                        variant="primary"
                        size="md"
                        icon={<CalendarCheck weight="bold" />}
                        className="w-full"
                      >
                        {ctaButton.text}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
    </div>
  );
};

export default Header;
