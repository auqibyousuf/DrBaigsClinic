'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ServiceCardProps } from '@/types/component.types';
import ScrollReveal from '@/components/ScrollReveal';

const ServiceCard = ({ service, index = 0 }: ServiceCardProps) => {
  return (
    <ScrollReveal delay={index * 100} direction="up">
      <Link href={`/services/${service.id}`} className="block h-full" aria-label={`Learn more about ${service.title}`}>
        <article className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 h-full overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 active:scale-[0.98]">
          {/* Image Container - Responsive height */}
          <div className="relative h-36 xs:h-40 sm:h-44 md:h-40 lg:h-44 xl:h-48 overflow-hidden bg-primary-100">
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              unoptimized={service.image?.startsWith('http') && !service.image.includes('localhost')}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20 sm:via-black/10 sm:to-black/30"></div>

            {/* Price Badge - Floating on image */}
            {service.price && (
              <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg flex items-center space-x-1 group-hover:bg-primary-600 dark:group-hover:bg-primary-600 transition-all duration-300 group-hover:scale-105 z-10" aria-label={`Price: ${service.price}`}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors whitespace-nowrap">
                  {service.price}
                </span>
              </div>
            )}

            {/* Icon Badge - Responsive sizing */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-primary-600 dark:group-hover:bg-primary-600 transition-all duration-300 shadow-md group-hover:scale-110" aria-hidden="true">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Content - Responsive padding and text */}
          <div className="p-4 sm:p-5 lg:p-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
              {service.title}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3">
              {service.description}
            </p>

            {/* Read More Link - Responsive sizing */}
            <div className="flex items-center text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-500 transition-colors" aria-hidden="true">
              <span>Learn more</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 border-2 border-primary-600 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true"></div>
        </article>
      </Link>
    </ScrollReveal>
  );
};

export default ServiceCard;
