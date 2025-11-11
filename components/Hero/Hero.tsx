'use client';

import Image from 'next/image';
import Button from '@/components/Button';
import { HeroProps } from '@/types/component.types';
import ScrollReveal from '@/components/ScrollReveal';

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  ctaText = 'Book Appointment',
  ctaHref = '#contact',
  backgroundImage = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop',
}) => {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh] flex items-center justify-center pt-16 sm:pt-20 pb-12 sm:pb-16 overflow-hidden" aria-label="Hero section">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Clinic Background"
          fill
          className="object-cover"
          priority
          quality={90}
          sizes="100vw"
          unoptimized={backgroundImage?.startsWith('http') && !backgroundImage.includes('localhost')}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-accent-900/80"></div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Content */}
      <div className="max-w-[1366px] mx-auto px-4 sm:px-4 md:px-6 lg:px-8 xl:px-12 relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="fade" delay={100}>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg px-2">
              {title}
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="fade" delay={200}>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/95 mb-6 sm:mb-8 md:mb-10 leading-relaxed drop-shadow-md px-4 sm:px-0">
              {subtitle}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
              <Button href={ctaHref} variant="primary" size="lg" className="w-full xs:w-auto bg-primary-600 text-white hover:bg-primary-700 shadow-xl text-sm sm:text-base">
                {ctaText}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce" aria-hidden="true">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
