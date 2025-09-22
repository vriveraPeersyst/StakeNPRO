'use client'

import { useQuery } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import { getNproEarned, NproEarnedData } from '@/lib/prices';

export function useEarnedNpro() {
  const { accountId, isConnected } = useWallet();

  const { data, isLoading, error, refetch } = useQuery<NproEarnedData | null>({
    queryKey: ['nproEarned', accountId],
    queryFn: () => getNproEarned(accountId!),
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes when visible
    refetchIntervalInBackground: false, // Don't refetch in background
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 2, // Retry failed requests up to 2 times
    enabled: isConnected && !!accountId,
  });

  // Extract the earned amount from the data
  const earnedNpro = data?.earned || '0';

  return {
    earnedNpro,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
}