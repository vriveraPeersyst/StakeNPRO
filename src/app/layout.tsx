import { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://staking.nearmobile.app' : 'http://localhost:3000'),
  title: {
    default: 'NPRO Stake - Stake NEAR & Earn NPRO Tokens | Official NEAR Mobile Validator',
    template: '%s | NPRO Stake'
  },
  description: 'Stake NEAR Protocol tokens with the official NEAR Mobile validator and earn NPRO rewards. Secure, transparent, and high-yield staking on NEAR blockchain.',
  keywords: [
    'NEAR staking',
    'NPRO token', 
    'NEAR validator',
    'blockchain staking',
    'DeFi yield',
    'NEAR Mobile',
    'cryptocurrency staking',
    'NEAR Protocol',
    'staking rewards',
    'liquid staking'
  ],
  authors: [{ name: 'NEAR Mobile' }],
  creator: 'NEAR Mobile',
  publisher: 'NEAR Mobile',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/npro.ico' },
      { url: '/icons/app-icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/npro3dicon.png',
  },
  openGraph: {
    title: 'NPRO Stake - Stake NEAR & Earn NPRO Tokens',
    description: 'Stake NEAR Protocol tokens with the official NEAR Mobile validator and earn NPRO rewards. Secure, transparent, and high-yield staking.',
    url: '/',
    siteName: 'NPRO Stake',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/StakeNPRO.png',
        width: 1200,
        height: 630,
        alt: 'NPRO Stake - Official NEAR Mobile Validator for Staking NEAR Tokens',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@NEARMobile',
    creator: '@NEARMobile',
    title: 'NPRO Stake - Stake NEAR & Earn NPRO Tokens',
    description: 'Stake NEAR Protocol tokens with the official NEAR Mobile validator and earn NPRO rewards. Secure, transparent, and high-yield staking.',
    images: {
      url: '/StakeNPRO.png',
      alt: 'NPRO Stake - Official NEAR Mobile Validator',
    },
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://staking.nearmobile.app/#website",
        "name": "NPRO Stake",
        "description": "Stake NEAR Protocol tokens with the official NEAR Mobile validator and earn NPRO rewards",
        "url": "https://staking.nearmobile.app",
        "inLanguage": "en-US",
        "publisher": {
          "@id": "https://staking.nearmobile.app/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://staking.nearmobile.app/#organization",
        "name": "NEAR Mobile",
        "url": "https://nearmobile.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://staking.nearmobile.app/icons/npro3dicon.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://twitter.com/NEARMobile"
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://staking.nearmobile.app/#webpage",
        "url": "https://staking.nearmobile.app",
        "name": "NPRO Stake - Stake NEAR & Earn NPRO Tokens",
        "description": "Stake NEAR Protocol tokens with the official NEAR Mobile validator and earn NPRO rewards. Secure, transparent, and high-yield staking.",
        "isPartOf": {
          "@id": "https://staking.nearmobile.app/#website"
        },
        "inLanguage": "en-US",
        "mainEntity": {
          "@type": "SoftwareApplication",
          "name": "NPRO Stake",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "description": "DeFi staking platform for NEAR Protocol tokens",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }
      }
    ]
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#00D2FF" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NPRO Stake" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
