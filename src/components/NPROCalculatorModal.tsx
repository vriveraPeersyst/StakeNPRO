'use client'

import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, TrendingUp } from 'lucide-react';
import { 
  calculateTotalNproRewards, 
  formatNearAmount, 
  parseNearAmount,
  dateToEpoch,
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
  const [totalPoolAmount, setTotalPoolAmount] = useState(formatNearAmount(currentPoolTotal));
  const [stakingEndDate, setStakingEndDate] = useState<Date>(PRE_STAKING_END_DATE);
  const [calculatedRewards, setCalculatedRewards] = useState<BigNumber | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Date range for the progress bar
  const minDate = new Date();
  const maxDate = STAKING_END_DATE;
  const preStakingEnd = PRE_STAKING_END_DATE;

  // Update pool total when prop changes
  useEffect(() => {
    setTotalPoolAmount(formatNearAmount(currentPoolTotal));
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
      const currentDate = new Date();
      const currentEpoch = dateToEpoch(currentDate, blockTime);
      const endEpoch = dateToEpoch(stakingEndDate, blockTime);
      
      const stakeAmountWei = parseNearAmount(stakeAmount);
      const poolTotalWei = parseNearAmount(totalPoolAmount);
      
      const rewards = calculateTotalNproRewards(
        stakeAmountWei,
        poolTotalWei,
        currentEpoch,
        endEpoch
      );
      
      setCalculatedRewards(rewards);
    } catch (error) {
      console.error('Error calculating rewards:', error);
      setCalculatedRewards(null);
    } finally {
      setIsCalculating(false);
    }
  }, [stakeAmount, totalPoolAmount, stakingEndDate, blockTime]);

  useEffect(() => {
    if (stakeAmount && totalPoolAmount && blockTime) {
      calculateRewards();
    }
  }, [calculateRewards]);

  // NPRO release constants
  const PRE_STAKING_NPRO_PERCENTAGE = 8.33; // 8.33% released at pre-staking end
  const TOTAL_NPRO_PERCENTAGE = 100; // 100% released at final end

  // Handle NPRO percentage slider change
  const handleNproSliderChange = (value: number) => {
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
  };

  // Get NPRO percentage from date
  const getNproPercentage = () => {
    if (stakingEndDate <= preStakingEnd) {
      // Linear mapping from current date to pre-staking end = 0% to 8.33%
      const ratio = (stakingEndDate.getTime() - minDate.getTime()) / (preStakingEnd.getTime() - minDate.getTime());
      return Math.max(0, Math.min(PRE_STAKING_NPRO_PERCENTAGE, ratio * PRE_STAKING_NPRO_PERCENTAGE));
    } else {
      // Linear mapping from pre-staking end to final end = 8.33% to 100%
      const ratio = (stakingEndDate.getTime() - preStakingEnd.getTime()) / (maxDate.getTime() - preStakingEnd.getTime());
      return PRE_STAKING_NPRO_PERCENTAGE + (ratio * (TOTAL_NPRO_PERCENTAGE - PRE_STAKING_NPRO_PERCENTAGE));
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate epochs until staking end
  const epochDurationSeconds = getEpochDuration(blockTime);
  const epochDurationMs = epochDurationSeconds * 1000; // Convert to milliseconds
  const epochsUntilEnd = Math.ceil((stakingEndDate.getTime() - new Date().getTime()) / epochDurationMs);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[720px] max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E5E5E5] bg-gradient-to-r from-[#F8F9FA] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <img 
                src="/icons/npro-token.svg" 
                alt="NPRO" 
                className="w-10 h-10"
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#3F4246] font-sf">
                NPRO Rewards Calculator
              </h2>
              <p className="text-xs text-[#999999] font-sf">Calculate your potential earnings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-[#F6F6F6] rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-[#999999]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[calc(95vh-80px)] overflow-y-auto">
          {/* User's Already Earned NPRO */}
          {parseFloat(userEarnedNpro) > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-[20px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium text-green-800 font-sf text-sm">Already Earned</span>
              </div>
              <p className="text-xl font-bold text-green-900 font-sf">
                {formatNproAmount(userEarnedNpro)} NPRO
              </p>
            </div>
          )}

          {/* Input Row - Side by side on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stake Amount Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#3F4246] font-sf">
                Stake Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 pr-12 border border-[#E5E5E5] rounded-[100px] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#5F8AFA] focus:border-transparent focus:bg-white transition-all font-sf text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-[#999999] font-sf">
                  NEAR
                </span>
              </div>
            </div>

            {/* Total Pool Amount Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#3F4246] font-sf">
                Total Pool Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={totalPoolAmount}
                  onChange={(e) => setTotalPoolAmount(e.target.value)}
                  placeholder="Enter pool total"
                  className="w-full px-4 py-3 pr-12 border border-[#E5E5E5] rounded-[100px] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#5F8AFA] focus:border-transparent focus:bg-white transition-all font-sf text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-[#999999] font-sf">
                  NEAR
                </span>
              </div>
              <p className="text-xs text-[#999999] font-sf">
                Current: {formatNearAmount(currentPoolTotal)} NEAR
              </p>
            </div>
          </div>

          {/* Staking Duration Slider */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#3F4246] font-sf">
              Staking Duration
            </label>
            
            {/* NPRO Release Range Display */}
            <div className="flex items-center justify-between text-xs text-[#999999] font-sf">
              <span>0% NPRO Released</span>
              <span>100% NPRO Released</span>
            </div>

            {/* Progress Bar / Slider */}
            <div className="relative px-2">
              <div className="h-3 bg-[#F6F6F6] rounded-full overflow-hidden shadow-inner">
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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {/* Pre-staking End Marker */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-orange-400 rounded-full cursor-pointer hover:bg-orange-500 transition-colors z-10 flex items-center justify-center"
                style={{ left: `${PRE_STAKING_NPRO_PERCENTAGE}%` }}
                onClick={() => handleNproSliderChange(PRE_STAKING_NPRO_PERCENTAGE)}
                title="Click to set to pre-staking end date"
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              {/* Slider Thumb Visual */}
              <div 
                className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg pointer-events-none ${
                  Math.abs(getNproPercentage() - PRE_STAKING_NPRO_PERCENTAGE) < 0.1 
                    ? 'border-2 border-orange-400' 
                    : 'border-2 border-[#5F8AFA]'
                }`}
                style={{ left: `${getNproPercentage()}%` }}
              />
            </div>

            {/* Selected Date Display */}
            <div className="flex items-center justify-between bg-[#F8F9FA] rounded-[16px] p-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#5F8AFA] rounded-full flex items-center justify-center">
                  <Calendar className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-sm text-[#3F4246] font-sf font-medium">
                  {formatDate(stakingEndDate)}
                </span>
                {Math.abs(getNproPercentage() - PRE_STAKING_NPRO_PERCENTAGE) < 0.1 && (
                  <span className="text-xs text-orange-600 font-sf font-medium">
                    • Pre-staking ends
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm text-[#999999] font-sf">
                  {epochsUntilEnd} epochs
                </span>
                <div className="text-xs text-[#5F8AFA] font-sf font-medium">
                  {getNproPercentage().toFixed(1)}% NPRO Released
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-[#F8F9FA] to-[#E5ECFE] rounded-[20px] p-4 border border-[#E5E5E5]">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-[#3F4246] font-sf">Estimated Rewards</h3>
            </div>
            
            {isCalculating ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#5F8AFA] border-t-transparent"></div>
              </div>
            ) : calculatedRewards ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white rounded-[16px] p-3">
                  <span className="text-sm text-[#999999] font-sf">New NPRO Rewards:</span>
                  <span className="font-bold text-lg text-[#5F8AFA] font-sf">
                    {formatNproAmount(calculatedRewards.toString())} NPRO
                  </span>
                </div>
                
                {parseFloat(userEarnedNpro) > 0 && (
                  <>
                    <div className="flex justify-between items-center bg-green-50 rounded-[16px] p-3">
                      <span className="text-sm text-green-700 font-sf">Already Earned:</span>
                      <span className="font-semibold text-green-600 font-sf">
                        {formatNproAmount(userEarnedNpro)} NPRO
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-[#5F8AFA] to-[#7B68EE] rounded-[16px] p-3 text-white">
                      <span className="font-medium font-sf">Total NPRO:</span>
                      <span className="font-bold text-xl font-sf">
                        {formatNproAmount(calculatedRewards.plus(userEarnedNpro).toString())} NPRO
                      </span>
                    </div>
                  </>
                )}
                
                <div className="bg-blue-50 rounded-[12px] p-2.5">
                  <p className="text-xs text-blue-700 font-sf">
                    {stakingEndDate <= preStakingEnd ? 
                      "🚀 Pre-staking period offers higher rewards!" :
                      "📈 Includes pre-staking + regular staking rewards"
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-[#999999] font-sf text-center">
                  Enter valid amounts to see rewards
                </p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-[16px] p-3">
            <div className="flex items-start gap-2">
              <span className="text-orange-500 text-sm">⚠️</span>
              <div>
                <p className="text-xs text-orange-700 font-sf leading-relaxed">
                  <strong>Disclaimer:</strong> Estimates based on bonding curve formula. 
                  Actual rewards may vary with network conditions and total staked amounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}