'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { RpcStatus } from './RpcStatus'

export function Providers({ children }: { children: React.ReactNode }) {
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
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Desktop RPC Status - hidden on mobile since it's in the navbar burger menu */}
      <div className="hidden lg:block">
        <RpcStatus isMobile={false} />
      </div>
    </QueryClientProvider>
  )
}
