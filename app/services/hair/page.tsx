import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Hair Care Services',
  description: 'Comprehensive hair care services including restoration, transplantation, PRP therapy, scalp treatments, and more.',
  keywords: ['hair restoration', 'hair transplantation', 'PRP therapy', 'hair loss treatment', 'scalp treatment'],
};

export default function HairServicesPage() {
  // Redirect to services section on homepage
  redirect('/#services');
}
