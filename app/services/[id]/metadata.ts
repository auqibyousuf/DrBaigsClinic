import { Metadata } from 'next';
import { getCMSServices } from '@/lib/cms-server';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const services = await getCMSServices();
  const service = services?.items?.find((item: { id: string }) => item.id === params.id);

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
