'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from '@/components/Button';
import { HeroProps } from '@/types/component.types';
import ScrollReveal from '@/components/ScrollReveal';

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  ctaText = 'Book Appointment',
  ctaHref = '#contact',
  onCtaClick,
  backgroundImage,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[min(80vh,52rem)] flex items-center justify-center overflow-hidden"
      style={{
        paddingBlockStart: 'clamp(6rem, 5rem + 4vw, 8.5rem)',
        paddingBlockEnd: 'var(--space-2xl)',
      }}
      aria-label="Hero section"
    >
      <motion.div className="absolute inset-0 z-0" style={{ y: imageY, scale: imageScale }}>
        {/* No stock-photo fallback here — only ever render the image the
            clinic actually uploaded via the CMS. While that data is still
            loading (or if none was ever set), the gradient below shows on
            its own instead of flashing an unrelated placeholder photo. */}
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt="Clinic Background"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
            unoptimized={backgroundImage.startsWith('http') && !backgroundImage.includes('localhost')}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/85 via-primary-800/75 to-primary-950/85"></div>
      </motion.div>

      <div className="max-w-[1366px] mx-auto px-4 sm:px-4 md:px-6 lg:px-8 xl:px-12 relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="fade" delay={100}>
            <h1
              className="font-bold text-white leading-tight drop-shadow-lg px-2"
              style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-sm)' }}
            >
              {title}
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="fade" delay={200}>
            <p
              className="text-white/95 leading-relaxed drop-shadow-md px-4 sm:px-0 max-w-3xl mx-auto"
              style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-lg)' }}
            >
              {subtitle}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
              <Button
                {...(onCtaClick ? { onClick: onCtaClick } : { href: ctaHref })}
                variant="primary"
                size="lg"
                className="w-full xs:w-auto text-sm sm:text-base"
              >
                {ctaText}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        aria-hidden="true"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
};

export default Hero;
