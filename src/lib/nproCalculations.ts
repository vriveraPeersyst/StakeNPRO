import { Decimal } from 'decimal.js';
import BigNumber from 'bignumber.js';

// NPRO bonding curve constants
export const BONDING_CURVE_CONFIG = {
  r0: process.env.NPRO_R_ZERO || '1892.824882239740',
  lambda: process.env.NPRO_LAMBDA || '0.00023664977144416'
} as const;

// NPRO decimals (same as NEAR - 24 decimals for yoctoNPRO)
export const NPRO_DECIMALS = 24;

// Key dates
export const PRE_STAKING_END_DATE = new Date('2025-12-15T00:00:00Z');
export const STAKING_END_DATE = new Date('2030-09-15T00:00:00Z');

// NEAR blockchain constants
export const BLOCKS_PER_EPOCH = 43200; // 1 epoch = 43200 blocks
export const DEFAULT_BLOCK_TIME = 0.6; // Default block time in seconds

// Start epoch (you may need to adjust this based on your system)
export const START_EPOCH = 0; // This should be set to the actual start epoch of your system

// Cache for block time
let cachedBlockTime: number | null = null;
let blockTimeCacheExpiry: number = 0;

/**
 * Fetch current average block time from nearblocks.io
 * @returns Promise<number> - Average block time in seconds
 */
