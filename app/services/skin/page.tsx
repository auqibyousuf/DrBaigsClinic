import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Skin Care Services',
  description: 'Professional skincare services including facials, acne treatment, anti-aging, pigmentation treatment, and more.',
  keywords: ['skin care', 'acne treatment', 'anti-aging', 'pigmentation', 'facial treatment'],
};

export default function SkinServicesPage() {
  // Redirect to services section on homepage
  redirect('/#services');
}
