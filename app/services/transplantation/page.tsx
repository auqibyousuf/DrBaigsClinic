import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Hair Transplantation',
  description: 'State-of-the-art FUE and FUT hair transplantation techniques for permanent hair restoration. Expert surgical team.',
  keywords: ['hair transplant', 'FUE', 'FUT', 'hair restoration surgery', 'hair transplant clinic'],
};

export default function TransplantationPage() {
  // Redirect to the dynamic service page
  redirect('/services/hair-transplantation');
}
