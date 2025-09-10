import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Metadata } from 'next'
import './globals.css'
import { RpcStatus } from '@/components/RpcStatus'

export const metadata: Metadata = {
  title: 'NPRO Stake - Stake NEAR. Earn NPRO now.',
  description: 'Stake NEAR tokens to the NPRO validator and earn NPRO rewards',
  icons: {
    icon: '/npro.ico',
  },
  openGraph: {
    title: 'NPRO Stake - Stake NEAR. Earn NPRO now.',
    description: 'Stake NEAR tokens to the NPRO validator and earn NPRO rewards',
    images: [
      {
        url: '/StakeNPRO.png',
        width: 1200,
        height: 630,
        alt: 'NPRO Stake - Stake NEAR tokens and earn NPRO rewards',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NPRO Stake - Stake NEAR. Earn NPRO now.',
    description: 'Stake NEAR tokens to the NPRO validator and earn NPRO rewards',
    images: ['/StakeNPRO.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <html lang="en">
      <head>
        <title>NPRO Stake - Stake NEAR. Earn NPRO now.</title>
        <meta name="description" content="Stake NEAR tokens to the NPRO validator and earn NPRO rewards" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <RpcStatus />
        </QueryClientProvider>
      </body>
    </html>
  )
}
