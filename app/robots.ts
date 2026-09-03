import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /api: not a page. /my-visits, /manage-appointment: patient-specific
      // forms with no distinct content per visitor — nothing here is worth
      // a crawler indexing. The admin/CMS path is deliberately NOT listed
      // here — it isn't linked from anywhere on the public site, and
      // listing it in robots.txt would just publish its location to anyone
      // who reads the file.
      disallow: ['/api/', '/my-visits', '/manage-appointment/'],
    },
    sitemap: 'https://drbaigsclinic.com/sitemap.xml',
  };
}
