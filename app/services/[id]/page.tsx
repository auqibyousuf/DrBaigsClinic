import { notFound } from 'next/navigation';
import Image from 'next/image';
import Section from '@/components/Section';
import ScrollReveal from '@/components/ScrollReveal';
import BookConsultationButton from '@/components/BookConsultationButton';
import { Service } from '@/types';
import { generateMetadata } from './metadata';
import { getCMSData } from '@/lib/cms';

export { generateMetadata };

type ServiceDetail = Service & {
  features: string[];
  duration?: string;
  price?: string;
  overview?: string;
  heroImage?: string;
  steps?: Array<{ title: string; description: string }>;
  faqs?: Array<{ question: string; answer: string }>;
};

const defaultSteps = [
  {
    title: 'Initial Consultation',
    description:
      'We begin with a thorough consultation to understand your concerns, medical history, and goals. Our specialists will assess your condition and discuss treatment options.',
  },
  {
    title: 'Customized Treatment Plan',
    description:
      'Based on your consultation, we create a personalized treatment plan tailored to your specific needs, ensuring optimal results.',
  },
  {
    title: 'Treatment Session',
    description:
      'Our experienced team performs the treatment using advanced techniques and equipment, ensuring your comfort and safety throughout the process.',
  },
  {
    title: 'Aftercare & Follow-up',
    description:
      'We provide detailed aftercare instructions and schedule follow-up appointments to monitor your progress and ensure optimal healing.',
  },
];

export default async function ServicePage({ params }: { params: { id: string } }) {
  // Fetch service data from Supabase only - no fallback
  let service: ServiceDetail | null = null;

  try {
    const cmsData = await getCMSData();
    const cmsService = cmsData.services?.items?.find((item: { id: string }) => item.id === params.id);

    if (cmsService) {
      service = {
        id: cmsService.id,
        title: cmsService.title,
        description: cmsService.description,
        image: cmsService.image,
        features: cmsService.features || [],
        duration: cmsService.duration,
        price: cmsService.price,
        overview: cmsService.overview,
        heroImage: cmsService.heroImage,
        steps: cmsService.steps,
        faqs: cmsService.faqs,
      };
    }
  } catch (error) {
    console.error('Error fetching service from Supabase:', error);
  }

  if (!service) {
    notFound();
  }

  return (
    <>
      <section
        className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-primary-950"
        style={{ paddingBlockStart: 'clamp(6rem, 5rem + 4vw, 7.5rem)', paddingBlockEnd: 'var(--space-lg)' }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal direction="fade">
              <h1 className="text-gray-900 dark:text-white" style={{ marginBottom: 'var(--space-sm)' }}>
                {service.title}
              </h1>
              <p
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
                style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}
              >
                {service.description}
              </p>
              <div className="flex flex-wrap gap-4">
                {service.duration && (
                  <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-rest">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{service.duration}</p>
                  </div>
                )}
                {service.price && (
                  <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-rest">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Starting from:</span>
                    <p className="font-semibold text-primary-600 dark:text-primary-400">{service.price}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Section className="bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <ScrollReveal direction="left">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-elevated">
                <Image
                  src={service.heroImage || service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={service.image?.startsWith('http') && !service.image.includes('localhost')}
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Treatment Overview</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {service.overview ||
                  `Our ${service.title.toLowerCase()} service combines expert knowledge with advanced technology ` +
                    `to deliver exceptional results. Each treatment is customized to meet your specific needs ` +
                    `and goals, ensuring the best possible outcome.`}
              </p>
              <BookConsultationButton />
            </ScrollReveal>
          </div>
        </div>
      </Section>

      <Section
        title="Treatment Features"
        subtitle="What's included in your treatment"
        className="bg-gray-50 dark:bg-gray-950"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.features.map((feature, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 60}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-rest hover:shadow-hover transition-shadow border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="ml-4 text-gray-800 dark:text-gray-200 font-medium">{feature}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="What to Expect"
        subtitle="Your treatment journey"
        className="bg-white dark:bg-gray-900"
      >
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {(service.steps && service.steps.length > 0 ? service.steps : defaultSteps).map(
              (step, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 80}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300">{step.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              )
            )}
          </div>
        </div>
      </Section>

      {service.faqs && service.faqs.length > 0 && (
        <Section
          title="Frequently Asked Questions"
          subtitle="Answers to common questions"
          className="bg-gray-50 dark:bg-gray-950"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {service.faqs.map((faq, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 60}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-rest border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
