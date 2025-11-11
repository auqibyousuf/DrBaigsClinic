'use client';

import Link from 'next/link';
import { useCMSData } from '@/lib/cms-client';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data: footerData } = useCMSData('footer');

  const brandName = footerData?.brandName || "Dr Baig's Clinic";
  const logo = footerData?.logo || '/logo.png';
  const description = footerData?.description || "Your trusted partner for comprehensive skin and hair care solutions. Experience excellence in every treatment.";
  const services = footerData?.services || [
    { name: 'Hair Treatments', href: '/services/hair' },
    { name: 'Skin Care', href: '/services/skin' },
    { name: 'Hair Transplantation', href: '/services/transplantation' },
    { name: 'Hijama Therapy', href: '/services/hijama' },
  ];
  const quickLinks = footerData?.quickLinks || [
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
    { name: 'Blog', href: '/blog' },
  ];
  const contact = footerData?.contact || {
    address: "123 Health Street\nCity, State 12345",
    phone: "+1 (234) 567-890",
    email: "info@glowclinic.com"
  };
  const socialMedia = footerData?.socialMedia || [];
  const copyright = footerData?.copyright || "Glow Clinic";
  const legalLinks = footerData?.legalLinks || [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' }
  ];

  return (
    <footer className="relative bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 overflow-hidden" role="contentinfo" aria-label="Site footer">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary-600"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              {logo && (
                <div className="w-12 h-12 flex items-center justify-center">
                  <img
                    src={logo}
                    alt={`${brandName} Logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Hide if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <h3 className="text-2xl sm:text-3xl font-bold text-white dark:text-gray-100">
                {brandName}
              </h3>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-6 leading-relaxed">
              {description}
            </p>
            <nav aria-label="Social media links">
              <ul className="flex flex-wrap gap-3" role="list">
                {socialMedia.map((item: { id: string; name: string; url: string; icon?: string }) => (
                  item.url && (
                    <li key={item.id}>
                      <a
                        href={item.url}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-white hover:bg-primary-600 dark:hover:bg-primary-600 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        aria-label={`Visit our ${item.name} page`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.icon ? (
                          <img src={item.icon} alt={item.name} className="w-5 h-5" />
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        )}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </nav>
          </div>

          {/* Services */}
          <nav aria-label="Service links">
            <h4 className="text-white dark:text-gray-100 font-bold text-lg mb-6">Services</h4>
            <ul className="space-y-3" role="list">
              {services.map((service: { name: string; href: string }, index: number) => (
                <li key={`service-${index}-${service.name}`}>
                  <Link
                    href={service.href}
                    className="text-gray-400 hover:text-primary-400 transition-all duration-300 inline-block hover:translate-x-1 group"
                  >
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {service.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h4 className="text-white dark:text-gray-100 font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3" role="list">
              {quickLinks.map((link: { name: string; href: string }, index: number) => (
                <li key={`quicklink-${index}-${link.name}`}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-all duration-300 inline-block hover:translate-x-1 group"
                  >
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Info */}
          <address className="not-italic">
            <h4 className="text-white dark:text-gray-100 font-bold text-lg mb-6">Contact</h4>
            <ul className="space-y-4" role="list">
              <li className="flex items-start text-gray-400 dark:text-gray-500">
                <svg className="w-5 h-5 mr-3 mt-0.5 text-primary-400 dark:text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span style={{ whiteSpace: 'pre-line' }}>{contact.address}</span>
              </li>
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex items-center text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-400 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">
                  <svg className="w-5 h-5 mr-3 text-primary-400 dark:text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-400 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">
                  <svg className="w-5 h-5 mr-3 text-primary-400 dark:text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {contact.email}
                </a>
              </li>
            </ul>
          </address>
        </div>

        <div className="border-t border-gray-700/50 dark:border-gray-800/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 dark:text-gray-500 text-sm">
            <p>&copy; {currentYear} {copyright}. All rights reserved.</p>
            <nav aria-label="Footer legal links">
              <ul className="flex space-x-6 mt-4 md:mt-0" role="list">
                {legalLinks.map((link: any, index: number) => (
                  <li key={`legal-${index}-${link.name}`}>
                    <a href={link.href} className="hover:text-primary-400 dark:hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">{link.name}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
