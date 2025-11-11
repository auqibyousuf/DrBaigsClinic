import { Metadata } from 'next';
import Image from 'next/image';
import Section from '@/components/Section';
import Button from '@/components/Button';

export const metadata: Metadata = {
  title: 'Hijama Therapy',
  description: 'Traditional cupping therapy for detoxification, pain relief, and overall wellness. Certified practitioners.',
  keywords: ['hijama', 'cupping therapy', 'traditional medicine', 'detoxification', 'pain relief'],
};

export default function HijamaPage() {
  return (
    <>
      <section className="pt-24 pb-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Hijama Therapy</h1>
            <p className="text-xl md:text-2xl leading-relaxed opacity-90">
              Traditional cupping therapy for detoxification, pain relief, and overall wellness.
              Experience the healing benefits of this ancient practice.
            </p>
          </div>
        </div>
      </section>

      <Section className="bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Ancient Healing, Modern Application</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Hijama, also known as cupping therapy, is an ancient healing practice that has been used
                for thousands of years. Our trained practitioners combine traditional techniques with
                modern hygiene standards to provide safe, effective treatments.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The therapy involves creating a vacuum on the skin using cups, which helps draw out toxins,
                improve blood circulation, and stimulate the body's natural healing processes.
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-accent-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Certified Hijama practitioners</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-accent-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Sterile, single-use equipment</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-accent-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Comfortable, relaxing environment</span>
                </div>
              </div>
              <Button href="#contact" variant="primary" size="lg">
                Book Session
              </Button>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200"
                alt="Hijama Therapy"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Benefits of Hijama Therapy"
        subtitle="Experience the healing power"
        className="bg-gray-50"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Pain Relief',
                description: 'Effective for chronic pain conditions including back pain, migraines, and arthritis.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: 'Detoxification',
                description: 'Helps remove toxins and waste products from the body, improving overall health.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Improved Circulation',
                description: 'Stimulates blood flow and improves circulation throughout the treated areas.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
              },
              {
                title: 'Stress Reduction',
                description: 'Promotes relaxation and reduces stress, supporting mental and emotional wellbeing.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
              },
              {
                title: 'Immune Support',
                description: 'Boosts the immune system and enhances the body\'s natural healing capabilities.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: 'Skin Health',
                description: 'Improves skin condition by increasing blood flow and promoting cellular regeneration.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-accent-600 mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Types of Hijama"
        subtitle="Choose the treatment that suits you"
        className="bg-white"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-accent-50 to-primary-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Wet Cupping (Hijama)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The traditional method involving small incisions and controlled bleeding to remove
                stagnant blood and toxins. Most effective for detoxification and specific health conditions.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Traditional technique</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Maximum detoxification</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Used for specific conditions</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Dry Cupping</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Non-invasive technique using suction only, without incisions. Ideal for muscle relaxation,
                pain relief, and improving circulation.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No incisions required</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gentle and relaxing</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Perfect for beginners</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="contact"
        title="Experience the Benefits of Hijama"
        subtitle="Book your session today"
        className="bg-gradient-to-br from-accent-600 to-primary-600 text-white"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl mb-8">
            Discover the healing benefits of this ancient therapy. Our certified practitioners are ready
            to guide you through your Hijama journey.
          </p>
          <Button href="/#contact" variant="secondary" size="lg" className="bg-white text-accent-600 hover:bg-gray-100">
            Book Session
          </Button>
        </div>
      </Section>
    </>
  );
}
