'use client'

import { useState, useRef, useEffect } from 'react'

interface AccountDropdownProps {
  accountId: string
  onSignOut: () => Promise<void>
}

export default function AccountDropdown({ accountId, onSignOut }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    setIsOpen(false)
    await onSignOut()
  }

  const formatAccountId = (id: string) => {
    if (id.length <= 20) return id
    return `${id.slice(0, 8)}...${id.slice(-8)}`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Account Button - matching the design specs */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row justify-center items-center px-4 py-2 gap-2 w-[213px] h-10 bg-[#F6F6F6] rounded-[100px] hover:bg-gray-200 transition-colors"
      >
        <span className="w-[153px] h-6 font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-[#3F4246] truncate">
          {formatAccountId(accountId)}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.125 6.25L10 13.125L16.875 6.25"
            stroke="#3F4246"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            transform="translate(-3.125, -1.25)"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-[213px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900 truncate font-sf">
              {accountId}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-sf">
              Connected Account
            </div>
          </div>
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-sf"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
