import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Section from '@/components/Section';
import Button from '@/components/Button';
import Card from '@/components/Card';

export const metadata: Metadata = {
  title: 'Hair Care Services',
  description: 'Comprehensive hair care services including restoration, transplantation, PRP therapy, scalp treatments, and more.',
  keywords: ['hair restoration', 'hair transplantation', 'PRP therapy', 'hair loss treatment', 'scalp treatment'],
};

const hairServices = [
  {
    id: 'hair-restoration',
    title: 'Hair Restoration',
    description: 'Advanced hair restoration treatments to help you regain confidence with natural-looking results.',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  },
  {
    id: 'hair-transplantation',
    title: 'Hair Transplantation',
    description: 'State-of-the-art FUE and FUT hair transplantation techniques for permanent hair restoration.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
  },
  {
    id: 'hair-treatments',
    title: 'Hair Treatments',
    description: 'Comprehensive hair care solutions including PRP therapy, scalp treatments, and hair loss prevention.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b7d?w=800',
  },
  {
    id: 'prp-therapy',
    title: 'PRP Therapy',
    description: 'Platelet-Rich Plasma therapy to stimulate natural hair growth and improve hair density.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
  },
  {
    id: 'scalp-treatment',
    title: 'Scalp Treatment',
    description: 'Specialized scalp treatments for dandruff, psoriasis, and other scalp conditions.',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800',
  },
  {
    id: 'hair-thickening',
    title: 'Hair Thickening',
    description: 'Effective treatments to add volume and thickness to thinning or fine hair.',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
  },
];

export default function HairServicesPage() {
  return (
    <>
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Hair Care Services</h1>
            <p className="text-xl md:text-2xl leading-relaxed opacity-90">
              Comprehensive solutions for all your hair care needs. From restoration to transplantation,
              we help you achieve healthy, beautiful hair.
            </p>
          </div>
        </div>
      </section>

      <Section
        title="Our Hair Services"
        subtitle="Expert treatments tailored to your needs"
        className="bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hairServices.map((service) => (
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
        title="Why Choose Our Hair Services?"
        subtitle="Experience the difference"
        className="bg-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Expert Trichologists</h3>
            <p className="text-gray-600">
              Board-certified hair specialists with years of experience in treating various hair conditions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Latest Technology</h3>
            <p className="text-gray-600">
              State-of-the-art equipment and innovative techniques for the best possible results.
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Personalized Care</h3>
            <p className="text-gray-600">
              Customized treatment plans designed specifically for your hair type and condition.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="contact"
        title="Ready to Transform Your Hair?"
        subtitle="Book your consultation today"
        className="bg-gradient-to-br from-primary-600 to-accent-600 text-white"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl mb-8">
            Schedule a consultation with our hair specialists and discover the best treatment options for you.
          </p>
          <Button href="/#contact" variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
            Book Appointment
          </Button>
        </div>
      </Section>
    </>
  );
}

