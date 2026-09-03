import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /admin: CMS. /api: not a page. /my-visits, /manage-appointment:
      // patient-specific forms with no distinct content per visitor —
      // nothing here is worth a crawler indexing.
      disallow: ['/api/', '/admin/', '/my-visits', '/manage-appointment/'],
    },
    sitemap: 'https://drbaigsclinic.com/sitemap.xml',
  };
}
