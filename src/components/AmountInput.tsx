'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  onMaxClick: () => void
  onPercentageClick?: (percentage: string, value: number) => void
  disabled?: boolean
  nearPrice?: number
  isConnected?: boolean
  selectedPercentage?: string | null
  availableBalance?: string
  isBalanceLoading?: boolean
}

export default function AmountInput({ 
  value, 
  onChange, 
  onMaxClick, 
  onPercentageClick,
  disabled = false,
  nearPrice,
  isConnected = false,
  selectedPercentage = null,
  availableBalance = '0',
  isBalanceLoading = false
}: AmountInputProps) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    
    // Allow numbers, dots, and commas
    newValue = newValue.replace(/[^0-9.,]/g, '')
    
    // Replace comma with dot for consistent decimal handling
    newValue = newValue.replace(',', '.')
    
    // Prevent multiple dots
    const dotCount = (newValue.match(/\./g) || []).length
    if (dotCount > 1) return
    
    // Limit to 6 decimal places
    const parts = newValue.split('.')
    if (parts[1] && parts[1].length > 6) {
      newValue = parts[0] + '.' + parts[1].substring(0, 6)
    }
    
    setInputValue(newValue)
    onChange(newValue)
  }

  const formatUsdValue = () => {
    if (!nearPrice || !inputValue || isNaN(parseFloat(inputValue))) return '$0.00'
    const usdValue = parseFloat(inputValue) * nearPrice
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdValue)
  }

  const chips = [
    { label: '10%', value: 0.1, onClick: () => onPercentageClick?.('10%', 0.1) },
    { label: '25%', value: 0.25, onClick: () => onPercentageClick?.('25%', 0.25) },
    { label: '50%', value: 0.5, onClick: () => onPercentageClick?.('50%', 0.5) },
    { label: 'Max', onClick: onMaxClick },
  ]

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Available Balance Display - Only show when connected */}
      {isConnected && (
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <span className="text-nm-muted">Available balance:</span>
          <span className="font-sf font-medium text-nm-text">
            {isBalanceLoading ? (
              'Loading...'
            ) : (
              `${parseFloat(availableBalance).toFixed(6)} NEAR`
            )}
          </span>
        </div>
      )}

      {/* Amount Input */}
      <div className="relative">
        <div className="w-full min-h-16 sm:h-18 border border-nm-border rounded-lg flex flex-col sm:flex-row">
          {/* Left side - Amount input */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center">
            <input
              type="text"
              value={inputValue}
              onChange={handleChange}
              disabled={disabled}
              placeholder="0"
              className="text-base sm:text-lg leading-5 font-mono font-semibold bg-transparent border-none outline-none text-nm-text placeholder-nm-muted w-full"
            />
            {nearPrice && (
              <div className="text-xs leading-4 font-mono font-semibold text-nm-muted mt-1">
                {formatUsdValue()}
              </div>
            )}
          </div>
          
          {/* Right side - NEAR currency selector */}
          <div className="flex items-center justify-center sm:justify-end px-3 pb-3 sm:px-4 sm:py-0">
            <div className="flex flex-row justify-center items-center px-3 py-1.5 gap-2 w-full sm:w-[88px] h-8 sm:h-9 bg-[#F6F6F6] rounded-[100px]">
              {/* NEAR token icon - 20x20px on mobile, 24x24px on desktop */}
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex-none">
                <Image 
                  src="/icons/neartoken.png" 
                  alt="NEAR Token" 
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                  quality={95}
                />
              </div>
              {/* NEAR label */}
              <span className="font-sf font-medium text-sm leading-4 sm:leading-5 text-center tracking-[-0.01em] text-[#3F4246] flex-none">
                NEAR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Chips - Only show when connected */}
      {isConnected && (
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-start gap-2 w-full">
          {chips.map((chip) => {
            const isSelected = selectedPercentage === chip.label
            return (
              <button
                key={chip.label}
                onClick={chip.onClick || (() => {})}
                disabled={disabled}
                className={`flex flex-row justify-center items-center px-3 sm:px-4 py-2 gap-2 h-9 sm:h-10 rounded-[100px] font-sf font-medium text-sm sm:text-base leading-5 sm:leading-6 text-center tracking-[-0.01em] text-[#3F4246] transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:flex-1 ${
                  isSelected ? 'bg-[#DBDBDB]' : 'bg-[#F6F6F6] hover:bg-gray-200'
                }`}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
