import { Metadata } from 'next';
import Link from 'next/link';
import Section from '@/components/Section';
import Button from '@/components/Button';
import Card from '@/components/Card';

export const metadata: Metadata = {
  title: 'Skin Care Services',
  description: 'Professional skincare services including facials, acne treatment, anti-aging, pigmentation treatment, and more.',
  keywords: ['skin care', 'acne treatment', 'anti-aging', 'pigmentation', 'facial treatment'],
};

const skinServices = [
  {
    id: 'skin-care',
    title: 'Professional Skin Care',
    description: 'Expert skincare treatments tailored to your skin type. Achieve radiant, healthy skin.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
  },
  {
    id: 'acne-treatment',
    title: 'Acne Treatment',
    description: 'Effective acne treatment solutions for all skin types with personalized treatment plans.',
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800',
  },
  {
    id: 'anti-aging',
    title: 'Anti-Aging Treatments',
    description: 'Revolutionary anti-aging solutions to restore youthfulness and combat signs of aging.',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
  },
  {
    id: 'pigmentation',
    title: 'Pigmentation Treatment',
    description: 'Advanced solutions for hyperpigmentation, melasma, dark spots, and uneven skin tone.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
  },
  {
    id: 'facial-treatments',
    title: 'Facial Treatments',
    description: 'Luxurious facial treatments including deep cleansing, hydrating, and rejuvenating facials.',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
  },
  {
    id: 'chemical-peels',
    title: 'Chemical Peels',
    description: 'Professional chemical peels for skin renewal, acne treatment, and pigmentation correction.',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
  },
  {
    id: 'microdermabrasion',
    title: 'Microdermabrasion',
    description: 'Gentle exfoliation treatment to improve skin texture, tone, and reduce fine lines.',
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800',
  },
  {
    id: 'botox-fillers',
    title: 'Botox & Fillers',
    description: 'Expert injectables for wrinkle reduction, lip enhancement, and facial contouring.',
    image: 'https://images.unsplash.com/photo-1631570539943-8b361685ad81?w=800',
  },
];

export default function SkinServicesPage() {
  return (
    <>
      <section className="pt-24 pb-16 bg-gradient-to-br from-accent-600 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Skin Care Services</h1>
            <p className="text-xl md:text-2xl leading-relaxed opacity-90">
              Comprehensive skincare solutions for radiant, healthy skin. From basic care to advanced treatments,
              we have everything you need.
            </p>
          </div>
        </div>
      </section>

      <Section
        title="Our Skin Services"
        subtitle="Expert treatments for all skin types"
        className="bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skinServices.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`}>
              <Card
                title={service.title}
                description={service.description}
                image={service.image}
              >
                <Button variant="outline" size="sm" className="w-full">
                  Learn More
                </Button>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="Our Approach to Skin Care"
        subtitle="Science-backed treatments for beautiful results"
        className="bg-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Diagnostics</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use advanced skin analysis technology to assess your skin condition, identify concerns,
              and create personalized treatment plans.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Customized Solutions</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every treatment is tailored to your unique skin type, concerns, and goals. No one-size-fits-all
              approach here.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Care</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our certified dermatologists and aestheticians bring years of experience and the latest techniques
              to every treatment.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Results-Driven</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We focus on delivering visible, lasting results while maintaining the highest standards of safety
              and care.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="contact"
        title="Transform Your Skin Today"
        subtitle="Book your consultation"
        className="bg-gradient-to-br from-accent-600 to-primary-600 text-white"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl mb-8">
            Start your journey to radiant, healthy skin. Our experts are ready to help you achieve your skincare goals.
          </p>
          <Button href="/#contact" variant="secondary" size="lg" className="bg-white text-accent-600 hover:bg-gray-100">
            Book Appointment
          </Button>
        </div>
      </Section>
    </>
  );
}

