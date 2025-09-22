'use client'

import { useState, useEffect } from 'react';
import { fetchAverageBlockTime, DEFAULT_BLOCK_TIME } from '@/lib/nproCalculations';

export function useBlockTime() {
  const [blockTime, setBlockTime] = useState<number>(DEFAULT_BLOCK_TIME);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlockTime() {
      setIsLoading(true);
      setError(null);

      try {
        const currentBlockTime = await fetchAverageBlockTime();
        setBlockTime(currentBlockTime);
      } catch (err) {
        console.error('Error fetching block time:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch block time');
        setBlockTime(DEFAULT_BLOCK_TIME);
      } finally {
        setIsLoading(false);
      }
    }

    loadBlockTime();
  }, []);

  return {
    blockTime,
    isLoading,
    error
  };
}