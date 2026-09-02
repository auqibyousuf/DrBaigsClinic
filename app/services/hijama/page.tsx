import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Hijama Therapy',
  description: 'Traditional cupping therapy for detoxification, pain relief, and overall wellness. Certified practitioners.',
  keywords: ['hijama', 'cupping therapy', 'traditional medicine', 'detoxification', 'pain relief'],
};

export default function HijamaPage() {
  // Redirect to the dynamic service page
  redirect('/services/hijama');
}
