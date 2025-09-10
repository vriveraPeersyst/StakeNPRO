'use client'

import { useState, useEffect } from 'react'
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
    <div className="space-y-4">
      {/* Available Balance Display - Only show when connected */}
      {isConnected && (
        <div className="flex justify-between items-center text-sm">
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
        <div className="w-full h-18 border border-nm-border rounded-lg flex">
          {/* Left side - Amount input */}
          <div className="flex-1 p-4 flex flex-col justify-center">
            <input
              type="text"
              value={inputValue}
              onChange={handleChange}
              disabled={disabled}
              placeholder="0"
              className="text-sm leading-5 font-mono font-semibold bg-transparent border-none outline-none text-nm-text placeholder-nm-muted w-full"
            />
            {nearPrice && (
              <div className="text-xs leading-4 font-mono font-semibold text-nm-muted mt-1">
                {formatUsdValue()}
              </div>
            )}
          </div>
          
          {/* Right side - NEAR currency selector */}
          <div className="flex items-center pr-4">
            <div className="flex flex-row justify-center items-center px-3 py-1.5 gap-2 w-[88px] h-9 bg-[#F6F6F6] rounded-[100px]">
              {/* NEAR token icon - 24x24px with rounded background */}
              <div className="w-6 h-6 rounded-full overflow-hidden flex-none">
                <img 
                  src="/icons/neartoken.svg" 
                  alt="NEAR Token" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* NEAR label */}
              <span className="w-[38px] h-5 font-sf font-medium text-sm leading-5 text-center tracking-[-0.01em] text-[#3F4246] flex-none">
                NEAR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Chips - Only show when connected */}
      {isConnected && (
        <div className="flex flex-row items-start gap-2 w-full h-10">
          {chips.map((chip) => {
            const isSelected = selectedPercentage === chip.label
            return (
              <button
                key={chip.label}
                onClick={chip.onClick || (() => {})}
                disabled={disabled}
                className={`flex flex-row justify-center items-center px-4 py-2 gap-2 h-10 rounded-[100px] font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-[#3F4246] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 ${
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
