import { notFound } from 'next/navigation';
import Image from 'next/image';
import Section from '@/components/Section';
import Button from '@/components/Button';
import { Service } from '@/types';
import { generateMetadata } from './metadata';

export { generateMetadata };

const services: Record<string, Service & { features: string[]; duration?: string; price?: string }> = {
  'hair-restoration': {
    id: 'hair-restoration',
    title: 'Hair Restoration',
    description: 'Comprehensive hair restoration treatments designed to help you regain natural, healthy hair. Our advanced techniques address various causes of hair loss and thinning.',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
    features: [
      'PRP (Platelet-Rich Plasma) Therapy',
      'Hair Scalp Analysis & Diagnosis',
      'Hair Loss Prevention Programs',
      'Nutritional Counseling',
      'Customized Treatment Plans',
      'Regular Progress Monitoring',
    ],
    duration: '60-90 minutes',
    price: 'Starting from $299',
  },
  'hair-transplantation': {
    id: 'hair-transplantation',
    title: 'Hair Transplantation',
    description: 'State-of-the-art hair transplantation using FUE (Follicular Unit Extraction) and FUT techniques. Experience permanent, natural-looking results from our expert surgeons.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200',
    features: [
      'FUE Hair Transplantation',
      'FUT Strip Method',
      'Advanced Grafting Techniques',
      'Minimal Scarring',
      'Natural Hairline Design',
      'Post-Transplant Care',
    ],
    duration: '4-8 hours',
    price: 'Starting from $2,999',
  },
  'hair-treatments': {
    id: 'hair-treatments',
    title: 'Hair Treatments',
    description: 'A wide range of professional hair care treatments to improve hair health, strength, and appearance. From deep conditioning to therapeutic scalp treatments.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b7d?w=1200',
    features: [
      'Scalp Detox Treatment',
      'Hair Strengthening Therapy',
      'Deep Conditioning Treatments',
      'Keratin Smoothing',
      'Hair Growth Stimulation',
      'Damage Repair Treatments',
    ],
    duration: '45-75 minutes',
    price: 'Starting from $149',
  },
  'skin-care': {
    id: 'skin-care',
    title: 'Professional Skin Care',
    description: 'Expert skincare treatments tailored to your skin type. Achieve radiant, healthy skin with our comprehensive facial and skin treatment programs.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200',
    features: [
      'Customized Facial Treatments',
      'Hydrating Facials',
      'Deep Cleansing',
      'Exfoliation & Peeling',
      'Skin Brightening',
      'Moisturizing Therapies',
    ],
    duration: '60-90 minutes',
    price: 'Starting from $179',
  },
  'acne-treatment': {
    id: 'acne-treatment',
    title: 'Acne Treatment',
    description: 'Effective acne treatment solutions for all skin types. Our dermatologists create personalized treatment plans to clear your skin and prevent future breakouts.',
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=1200',
    features: [
      'Acne Assessment & Diagnosis',
      'Topical Treatment Plans',
      'Chemical Peels for Acne',
      'Light Therapy',
      'Extraction Treatments',
      'Maintenance Programs',
    ],
    duration: '45-60 minutes',
    price: 'Starting from $199',
  },
  'anti-aging': {
    id: 'anti-aging',
    title: 'Anti-Aging Treatments',
    description: 'Revolutionary anti-aging solutions to restore youthfulness and combat signs of aging. From non-invasive treatments to advanced procedures.',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200',
    features: [
      'Botox Injections',
      'Dermal Fillers',
      'Thread Lifting',
      'RF Skin Tightening',
      'Microneedling',
      'Vitamin C Infusion',
    ],
    duration: '30-60 minutes',
    price: 'Starting from $399',
  },
  'pigmentation': {
    id: 'pigmentation',
    title: 'Pigmentation Treatment',
    description: 'Advanced solutions for hyperpigmentation, melasma, dark spots, and uneven skin tone. Restore your skin\'s natural radiance with targeted treatments.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200',
    features: [
      'Melasma Treatment',
      'Dark Spot Removal',
      'Chemical Peels',
      'Laser Pigmentation Removal',
      'Topical Lightening Agents',
      'Sun Protection Guidance',
    ],
    duration: '45-75 minutes',
    price: 'Starting from $249',
  },
  'hijama': {
    id: 'hijama',
    title: 'Hijama Therapy',
    description: 'Traditional cupping therapy (Hijama) for detoxification, pain relief, and overall wellness. A holistic approach to health and healing.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
    features: [
      'Wet Cupping (Hijama)',
      'Dry Cupping',
      'Pain Management',
      'Detoxification',
      'Stress Relief',
      'Improved Blood Circulation',
    ],
    duration: '30-45 minutes',
    price: 'Starting from $99',
  },
  'laser-therapy': {
    id: 'laser-therapy',
    title: 'Laser Therapy',
    description: 'Cutting-edge laser treatments for various skin and hair concerns. Safe, effective, and performed by certified laser specialists.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d4c09?w=1200',
    features: [
      'Laser Hair Removal',
      'Laser Skin Resurfacing',
      'Scar Reduction',
      'Tattoo Removal',
      'Vein Treatment',
      'Wrinkle Reduction',
    ],
    duration: '15-60 minutes',
    price: 'Starting from $299',
  },
  'prp-therapy': {
    id: 'prp-therapy',
    title: 'PRP Therapy',
    description: 'Platelet-Rich Plasma therapy to stimulate natural hair growth and improve hair density. A natural, non-surgical solution for hair restoration.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
    features: [
      'Blood Draw & Processing',
      'Platelet Concentration',
      'Micro-injections',
      'Hair Follicle Stimulation',
      'Natural Growth Factors',
      'Multiple Sessions Available',
    ],
    duration: '45-60 minutes',
    price: 'Starting from $349',
  },
  'scalp-treatment': {
    id: 'scalp-treatment',
    title: 'Scalp Treatment',
    description: 'Specialized scalp treatments for dandruff, psoriasis, seborrheic dermatitis, and other scalp conditions. Restore scalp health for better hair growth.',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200',
    features: [
      'Scalp Diagnosis',
      'Medicated Treatments',
      'Deep Cleansing',
      'Moisturizing Therapy',
      'Exfoliation',
      'Conditioning Treatments',
    ],
    duration: '45-75 minutes',
    price: 'Starting from $149',
  },
  'hair-thickening': {
    id: 'hair-thickening',
    title: 'Hair Thickening',
    description: 'Effective treatments to add volume and thickness to thinning or fine hair. Enhance your hair\'s natural appearance with our specialized programs.',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200',
    features: [
      'Volume Enhancement',
      'Hair Fiber Treatments',
      'Scalp Stimulation',
      'Nutritional Support',
      'Thickening Products',
      'Maintenance Programs',
    ],
    duration: '60-90 minutes',
    price: 'Starting from $199',
  },
};

export default function ServicePage({ params }: { params: { id: string } }) {
  const service = services[params.id];

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
