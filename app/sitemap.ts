import { MetadataRoute } from 'next';
import { getCMSData } from '@/lib/cms';

const baseUrl = 'https://drbaigsclinic.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cmsData = await getCMSData().catch(() => null);
  const services = cmsData?.services?.items || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...services
      .filter((s) => s.id)
      .map((service) => ({
        url: `${baseUrl}/services/${service.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
  ];
}
