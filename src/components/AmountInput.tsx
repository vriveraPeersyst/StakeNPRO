'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  onMaxClick: () => void
  disabled?: boolean
  nearPrice?: number
}

export default function AmountInput({ 
  value, 
  onChange, 
  onMaxClick, 
  disabled = false,
  nearPrice 
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
    { label: '10%', value: 0.1 },
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: 'Max', onClick: onMaxClick },
  ]

  return (
    <div className="space-y-4">
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
          
          {/* Right side - NEAR chip */}
          <div className="flex items-center pr-4">
            <div className="bg-nm-chip rounded-pill px-3 py-2 flex items-center gap-2">
              {/* NEAR token icon */}
              <img 
                src="/icons/neartoken.svg" 
                alt="NEAR Token" 
                className="w-6 h-6"
              />
              <span className="text-sm font-semibold text-nm-text">NEAR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Chips */}
      <div className="flex gap-2">
        {chips.map((chip) => (
          <button
            key={chip.label}
            onClick={chip.onClick || (() => {})}
            disabled={disabled}
            className="px-3 py-1 bg-nm-chip rounded-pill text-sm font-semibold text-nm-text hover:bg-nm-disabled transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  )
}