export async function fetchAverageBlockTime(): Promise<number> {
  // Check cache first (cache for 10 minutes)
  const now = Date.now();
  if (cachedBlockTime !== null && now < blockTimeCacheExpiry) {
    return cachedBlockTime;
  }

  try {
    const response = await fetch("https://nearblocks.io/", {
      "headers": {
        "accept": "text/x-component",
        "accept-language": "en-GB,en;q=0.9,es;q=0.8,en-US;q=0.7",
        "content-type": "text/plain;charset=UTF-8",
        "next-action": "7ff03499f1d0656e8ed7da093705065662a146471e",
        "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%5B%22locale%22%2C%22en%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2F%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
        "priority": "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },
      "referrer": "https://nearblocks.io/",
      "body": "[]",
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const blockTime = parseFloat(data.avg_block_time) || DEFAULT_BLOCK_TIME;
    
    // Cache the result for 10 minutes
    cachedBlockTime = blockTime;
    blockTimeCacheExpiry = now + (10 * 60 * 1000);
    
    return blockTime;
  } catch (error) {
    console.warn('Failed to fetch average block time, using default:', error);
    return DEFAULT_BLOCK_TIME;
  }
}

/**
 * Get epoch duration in seconds
 * @param blockTime Average block time in seconds
 * @returns Epoch duration in seconds
 */
export function getEpochDuration(blockTime: number = DEFAULT_BLOCK_TIME): number {
  return BLOCKS_PER_EPOCH * blockTime;
}

/**
 * Convert decimal to integer by multiplying with 10^decimals
 */
export function decimalToInt(value: string, decimals: number): string {
  return new Decimal(value).mul(new Decimal(10).pow(decimals)).toFixed(0);
}

/**
 * Convert integer to decimal by dividing with 10^decimals
 */
export function intToDecimal(value: string, decimals: number): string {
  return new Decimal(value).div(new Decimal(10).pow(decimals)).toString();
}

/**
 * NPRO bonding curve function.
 * R(t) = R0 * e^(-λt)
 * @param t Epoch value (time parameter)
 * @returns The bonding curve value at epoch t
 */
export function getNproBondingCurveValue(t: number): BigNumber {
  const r0 = new Decimal(BONDING_CURVE_CONFIG.r0);
  const lambda = new Decimal(BONDING_CURVE_CONFIG.lambda);

  // Calculate R(t) = R0 * e^(-λt)
  const exponent = lambda.mul(t).mul(-1);
  const result = r0.mul(Decimal.exp(exponent));
  
  return new BigNumber(decimalToInt(result.toString(), NPRO_DECIMALS));
}

/**
 * Calculate NPRO distribution for a given epoch
 * @param epoch The epoch number
 * @param userStakedBalance User's staked balance in the pool
 * @param totalStaked Total amount staked in the pool
 * @returns The NPRO amount the user would earn in this epoch
 */
export function calculateEpochNproReward(
  epoch: number,
  userStakedBalance: string,
  totalStaked: string
): BigNumber {
  if (new BigNumber(totalStaked).isLessThanOrEqualTo(0)) {
    return new BigNumber(0);
  }

  const nproToDistribute = getNproBondingCurveValue(epoch - START_EPOCH);
  const userShare = new BigNumber(userStakedBalance).div(totalStaked);
  
  return userShare.multipliedBy(nproToDistribute).integerValue();
}

/**
 * Calculate total NPRO rewards for a staking period
 * @param userStakedBalance User's staked balance
 * @param totalStaked Total staked amount in the pool
 * @param startEpoch Starting epoch
 * @param endEpoch Ending epoch
 * @returns Total NPRO rewards over the period
 */
export function calculateTotalNproRewards(
  userStakedBalance: string,
  totalStaked: string,
  startEpoch: number,
  endEpoch: number
): BigNumber {
  let totalRewards = new BigNumber(0);

  for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
    const epochReward = calculateEpochNproReward(epoch, userStakedBalance, totalStaked);
    totalRewards = totalRewards.plus(epochReward);
  }

  return totalRewards;
}

/**
 * Convert date to epoch number using actual block time
 * @param date The target date
 * @param blockTime Average block time in seconds (optional, will use cached or default)
 * @returns Epoch number
 */
export function dateToEpoch(date: Date, blockTime: number = DEFAULT_BLOCK_TIME): number {
  const startDate = new Date('2024-01-01T00:00:00Z'); // Adjust this to your system's start date
  const diffInMs = date.getTime() - startDate.getTime();
  const diffInSeconds = diffInMs / 1000;
  
  const epochDuration = getEpochDuration(blockTime);
  const epochsSinceStart = Math.floor(diffInSeconds / epochDuration);
  
  return START_EPOCH + epochsSinceStart;
}

/**
 * Convert epoch number to date using actual block time
 * @param epoch The epoch number
 * @param blockTime Average block time in seconds (optional, will use default)
 * @returns Date
 */
export function epochToDate(epoch: number, blockTime: number = DEFAULT_BLOCK_TIME): Date {
  const startDate = new Date('2024-01-01T00:00:00Z'); // Adjust this to your system's start date
  const epochDuration = getEpochDuration(blockTime);
  const secondsSinceStart = (epoch - START_EPOCH) * epochDuration;
  
  return new Date(startDate.getTime() + (secondsSinceStart * 1000));
}

/**
 * Async version of dateToEpoch that fetches current block time
 * @param date The target date
 * @returns Promise<number> - Epoch number using current block time
 */
export async function dateToEpochWithCurrentBlockTime(date: Date): Promise<number> {
  const blockTime = await fetchAverageBlockTime();
  return dateToEpoch(date, blockTime);
}

/**
 * Async version of epochToDate that fetches current block time
 * @param epoch The epoch number
 * @returns Promise<Date> - Date using current block time
 */
export async function epochToDateWithCurrentBlockTime(epoch: number): Promise<Date> {
  const blockTime = await fetchAverageBlockTime();
  return epochToDate(epoch, blockTime);
}



/**
 * Parse NEAR amount from string (handles decimals)
 * @param amount Amount as string
 * @returns Amount in yoctoNEAR (smallest NEAR units)
 */
export function parseNearAmount(amount: string): string {
  const NEAR_DECIMALS = 24;
  return decimalToInt(amount, NEAR_DECIMALS);
}

/**
 * Format NEAR amount for display
 * @param amount Amount in yoctoNEAR
 * @returns Formatted NEAR amount
 */
export function formatNearAmount(amount: string): string {
  const NEAR_DECIMALS = 24;
  const decimal = new Decimal(amount).div(new Decimal(10).pow(NEAR_DECIMALS));
  return decimal.toFixed(2);
}