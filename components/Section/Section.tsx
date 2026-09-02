'use client';

import { SectionProps } from '@/types/component.types';
import ScrollReveal from '@/components/ScrollReveal';

interface SectionPropsWithEyebrow extends SectionProps {
  eyebrow?: string;
}

const Section: React.FC<SectionPropsWithEyebrow> = ({
  title,
  subtitle,
  eyebrow,
  children,
  className = '',
  id,
}) => {
  return (
    <section
      id={id}
      className={className}
      style={{ paddingBlock: 'var(--space-2xl)' }}
    >
      <div className="max-w-[1366px] mx-auto px-4 sm:px-4 md:px-6 lg:px-8 xl:px-12 w-full">
        {(title || subtitle) && (
          <div className="text-center" style={{ marginBottom: 'var(--space-lg)' }}>
            {eyebrow && (
              <ScrollReveal direction="fade" delay={0}>
                <span
                  className={`eyebrow ${className.includes('text-white') ? '!text-white/90' : ''}`}
                >
                  {eyebrow}
                </span>
              </ScrollReveal>
            )}
            {title && (
              <ScrollReveal direction="fade" delay={0}>
                <h2
                  className={`font-bold px-2 sm:px-0 ${className.includes('text-white') ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}
                  style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-xs)' }}
                >
                  {title}
                </h2>
              </ScrollReveal>
            )}
            {subtitle && (
              <ScrollReveal direction="fade" delay={100}>
                <p
                  className={`max-w-2xl mx-auto px-4 sm:px-0 ${className.includes('text-white') ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}`}
                  style={{ fontSize: 'var(--text-lg)' }}
                >
                  {subtitle}
                </p>
              </ScrollReveal>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
