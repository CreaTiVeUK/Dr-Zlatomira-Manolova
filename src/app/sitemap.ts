import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://zlatipediatrics.com';
    // Use static dates — new Date() causes every page to appear modified on every build
    const now = new Date('2026-04-07');
    const evergreen = new Date('2025-10-01');

    return [
        { url: baseUrl,                              lastModified: now,      changeFrequency: 'weekly',  priority: 1.0 },
        { url: `${baseUrl}/about`,                   lastModified: now,      changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/services`,                lastModified: now,      changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/services/allergy`,        lastModified: now,      changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/services/newborn`,        lastModified: now,      changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/conditions`,              lastModified: now,      changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/resources`,               lastModified: now,      changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/contact`,                 lastModified: evergreen, changeFrequency: 'yearly', priority: 0.9 },
        { url: `${baseUrl}/book`,                    lastModified: now,      changeFrequency: 'weekly',  priority: 0.9 },
    ];
}
