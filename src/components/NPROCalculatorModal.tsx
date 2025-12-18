'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Calendar, TrendingUp } from 'lucide-react';
import { 
  calculateTotalNproRewards, 
  formatNearAmount, 
  parseNearAmount,
  dateToEpochWithCurrentBlock,
  getCurrentEpoch,
  STAKING_END_DATE,
  BLOCKS_PER_EPOCH,
  getNproBondingCurveValue,
  NPRO_START_EPOCH
} from '@/lib/nproCalculations';
import BigNumber from 'bignumber.js';
import { formatNproAmount } from '@/lib/utils';
import { useBlockTime } from '@/hooks/useBlockTime';
import { useQuery } from '@tanstack/react-query';
import { getNproComparison } from '@/lib/prices';

interface NPROCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoolTotal?: string; // Current total staked in the pool
  userEarnedNpro?: string;   // User's already earned NPRO (if connected)
  userRheaBoost?: string;    // User's RHEA boost earned NPRO (if connected)
  userStakedBalance?: string; // User's current staked balance (if connected)
}

export default function NPROCalculatorModal({
  isOpen, 
  onClose,
  currentPoolTotal = '0',
  userEarnedNpro = '0',
  userRheaBoost = '0',
  userStakedBalance = '0'
}: NPROCalculatorModalProps) {
  const { blockTime } = useBlockTime();
  
  // Fetch NPRO price from comparison API
  const { data: comparisonData } = useQuery({
    queryKey: ['nproComparison'],
    queryFn: getNproComparison,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  
  // Default stake amount based on user's current stake or 100 NEAR
  const getDefaultStakeAmount = () => {
    if (userStakedBalance && userStakedBalance !== '0') {
      return formatNearAmount(userStakedBalance);
    }
    return '100';
  };
  
  const [stakeAmount, setStakeAmount] = useState(getDefaultStakeAmount());
  // Default to 1 year from now or staking end date, whichever is earlier
  const getDefaultEndDate = () => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow < STAKING_END_DATE ? oneYearFromNow : STAKING_END_DATE;
  };
  const [stakingEndDate, setStakingEndDate] = useState<Date>(getDefaultEndDate());
  const [calculatedRewards, setCalculatedRewards] = useState<BigNumber | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [endEpoch, setEndEpoch] = useState<number | null>(null);

  // Date range for the progress bar
  const minDate = new Date();
  const maxDate = STAKING_END_DATE;

  // NPRO release constants
  const MAX_EPOCH = 5859; // Maximum epoch for NPRO distribution

  // Bonding curve constants
  const R0 = 1892.824882239740;
  const LAMBDA = 0.00023664977144416;

  // Calculate approximate total NPRO using integral of bonding curve (fast)
  // Integral of R0 * e^(-λt) from a to b = R0/λ * (e^(-λa) - e^(-λb))
  const calculateCumulativeNpro = useCallback((fromEpoch: number, toEpoch: number) => {
    const a = fromEpoch - NPRO_START_EPOCH + 1;
    const b = toEpoch - NPRO_START_EPOCH + 2; // +2 because we want to include toEpoch
    return (R0 / LAMBDA) * (Math.exp(-LAMBDA * a) - Math.exp(-LAMBDA * b));
  }, [R0, LAMBDA]);

  // Calculate the NPRO percentage released at a given epoch
  const getEpochNproPercentage = useCallback((targetEpoch: number) => {
    // Total NPRO from epoch 1 to MAX_EPOCH
    const totalNpro = calculateCumulativeNpro(NPRO_START_EPOCH, MAX_EPOCH);
    // NPRO distributed from epoch 1 to target epoch
    const distributedNpro = calculateCumulativeNpro(NPRO_START_EPOCH, targetEpoch);
    // Calculate percentage
    return (distributedNpro / totalNpro) * 100;
  }, [calculateCumulativeNpro, MAX_EPOCH]);

  // Get current epoch percentage (memoized based on currentEpoch)
  const currentEpochPercentage = useMemo(() => {
    if (!currentEpoch) return 0;
    return getEpochNproPercentage(currentEpoch);
  }, [currentEpoch, getEpochNproPercentage]);

  // Get end epoch percentage
  const endEpochPercentage = useMemo(() => {
    if (!endEpoch) return currentEpochPercentage;
    return getEpochNproPercentage(endEpoch);
  }, [endEpoch, currentEpochPercentage, getEpochNproPercentage]);

  // Update stake amount when modal opens or user staked balance changes
  useEffect(() => {
    if (isOpen) {
      setStakeAmount(getDefaultStakeAmount());
    }
  }, [isOpen, userStakedBalance]);

  // Calculate rewards when inputs change
  const calculateRewards = useCallback(async () => {
    if (!blockTime) return; // Wait for block time to be loaded
    
    setIsCalculating(true);
    try {
      // Use the new block-based epoch calculation methods
      const current = await getCurrentEpoch();
      let end = await dateToEpochWithCurrentBlock(stakingEndDate, blockTime);
      
      // Ensure we don't exceed the maximum epoch
      end = Math.min(end, MAX_EPOCH);
      
      setCurrentEpoch(current);
      setEndEpoch(end);
      
      const stakeAmountWei = parseNearAmount(stakeAmount);
      const currentPoolWei = parseNearAmount(formatNearAmount(currentPoolTotal));
      
      // Always use current pool total + user's stake amount
      const finalPoolTotal = new BigNumber(currentPoolWei).plus(stakeAmountWei).toString();
      
      const rewards = calculateTotalNproRewards(
        stakeAmountWei,
        finalPoolTotal,
        current,
        end
      );
      
      setCalculatedRewards(rewards);
    } catch (error) {
      console.error('Error calculating rewards:', error);
      setCalculatedRewards(null);
      setCurrentEpoch(null);
      setEndEpoch(null);
    } finally {
      setIsCalculating(false);
    }
  }, [stakeAmount, stakingEndDate, blockTime, MAX_EPOCH, currentPoolTotal]);

  useEffect(() => {
    if (stakeAmount && currentPoolTotal && blockTime) {
      // Debounce the calculation to avoid too frequent updates
      const timeoutId = setTimeout(() => {
        calculateRewards();
      }, 150); // 150ms delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [calculateRewards]);

  // Handle NPRO percentage slider change (optimized)
  // The slider goes from currentEpochPercentage to 100%
  const handleNproSliderChange = useCallback((sliderValue: number) => {
    // sliderValue is 0-100 representing position on the slider
    // Map it to actual NPRO percentage (currentEpochPercentage to 100)
    const actualPercentage = currentEpochPercentage + (sliderValue / 100) * (100 - currentEpochPercentage);
    
    // Map percentage to date
    const ratio = sliderValue / 100;
    const totalMs = maxDate.getTime() - minDate.getTime();
    const selectedMs = minDate.getTime() + (totalMs * ratio);
    const targetDate = new Date(selectedMs);
    
    setStakingEndDate(targetDate);
  }, [currentEpochPercentage, minDate, maxDate]);

  // Get slider position (0-100) from date
  const getSliderPosition = useCallback(() => {
    const ratio = (stakingEndDate.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime());
    return Math.max(0, Math.min(100, ratio * 100));
  }, [stakingEndDate, minDate, maxDate]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate epochs until staking end using actual epoch numbers
  const epochsUntilEnd = currentEpoch && endEpoch ? Math.max(0, endEpoch - currentEpoch) : 0;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      style={{ overflow: 'hidden' }} // Prevent background scroll
    >
      <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl w-full max-w-[720px] max-h-[90vh] sm:max-h-[85vh] overflow-hidden mx-2 sm:mx-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#E5E5E5] bg-gradient-to-r from-[#F8F9FA] to-white flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
              <img 
                src="/icons/npro-token.png" 
                alt="NPRO" 
                className="w-7 h-7 sm:w-8 sm:h-8"
              />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#3F4246] font-sf">
                NPRO Rewards Calculator
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[#F6F6F6] rounded-full transition-colors touch-manipulation"
          >
            <X className="w-4 h-4 text-[#999999]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Input Row - Stack on mobile, side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Stake Amount Input */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#3F4246] font-sf">
                Stake Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="1400000"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-[#E5E5E5] rounded-[100px] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#5F8AFA] focus:border-transparent focus:bg-white transition-all font-sf text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none touch-manipulation"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm font-medium text-[#999999] font-sf">
                  NEAR
                </span>
              </div>
            </div>

            {/* Total Pool Amount Display (Read-only) */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#3F4246] font-sf">
                Total Pool Amount
              </label>
              <div className="relative">
                <div
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-[#E5E5E5] rounded-[100px] bg-[#F6F6F6] font-sf text-sm text-[#3F4246]"
                >
                  {formatNearAmount(currentPoolTotal)}
                </div>
                <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm font-medium text-[#999999] font-sf">
                  NEAR
                </span>
              </div>
            </div>
          </div>

          {/* Staking Duration Slider */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-xs sm:text-sm font-semibold text-[#3F4246] font-sf">
              Staking Duration
            </label>
            
            {/* NPRO Release Range Display */}
            <div className="flex items-center justify-between text-xs text-[#999999] font-sf">
              <span>{currentEpochPercentage.toFixed(1)}% NPRO Released</span>
              <span>100% NPRO Released</span>
            </div>

            {/* Progress Bar / Slider */}
            <div className="relative px-1 sm:px-2">
              <div className="h-4 sm:h-3 bg-[#F6F6F6] rounded-full overflow-hidden shadow-inner">
                {/* Staking period progress */}
                <div 
                  className="h-full bg-gradient-to-r from-[#5F8AFA] to-[#7B68EE]"
                  style={{ 
                    width: `${getSliderPosition()}%` 
                  }}
                />
              </div>
              
              {/* Slider Handle */}
              <input
                type="range"
                min="0"
                max="1824"
                step="1"
                value={Math.round((getSliderPosition() / 100) * 1824)}
                onChange={(e) => {
                  const stepValue = parseInt(e.target.value);
                  const percentageValue = (stepValue / 1824) * 100;
                  handleNproSliderChange(percentageValue);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer slider-optimized touch-manipulation"
                style={{ 
                  background: 'transparent',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              
              {/* Slider Thumb Visual */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 sm:w-5 sm:h-5 bg-white rounded-full shadow-lg pointer-events-none border-2 border-[#5F8AFA]"
                style={{ left: `${getSliderPosition()}%` }}
              />
            </div>

            {/* Selected Date Display */}
            <div className="flex items-center justify-between bg-[#F8F9FA] rounded-[12px] sm:rounded-[16px] p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#5F8AFA] rounded-full flex items-center justify-center">
                  <Calendar className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-[#3F4246] font-sf font-medium">
                  {formatDate(stakingEndDate)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm text-[#999999] font-sf">
                  {endEpoch ? `Epoch ${Math.min(endEpoch, MAX_EPOCH)}` : 'Calculating...'}
                  {endEpoch && endEpoch >= MAX_EPOCH && (
                    <span className="text-orange-600 font-medium"> (Max)</span>
                  )}
                </div>
                <div className="text-xs text-[#5F8AFA] font-sf font-medium">
                  {endEpochPercentage.toFixed(1)}% NPRO Released
                </div>
                {epochsUntilEnd > 0 && (
                  <div className="text-xs text-[#666666] font-sf">
                    +{Math.min(epochsUntilEnd, currentEpoch ? MAX_EPOCH - currentEpoch : 0)} epochs
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-[#F8F9FA] to-[#E5ECFE] rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#3F4246] font-sf text-sm sm:text-base">Estimated Rewards</h3>
              {comparisonData?.nproApyPercent && (
                <span className="font-sf text-sm sm:text-base font-medium bg-gradient-to-r from-blue-400 via-purple-500 via-pink-500 to-blue-400 bg-clip-text text-transparent animate-[gradient_3s_ease-in-out_infinite] bg-[length:300%_100%]">
                  APY: {comparisonData.nproApyPercent.toFixed(2)} %
                </span>
              )}
            </div>
            
            {isCalculating ? (
              <div className="flex items-center justify-center py-4 sm:py-6">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-[#5F8AFA] border-t-transparent"></div>
              </div>
            ) : calculatedRewards ? (
              <div className="space-y-2 sm:space-y-3">
                {(() => {
                  const totalNproFormatted = formatNproAmount(calculatedRewards.toString());
                  const nproPrice = comparisonData?.nproPriceUsd ?? 0;
                  const usdValue = parseFloat(totalNproFormatted.replace(/,/g, '')) * nproPrice;
                  
                  return (
                    <div className="flex flex-col items-center bg-gradient-to-r from-[#5F8AFA] to-[#7B68EE] rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 text-white">
                      <span className="font-medium font-sf text-sm sm:text-base mb-1">Total NPRO</span>
                      <span className="font-bold text-2xl sm:text-3xl font-sf">
                        {totalNproFormatted} NPRO
                      </span>
                      {nproPrice > 0 && (
                        <span className="font-medium text-sm sm:text-base text-white/80 mt-1">
                          ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 sm:py-6">
                <p className="text-xs sm:text-sm text-[#999999] font-sf text-center">
                  Enter valid amounts to see rewards
                </p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-[12px] sm:rounded-[16px] p-2.5 sm:p-3 mb-2">
            <div className="flex items-start gap-2">
              <span className="text-orange-500 text-sm">⚠️</span>
              <div>
                <p className="text-xs text-orange-700 font-sf leading-relaxed">
                  <strong>Disclaimer:</strong> Estimates based on bonding curve formula. 
                  Actual rewards may vary with network conditions and total staked amounts. 
                  NPRO distribution is limited to epoch {MAX_EPOCH} (September 15, 2030).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}