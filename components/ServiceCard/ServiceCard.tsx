'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ServiceCardProps } from '@/types/component.types';
import ScrollReveal from '@/components/ScrollReveal';

const ServiceCard = ({ service, index = 0 }: ServiceCardProps) => {
  return (
    <ScrollReveal delay={index * 80} direction="up">
      <Link href={`/services/${service.id}`} className="block h-full" aria-label={`Learn more about ${service.title}`}>
        <article className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-rest hover:shadow-hover transition-shadow duration-300 h-full overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700">
          <div className="relative h-36 xs:h-40 sm:h-44 md:h-40 lg:h-44 xl:h-48 overflow-hidden bg-primary-100 dark:bg-primary-900/30">
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              unoptimized={service.image?.startsWith('http') && !service.image.includes('localhost')}
            />

            {service.price && (
              <div
                className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-gray-900 rounded-lg shadow-rest flex items-center space-x-1 z-10"
                aria-label={`Price: ${service.price}`}
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">
                  {service.price}
                </span>
              </div>
            )}

            <div
              className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-rest group-hover:bg-primary-600 dark:group-hover:bg-primary-600 transition-colors duration-300"
              aria-hidden="true"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
              {service.title}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3">
              {service.description}
            </p>

            <div
              className="flex items-center text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-500 transition-colors"
              aria-hidden="true"
            >
              <span>Learn more</span>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </article>
      </Link>
    </ScrollReveal>
  );
};

export default ServiceCard;
