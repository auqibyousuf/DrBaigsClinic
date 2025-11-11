import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const services: Record<string, { title: string; description: string }> = {
  'hair-restoration': {
    title: 'Hair Restoration',
    description: 'Advanced hair restoration treatments to help you regain confidence with natural-looking results.',
  },
  'hair-transplantation': {
    title: 'Hair Transplantation',
    description: 'State-of-the-art FUE and FUT hair transplantation techniques for permanent hair restoration.',
  },
  'hair-treatments': {
    title: 'Hair Treatments',
    description: 'Comprehensive hair care solutions including PRP therapy, scalp treatments, and hair loss prevention.',
  },
  'skin-care': {
    title: 'Professional Skin Care',
    description: 'Expert skincare treatments tailored to your skin type. Achieve radiant, healthy skin.',
  },
  'acne-treatment': {
    title: 'Acne Treatment',
    description: 'Effective acne treatment solutions for all skin types with personalized treatment plans.',
  },
  'anti-aging': {
    title: 'Anti-Aging Treatments',
    description: 'Revolutionary anti-aging solutions to restore youthfulness and combat signs of aging.',
  },
  'pigmentation': {
    title: 'Pigmentation Treatment',
    description: 'Advanced solutions for hyperpigmentation, melasma, dark spots, and uneven skin tone.',
  },
  'hijama': {
    title: 'Hijama Therapy',
    description: 'Traditional cupping therapy for detoxification, pain relief, and overall wellness.',
  },
  'laser-therapy': {
    title: 'Laser Therapy',
    description: 'Cutting-edge laser treatments for various skin and hair concerns.',
  },
  'prp-therapy': {
    title: 'PRP Therapy',
    description: 'Platelet-Rich Plasma therapy to stimulate natural hair growth and improve hair density.',
  },
  'scalp-treatment': {
    title: 'Scalp Treatment',
    description: 'Specialized scalp treatments for dandruff, psoriasis, and other scalp conditions.',
  },
  'hair-thickening': {
    title: 'Hair Thickening',
    description: 'Effective treatments to add volume and thickness to thinning or fine hair.',
  },
};

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const service = services[params.id];

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: service.title,
    description: service.description,
    openGraph: {
      title: `${service.title} | Dr Baigs's Clinic`,
      description: service.description,
      type: 'website',
    },
  };
}
