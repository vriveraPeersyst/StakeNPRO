/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_NETWORK_ID: process.env.NEXT_PUBLIC_NETWORK_ID || 'mainnet',
    NEXT_PUBLIC_POOL_ID: process.env.NEXT_PUBLIC_POOL_ID || 'npro.poolv1.near',
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.mainnet.near.org',
    NEXT_PUBLIC_RPC_FALLBACKS: process.env.NEXT_PUBLIC_RPC_FALLBACKS || 'https://near.lava.build,https://near.blockpi.network/v1/rpc/public',
    NEXT_PUBLIC_EXPLORER_BASE: process.env.NEXT_PUBLIC_EXPLORER_BASE || 'https://nearblocks.io',
    NEXT_PUBLIC_SHOW_FIAT: process.env.NEXT_PUBLIC_SHOW_FIAT || 'true',
    NEXT_PUBLIC_SHOW_APR: process.env.NEXT_PUBLIC_SHOW_APR || 'false',
  },
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'near-api-js'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ]
  },
}

export default nextConfig
