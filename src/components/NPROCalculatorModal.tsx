'use client'

import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, TrendingUp } from 'lucide-react';
import { 
  calculateTotalNproRewards, 
  formatNearAmount, 
  parseNearAmount,
  dateToEpochWithCurrentBlock,
  getCurrentEpoch,
  PRE_STAKING_END_DATE,
  STAKING_END_DATE,
  getEpochDuration,
  BLOCKS_PER_EPOCH
} from '@/lib/nproCalculations';
import BigNumber from 'bignumber.js';
import { formatNproAmount } from '@/lib/utils';
import { useBlockTime } from '@/hooks/useBlockTime';

interface NPROCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoolTotal?: string; // Current total staked in the pool
  userEarnedNpro?: string;   // User's already earned NPRO (if connected)
  userStakedBalance?: string; // User's current staked balance (if connected)
}

export default function NPROCalculatorModal({
  isOpen, 
  onClose,
  currentPoolTotal = '0',
  userEarnedNpro = '0',
  userStakedBalance = '0'
}: NPROCalculatorModalProps) {
  const { blockTime } = useBlockTime();
  // Default stake amount based on user's current stake or 100 NEAR
  const getDefaultStakeAmount = () => {
    if (userStakedBalance && userStakedBalance !== '0') {
      return formatNearAmount(userStakedBalance);
    }
    return '100';
  };
  
  const [stakeAmount, setStakeAmount] = useState(getDefaultStakeAmount());
  const [totalPoolAmount, setTotalPoolAmount] = useState(() => {
    const currentTotal = formatNearAmount(currentPoolTotal);
    return currentTotal === '0' ? '' : currentTotal;
  });
  const [stakingEndDate, setStakingEndDate] = useState<Date>(PRE_STAKING_END_DATE);
  const [calculatedRewards, setCalculatedRewards] = useState<BigNumber | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [endEpoch, setEndEpoch] = useState<number | null>(null);

  // Date range for the progress bar
  const minDate = new Date();
  const maxDate = STAKING_END_DATE;
  const preStakingEnd = PRE_STAKING_END_DATE;

  // NPRO release constants
  const PRE_STAKING_NPRO_PERCENTAGE = 8.33; // 8.33% released at pre-staking end
  const TOTAL_NPRO_PERCENTAGE = 100; // 100% released at final end
  const MAX_EPOCH = 5859; // Maximum epoch for NPRO distribution

  // Update pool total when prop changes
  useEffect(() => {
    const formattedTotal = formatNearAmount(currentPoolTotal);
    // Only update if we have a meaningful value and it's different from current
    if (formattedTotal !== '0' && formattedTotal !== totalPoolAmount) {
      setTotalPoolAmount(formattedTotal);
    }
  }, [currentPoolTotal]);

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
      const userStakeWei = parseNearAmount(stakeAmount);
      
      // If user's stake amount is larger than current pool, add it to the pool
      // Otherwise use the manually entered pool amount
      let finalPoolTotal: string;
      if (new BigNumber(userStakeWei).isGreaterThan(currentPoolWei)) {
        finalPoolTotal = new BigNumber(currentPoolWei).plus(userStakeWei).toString();
        // Update the display to show the adjusted total
        setTotalPoolAmount(formatNearAmount(finalPoolTotal));
      } else {
        finalPoolTotal = parseNearAmount(totalPoolAmount);
      }
      
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
  }, [stakeAmount, totalPoolAmount, stakingEndDate, blockTime, MAX_EPOCH, currentPoolTotal]);

  useEffect(() => {
    if (stakeAmount && totalPoolAmount && blockTime) {
      // Debounce the calculation to avoid too frequent updates
      const timeoutId = setTimeout(() => {
        calculateRewards();
      }, 150); // 150ms delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [calculateRewards]);

  // Handle NPRO percentage slider change (optimized)
  const handleNproSliderChange = useCallback((value: number) => {
    // Map NPRO percentage to time
    let targetDate: Date;
    
    if (value <= PRE_STAKING_NPRO_PERCENTAGE) {
      // Linear interpolation from current date to pre-staking end
      const ratio = value / PRE_STAKING_NPRO_PERCENTAGE;
      const totalMs = preStakingEnd.getTime() - minDate.getTime();
      const selectedMs = minDate.getTime() + (totalMs * ratio);
      targetDate = new Date(selectedMs);
    } else {
      // Linear interpolation from pre-staking end to final end
      const ratio = (value - PRE_STAKING_NPRO_PERCENTAGE) / (TOTAL_NPRO_PERCENTAGE - PRE_STAKING_NPRO_PERCENTAGE);
      const totalMs = maxDate.getTime() - preStakingEnd.getTime();
      const selectedMs = preStakingEnd.getTime() + (totalMs * ratio);
      targetDate = new Date(selectedMs);
    }
    
    setStakingEndDate(targetDate);
  }, [PRE_STAKING_NPRO_PERCENTAGE, TOTAL_NPRO_PERCENTAGE, preStakingEnd, minDate, maxDate]);

  // Get NPRO percentage from date (memoized)
  const getNproPercentage = useCallback(() => {
    if (stakingEndDate <= preStakingEnd) {
      // Linear mapping from current date to pre-staking end = 0% to 8.33%
      const ratio = (stakingEndDate.getTime() - minDate.getTime()) / (preStakingEnd.getTime() - minDate.getTime());
      return Math.max(0, Math.min(PRE_STAKING_NPRO_PERCENTAGE, ratio * PRE_STAKING_NPRO_PERCENTAGE));
    } else {
      // Linear mapping from pre-staking end to final end = 8.33% to 100%
      const ratio = (stakingEndDate.getTime() - preStakingEnd.getTime()) / (maxDate.getTime() - preStakingEnd.getTime());
      return PRE_STAKING_NPRO_PERCENTAGE + (ratio * (TOTAL_NPRO_PERCENTAGE - PRE_STAKING_NPRO_PERCENTAGE));
    }
  }, [stakingEndDate, preStakingEnd, minDate, maxDate, PRE_STAKING_NPRO_PERCENTAGE, TOTAL_NPRO_PERCENTAGE]);

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
                src="/icons/npro-token.svg" 
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
          {/* User's Already Earned NPRO */}
          {parseFloat(userEarnedNpro) > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-[16px] sm:rounded-[20px] p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className="font-medium text-green-800 font-sf text-xs sm:text-sm">Already Earned</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-green-900 font-sf">
                {formatNproAmount(userEarnedNpro)} NPRO
              </p>
            </div>
          )}

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

            {/* Total Pool Amount Input */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#3F4246] font-sf">
                Total Pool Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={totalPoolAmount}
                  onChange={(e) => setTotalPoolAmount(e.target.value)}
                  placeholder={`Current pool: ${formatNearAmount(currentPoolTotal)} NEAR`}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-[#E5E5E5] rounded-[100px] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#5F8AFA] focus:border-transparent focus:bg-white transition-all font-sf text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none touch-manipulation"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm font-medium text-[#999999] font-sf">
                  NEAR
                </span>
              </div>
              <p className="text-xs text-[#999999] font-sf">
                Current: {formatNearAmount(currentPoolTotal)} NEAR
                {parseFloat(stakeAmount) > 0 && parseFloat(stakeAmount) > parseFloat(formatNearAmount(currentPoolTotal)) && (
                  <span className="text-blue-600 font-medium"> → Adjusted to {totalPoolAmount} NEAR</span>
                )}
              </p>
            </div>
          </div>

          {/* Staking Duration Slider */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-xs sm:text-sm font-semibold text-[#3F4246] font-sf">
              Staking Duration
            </label>
            
            {/* NPRO Release Range Display */}
            <div className="flex items-center justify-between text-xs text-[#999999] font-sf">
              <span>0% NPRO Released</span>
              <span>100% NPRO Released</span>
            </div>

            {/* Progress Bar / Slider */}
            <div className="relative px-1 sm:px-2">
              <div className="h-4 sm:h-3 bg-[#F6F6F6] rounded-full overflow-hidden shadow-inner">
                {/* Pre-staking period (0% to 8.33%) */}
                <div 
                  className="h-full bg-gradient-to-r from-[#5F8AFA] to-[#7B68EE]"
                  style={{ 
                    width: `${Math.min(getNproPercentage(), PRE_STAKING_NPRO_PERCENTAGE)}%` 
                  }}
                />
                {/* Regular staking period (8.33% to 100%) */}
                {getNproPercentage() > PRE_STAKING_NPRO_PERCENTAGE && (
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 absolute top-0"
                    style={{ 
                      left: `${PRE_STAKING_NPRO_PERCENTAGE}%`,
                      width: `${getNproPercentage() - PRE_STAKING_NPRO_PERCENTAGE}%` 
                    }}
                  />
                )}
              </div>
              
              {/* Slider Handle */}
              <input
                type="range"
                min="0"
                max="1824"
                step="1"
                value={Math.round((getNproPercentage() / 100) * 1824)}
                onChange={(e) => {
                  const stepValue = parseInt(e.target.value);
                  const percentageValue = (stepValue / 1824) * 100;
                  // Add snap-to functionality for pre-staking end date (8.33%)
                  const snapThreshold = 0.5; // 0.5% tolerance
                  const snappedValue = Math.abs(percentageValue - PRE_STAKING_NPRO_PERCENTAGE) <= snapThreshold 
                    ? PRE_STAKING_NPRO_PERCENTAGE 
                    : percentageValue;
                  handleNproSliderChange(snappedValue);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer slider-optimized touch-manipulation"
                style={{ 
                  background: 'transparent',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              
              {/* Pre-staking End Marker */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 sm:w-4 sm:h-4 bg-orange-400 rounded-full cursor-pointer hover:bg-orange-500 active:bg-orange-600 transition-colors z-10 flex items-center justify-center touch-manipulation"
                style={{ left: `${PRE_STAKING_NPRO_PERCENTAGE}%` }}
                onClick={() => handleNproSliderChange(PRE_STAKING_NPRO_PERCENTAGE)}
                title="Click to set to pre-staking end date"
              >
                <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              </div>
              
              {/* Slider Thumb Visual */}
              <div 
                className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 sm:w-5 sm:h-5 bg-white rounded-full shadow-lg pointer-events-none ${
                  Math.abs(getNproPercentage() - PRE_STAKING_NPRO_PERCENTAGE) < 0.1 
                    ? 'border-2 border-orange-400' 
                    : 'border-2 border-[#5F8AFA]'
                }`}
                style={{ left: `${getNproPercentage()}%` }}
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
                {Math.abs(getNproPercentage() - PRE_STAKING_NPRO_PERCENTAGE) < 0.1 && (
                  <span className="text-xs text-orange-600 font-sf font-medium hidden sm:inline">
                    • Pre-staking ends
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm text-[#999999] font-sf">
                  {endEpoch ? `Epoch ${Math.min(endEpoch, MAX_EPOCH)}` : 'Calculating...'}
                  {endEpoch && endEpoch >= MAX_EPOCH && (
                    <span className="text-orange-600 font-medium"> (Max)</span>
                  )}
                </div>
                <div className="text-xs text-[#5F8AFA] font-sf font-medium">
                  {getNproPercentage().toFixed(1)}% NPRO Released
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
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-[#3F4246] font-sf text-sm sm:text-base">Estimated Rewards</h3>
            </div>
            
            {isCalculating ? (
              <div className="flex items-center justify-center py-4 sm:py-6">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-[#5F8AFA] border-t-transparent"></div>
              </div>
            ) : calculatedRewards ? (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center bg-white rounded-[12px] sm:rounded-[16px] p-2.5 sm:p-3">
                  <span className="text-xs sm:text-sm text-[#999999] font-sf">New NPRO Rewards:</span>
                  <span className="font-bold text-base sm:text-lg text-[#5F8AFA] font-sf">
                    {formatNproAmount(calculatedRewards.toString())} NPRO
                  </span>
                </div>
                
                {parseFloat(userEarnedNpro) > 0 && (
                  <>
                    <div className="flex justify-between items-center bg-green-50 rounded-[12px] sm:rounded-[16px] p-2.5 sm:p-3">
                      <span className="text-xs sm:text-sm text-green-700 font-sf">Already Earned:</span>
                      <span className="font-semibold text-green-600 font-sf text-sm sm:text-base">
                        {formatNproAmount(userEarnedNpro)} NPRO
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-[#5F8AFA] to-[#7B68EE] rounded-[12px] sm:rounded-[16px] p-2.5 sm:p-3 text-white">
                      <span className="font-medium font-sf text-sm sm:text-base">Total NPRO:</span>
                      <span className="font-bold text-lg sm:text-xl font-sf">
                        {formatNproAmount(calculatedRewards.plus(userEarnedNpro).toString())} NPRO
                      </span>
                    </div>
                  </>
                )}
                
                <div className="bg-blue-50 rounded-[10px] sm:rounded-[12px] p-2 sm:p-2.5">
                  <p className="text-xs text-blue-700 font-sf">
                    {stakingEndDate <= preStakingEnd ? 
                      "🚀 Pre-staking period offers higher rewards!" :
                      "📈 Includes pre-staking + regular staking rewards"
                    }
                  </p>
                </div>
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