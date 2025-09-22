'use client'

import { useState, useEffect } from 'react';
import { getTotalStakedBalance } from '@/lib/pool';

export function useTotalStaked() {
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTotalStaked() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getTotalStakedBalance();
        setTotalStaked(result);
      } catch (err) {
        console.error('Error fetching total staked balance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch total staked balance');
        setTotalStaked('0');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTotalStaked();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getTotalStakedBalance();
      setTotalStaked(result);
    } catch (err) {
      console.error('Error fetching total staked balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch total staked balance');
      setTotalStaked('0');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    totalStaked,
    isLoading,
    error,
    refetch
  };
}