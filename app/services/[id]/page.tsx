import { notFound } from 'next/navigation';
import Image from 'next/image';
import Section from '@/components/Section';
import Button from '@/components/Button';
import { Service } from '@/types';
import { generateMetadata } from './metadata';
import { getCMSData } from '@/lib/cms';

export { generateMetadata };

export default async function ServicePage({ params }: { params: { id: string } }) {
  // Fetch service data from Supabase only - no fallback
  let service: (Service & { features: string[]; duration?: string; price?: string }) | null = null;

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
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {service.title}
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4">
              {service.duration && (
                <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <p className="font-semibold text-gray-900">{service.duration}</p>
                </div>
              )}
              {service.price && (
                <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                  <span className="text-sm text-gray-600">Starting from:</span>
                  <p className="font-semibold text-primary-600">{service.price}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Section className="bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={service.image?.startsWith('http') && !service.image.includes('localhost')}
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Treatment Overview</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our {service.title.toLowerCase()} service combines expert knowledge with advanced technology
                to deliver exceptional results. Each treatment is customized to meet your specific needs
                and goals, ensuring the best possible outcome.
              </p>
              <Button href="#contact" variant="primary" size="lg">
                Book Consultation
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Treatment Features"
        subtitle="What's included in your treatment"
        className="bg-gray-50"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-gray-800 font-medium">{feature}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="What to Expect"
        subtitle="Your treatment journey"
        className="bg-white"
      >
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Initial Consultation</h3>
                <p className="text-gray-700">
                  We begin with a thorough consultation to understand your concerns, medical history, and goals.
                  Our specialists will assess your condition and discuss treatment options.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customized Treatment Plan</h3>
                <p className="text-gray-700">
                  Based on your consultation, we create a personalized treatment plan tailored to your specific
                  needs, ensuring optimal results.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Treatment Session</h3>
                <p className="text-gray-700">
                  Our experienced team performs the treatment using advanced techniques and equipment,
                  ensuring your comfort and safety throughout the process.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aftercare & Follow-up</h3>
                <p className="text-gray-700">
                  We provide detailed aftercare instructions and schedule follow-up appointments to monitor
                  your progress and ensure optimal healing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="contact"
        title="Ready to Get Started?"
        subtitle="Book your consultation today"
        className="bg-gradient-to-br from-primary-600 to-accent-600 text-white"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl mb-8">
            Take the first step towards achieving your beauty and wellness goals.
            Schedule a consultation with our expert team.
          </p>
          <Button href="/#contact" variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
            Book Appointment
          </Button>
        </div>
      </Section>
    </>
  );
}
