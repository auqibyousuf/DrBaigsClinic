'use client';

import { SectionProps } from '@/types/component.types';
import ScrollReveal from '@/components/ScrollReveal';

const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  className = '',
  id,
}) => {
  return (
    <section id={id} className={`py-12 sm:py-16 md:py-20 lg:py-24 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            {title && (
              <ScrollReveal direction="fade" delay={0}>
                <h2 className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2 sm:px-0 ${className.includes('text-white') ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                  {title}
                </h2>
              </ScrollReveal>
            )}
            {subtitle && (
              <ScrollReveal direction="fade" delay={100}>
                <p className={`text-sm xs:text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4 sm:px-0 ${className.includes('text-white') ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}`}>
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
