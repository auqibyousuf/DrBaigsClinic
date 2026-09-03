'use client';

import { useEffect, useRef, useState } from 'react';
import Hero from '@/components/Hero';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import Button from '@/components/Button';
import ScrollReveal from '@/components/ScrollReveal';
import { useBookingModal } from '@/components/BookingModalProvider';
import { useCMSData } from '@/lib/cms-client';
import { defaultServices } from '@/lib/default-services';
import { MapPin, Phone, EnvelopeSimple, CalendarCheck } from '@phosphor-icons/react';


export default function Home() {
  const [showAllServices, setShowAllServices] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { open: openBookingModal } = useBookingModal();

  const { data: heroData, loading: heroLoading, error: heroError } = useCMSData('hero');
  const { data: servicesData, loading: servicesLoading, error: servicesError } = useCMSData('services');
  const { data: aboutData, loading: aboutLoading, error: aboutError } = useCMSData('about');
  const { data: contactData, loading: contactLoading, error: contactError } = useCMSData('contact');
  const { data: footerData } = useCMSData('footer');

  useEffect(() => {
    if (heroError) console.error('Hero data error:', heroError);
    if (servicesError) console.error('Services data error:', servicesError);
    if (aboutError) console.error('About data error:', aboutError);
    if (contactError) console.error('Contact data error:', contactError);
  }, [heroError, servicesError, aboutError, contactError]);

  const services = servicesData?.items?.length ? servicesData.items : defaultServices;
  const displayedServices = showAllServices ? services : services.slice(0, 8);

  // Carousel navigation — scrolls the native scroll-snap row rather than
  // faking motion with a CSS transform, so there's no peeking-neighbor
  // overlap or absolutely-positioned arrows sitting on top of card content.
  const scrollToService = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const clampedIndex = Math.max(0, Math.min(index, displayedServices.length - 1));
    const card = container.children[clampedIndex] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    setCurrentServiceIndex(clampedIndex);
  };

  const goToService = (index: number) => scrollToService(index);

  const handleCarouselScroll = () => {
    const container = carouselRef.current;
    if (!container) return;
    const { scrollLeft, children } = container;
    let closestIndex = 0;
    let closestDistance = Infinity;
    Array.from(children).forEach((child, index) => {
      const el = child as HTMLElement;
      const distance = Math.abs(el.offsetLeft - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setCurrentServiceIndex(closestIndex);
  };

  const heroTitle = heroData?.title || "Transform Your Skin & Hair";
  const heroSubtitle = heroData?.subtitle || "Experience world-class treatments at Dr Baig's Clinic. Your journey to confidence starts here.";
  const heroCtaText = heroData?.ctaText || "Book Consultation";
  const heroBackgroundImage = heroData?.backgroundImage;

  const servicesTitle = servicesData?.title || "Our Services";
  const servicesSubtitle = servicesData?.subtitle || "Comprehensive skin and hair care solutions tailored to your needs";

  const aboutTitle = aboutData?.title || "Why Choose Baig's Clinic?";
  const aboutSubtitle = aboutData?.subtitle || "Excellence in every treatment";
  const aboutFeatures = aboutData?.features?.length ? aboutData.features : [
    {
      id: "expert-team",
      title: "Expert Team",
      description: "Board-certified specialists with years of experience in dermatology and trichology.",
      icon: "shield"
    },
    {
      id: "advanced-tech",
      title: "Advanced Technology",
      description: "Latest medical-grade equipment and innovative treatment protocols for best results.",
      icon: "lightning"
    },
    {
      id: "personalized-care",
      title: "Personalized Care",
      description: "Customized treatment plans designed specifically for your unique needs and goals.",
      icon: "heart"
    }
  ];

  const contactTitle = contactData?.title || "Book Your Appointment";
  const contactSubtitle = contactData?.subtitle || "Start your journey to healthier skin and hair today";
  // Sourced from the same footer contact info the admin already edits in
  // the Footer Settings tab — one place to update address/phone/email,
  // reflected both in the footer and in this on-page contact section.
  const contactInfo = footerData?.contact && typeof footerData.contact === 'object'
    ? footerData.contact
    : { address: '123 Health Street\nCity, State 12345', phone: '+1 (234) 567-890', email: 'info@drbaigsclinic.com' };

  // The address field stores one branch per line as "Label: street details"
  // (multiple clinic locations) — split it into distinct labeled entries
  // instead of rendering it as one run-on paragraph.
  const branches: { label: string | null; details: string }[] = String(contactInfo.address || '')
    .split('\n')
    .map((line: string) => line.trim())
    .filter(Boolean)
    .map((line: string) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return { label: null, details: line };
      return { label: line.slice(0, separatorIndex).trim(), details: line.slice(separatorIndex + 1).trim() };
    });

  const iconMap: Record<string, JSX.Element> = {
    shield: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    lightning: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    heart: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  };

  return (
    <>
      <Hero
        title={heroTitle}
        subtitle={heroSubtitle}
        ctaText={heroCtaText}
        onCtaClick={openBookingModal}
        backgroundImage={heroBackgroundImage}
      />

      <Section
        id="services"
        eyebrow="What We Offer"
        title={servicesTitle}
        subtitle={servicesSubtitle}
        className="bg-gray-50 dark:bg-gray-900"
      >
        {/* Mobile Carousel — a native scroll-snap row, contained within the
            section's own width (no negative-margin bleed that can push the
            whole page into horizontal overflow), dots-only navigation. */}
        <div className="block md:hidden w-full max-w-full overflow-hidden">
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
          >
            {displayedServices.map((service: { id: string; title: string; description: string; image: string }, index: number) => (
              <div key={service.id} className="w-[80%] xs:w-[68%] flex-shrink-0 snap-center">
                <ServiceCard service={service} index={index} />
              </div>
            ))}
          </div>

          {displayedServices.length > 1 && (
            <div className="flex justify-center items-center gap-2.5 mt-6">
              {/* The button is the 44px touch target (global a11y rule); the
                  inner span is the actual small visible dot. */}
              {/* A carousel dot is a small supplementary control, not a primary
                  action — deliberately not run through Button/the 44px touch
                  rule, which would balloon it into a padded box. */}
              {displayedServices.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => goToService(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    index === currentServiceIndex
                      ? 'bg-primary-600 dark:bg-primary-400 w-7'
                      : 'bg-gray-300 dark:bg-gray-600 w-2.5'
                  }`}
                  aria-label={`Go to service ${index + 1}`}
                  aria-current={index === currentServiceIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 px-4 sm:px-0">
          {displayedServices.map((service: { id: string; title: string; description: string; image: string }, index: number) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {services.length > 8 && (
          <div className="mt-6 sm:mt-8 md:mt-10 text-center px-4 sm:px-0">
            <Button
              onClick={() => setShowAllServices(!showAllServices)}
              variant="outline"
              size="lg"
              className="mx-auto text-xs sm:text-sm md:text-base px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4"
            >
              <span className="flex items-center space-x-1 sm:space-x-2">
                <span>{showAllServices ? 'Show Less' : 'View All Services'}</span>
                <svg
                  className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform duration-300 ${showAllServices ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </Button>
          </div>
        )}
      </Section>

      <Section
        id="about"
        eyebrow="Why Choose Us"
        title={aboutTitle}
        subtitle={aboutSubtitle}
        className="bg-white dark:bg-gray-900"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
          {aboutFeatures.map((feature: any, index: number) => (
            <ScrollReveal key={feature.id} direction="up" delay={index * 100}>
              <article className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-rest hover:shadow-hover transition-shadow duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 h-full">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6" aria-hidden="true">
                  {iconMap[feature.icon] || iconMap.shield}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      <Section
        id="contact"
        eyebrow="Get In Touch"
        title={contactTitle}
        subtitle={contactSubtitle}
        className="bg-gray-50 dark:bg-gray-900"
      >
        <div className="max-w-4xl mx-auto">
          {branches.length > 0 && (
            <ScrollReveal direction="up" delay={0}>
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-rest border border-gray-100 dark:border-gray-700 mb-6"
                style={{ padding: 'var(--space-md)' }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-sm)' }}>
                  <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" weight="duotone" />
                  <h3 className="font-bold text-gray-900 dark:text-white" style={{ fontSize: 'var(--text-lg)' }}>
                    Our Locations
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {branches.map((branch: { label: string | null; details: string }, i: number) => (
                    <div key={i}>
                      {branch.label && (
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">
                          {branch.label}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {branch.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <ScrollReveal direction="up" delay={80}>
              <a
                href={`tel:${contactInfo.phone?.replace(/[^\d+]/g, '')}`}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-rest hover:shadow-hover border border-gray-100 dark:border-gray-700 h-full transition-shadow"
                style={{ padding: 'var(--space-md)' }}
              >
                <span className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" weight="duotone" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Call us</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{contactInfo.phone}</p>
                </div>
              </a>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={160}>
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-rest hover:shadow-hover border border-gray-100 dark:border-gray-700 h-full transition-shadow"
                style={{ padding: 'var(--space-md)' }}
              >
                <span className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <EnvelopeSimple className="w-5 h-5 text-primary-600 dark:text-primary-400" weight="duotone" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email us</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{contactInfo.email}</p>
                </div>
              </a>
            </ScrollReveal>
          </div>
          <div className="text-center">
            <Button onClick={openBookingModal} variant="primary" size="lg" icon={<CalendarCheck weight="bold" />}>
              Book Consultation
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
