import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://orquestado.com.ar';
  return [
    { url: `${base}/es`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/en`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}