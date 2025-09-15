'use client'

import { useState, useRef, useEffect } from 'react'
import { copyToClipboard } from '@/lib/utils'

interface AccountDropdownProps {
  accountId: string
  walletName?: string
  onSignOut: () => void
}

export default function AccountDropdown({ accountId, walletName, onSignOut }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatAccountId = (id: string) => {
    // Use mobile state instead of window.innerWidth
    if (isMobile) {
      if (id.length <= 12) return id
      return `${id.slice(0, 6)}...${id.slice(-4)}`
    }
    // For larger screens, use original format
    if (id.length <= 20) return id
    return `${id.slice(0, 8)}...${id.slice(-6)}`
  }

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(accountId)
    
    if (success) {
      setShowToast(true)
      setIsOpen(false)
      setTimeout(() => setShowToast(false), 3000)
    } else {
      // Handle copy failure - you might want to show a different message
      console.warn('Copy to clipboard failed')
      // Still close dropdown but maybe don't show success toast
      setIsOpen(false)
    }
  }

  const handleSignOut = () => {
    setIsOpen(false)
    onSignOut()
  }

  const handleForceDisconnect = () => {
    setIsOpen(false)
    
    // Clear all localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear all cookies (only same-origin cookies)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
    
    // Clear IndexedDB if available
    if ('indexedDB' in window) {
      indexedDB.databases?.().then((databases) => {
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
          }
        })
      }).catch(() => {
        // Silently handle errors in IndexedDB cleanup
      })
    }
    
    // Force reload the page to ensure complete reset
    window.location.reload()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Account Button - responsive design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row justify-center items-center px-2 sm:px-4 py-2 gap-1 sm:gap-2 w-auto sm:w-[213px] max-w-[160px] sm:max-w-none h-8 sm:h-10 bg-[#F6F6F6] rounded-[100px] hover:bg-gray-200 transition-colors active:scale-95"
      >
        <span className="font-sf font-medium text-xs sm:text-base leading-4 sm:leading-6 text-center tracking-[-0.01em] text-[#3F4246] truncate flex-1 min-w-0">
          {formatAccountId(accountId)}
        </span>
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
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
        <div className="absolute right-0 top-10 sm:top-12 w-[240px] sm:w-[213px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-3 sm:px-4 py-3 border-b border-gray-100">
            <div 
              onClick={handleCopyAddress}
              className="text-xs sm:text-sm font-medium text-gray-900 font-sf cursor-pointer hover:bg-gray-50 active:bg-gray-100 -mx-2 px-2 py-1 rounded transition-colors break-all"
              title="Click to copy address"
            >
              {accountId}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-sf">
              {walletName ? `Connected via ${walletName}` : 'Connected Account'}
            </div>
          </div>
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors font-sf"
            >
              Disconnect Wallet
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={handleForceDisconnect}
              className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors font-sf font-medium"
              title="Clears all cache and forces a complete reset"
            >
              Force Disconnect
            </button>
          </div>
        </div>
      )}
      
      {/* Toast for copy feedback */}
      {showToast && (
        <div
          className={`fixed top-[50px] right-4 z-[60] p-3 sm:p-4 rounded-lg border shadow-lg max-w-[280px] sm:max-w-sm transition-all duration-300 opacity-100 translate-y-0 bg-green-50 border-green-200 text-green-800`}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <p className="flex-1 text-xs sm:text-sm">Address copied to clipboard!</p>
            <button
              onClick={() => setShowToast(false)}
              className="p-1 hover:opacity-70 active:opacity-50 transition-opacity"
            >
              <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
