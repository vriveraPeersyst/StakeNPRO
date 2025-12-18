'use client'

import { useState, useEffect } from 'react';
import { getTotalStakedBalance } from '@/lib/pool';
import { getNproComparison } from '@/lib/prices';

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
        console.error('Error fetching total staked balance from RPC:', err);
        
        // Try fallback from comparison API
        try {
          const comparisonData = await getNproComparison();
          if (comparisonData && comparisonData.totalStakedNear > 0) {
            // Convert NEAR amount to yoctoNEAR (24 decimals)
            const yoctoNear = BigInt(Math.floor(comparisonData.totalStakedNear * 1e6)) * BigInt(1e18);
            setTotalStaked(yoctoNear.toString());
            console.log('Using fallback total staked from comparison API:', comparisonData.totalStakedNear);
            return;
          }
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
        }
        
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
      console.error('Error fetching total staked balance from RPC:', err);
      
      // Try fallback from comparison API
      try {
        const comparisonData = await getNproComparison();
        if (comparisonData && comparisonData.totalStakedNear > 0) {
          // Convert NEAR amount to yoctoNEAR (24 decimals)
          const yoctoNear = BigInt(Math.floor(comparisonData.totalStakedNear * 1e6)) * BigInt(1e18);
          setTotalStaked(yoctoNear.toString());
          console.log('Using fallback total staked from comparison API:', comparisonData.totalStakedNear);
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
      
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