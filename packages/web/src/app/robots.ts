import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/settings/', '/documents/', '/emergency-access/'],
      },
    ],
    sitemap: 'https://legacyshield.eu/sitemap.xml',
    // llms.txt: https://legacyshield.eu/llms.txt
  };
}
