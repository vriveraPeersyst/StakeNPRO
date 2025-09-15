import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://staking.nearmobile.app' 
    : 'http://localhost:3000'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/terms', '/privacy'],
      disallow: ['/api/', '/_next/', '/.*'],
      crawlDelay: 1,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
