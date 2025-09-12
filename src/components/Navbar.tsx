'use client'

import { useState } from 'react'
import { RpcStatus } from './RpcStatus'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="w-full max-w-[760px] mx-auto px-4">
      <div className="flex flex-row items-center justify-between p-2 gap-3 w-full min-h-14 bg-white shadow-[0px_4px_16px_rgba(48,50,54,0.12)] rounded-xl">
        {/* Left - Logo and Text */}
        <div className="flex flex-row items-center gap-4 sm:gap-3 flex-shrink-0">
          <img 
            src="/icons/NEARMobileApp.svg" 
            alt="NEAR Mobile" 
            className="w-8 h-8 sm:w-10 sm:h-10" 
          />
          {/* NEAR Mobile text - now visible on mobile */}
          <span className="font-sf font-medium text-sm sm:text-base leading-5 sm:leading-6 tracking-[-0.01em] text-nm-text">
            NEAR Mobile
          </span>
        </div>

        {/* Desktop Menu - Hidden on mobile */}
        <div className="hidden lg:flex flex-row justify-center items-center gap-4 xl:gap-6">
          <a
            href="https://nearmobile.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sf font-medium text-sm xl:text-base leading-5 xl:leading-6 tracking-[-0.01em] text-nm-muted cursor-pointer hover:text-nm-text transition-colors whitespace-nowrap"
          >
            Home
          </a>
          <div className="relative">
            <div className="absolute w-8 h-1 left-1/2 transform -translate-x-1/2 -top-4 bg-primary"></div>
            <span className="font-sf font-medium text-sm xl:text-base leading-5 xl:leading-6 tracking-[-0.01em] text-nm-text cursor-pointer whitespace-nowrap">
              NPRO
            </span>
          </div>
          <a
            href="https://discord.com/invite/y3dsWCJFcM"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sf font-medium text-sm xl:text-base leading-5 xl:leading-6 tracking-[-0.01em] text-nm-muted cursor-pointer hover:text-nm-text transition-colors whitespace-nowrap"
          >
            Support
          </a>
          <a
            href="https://nearmobile.app/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sf font-medium text-sm xl:text-base leading-5 xl:leading-6 tracking-[-0.01em] text-nm-muted cursor-pointer hover:text-nm-text transition-colors whitespace-nowrap"
          >
            Blog
          </a>
        </div>

        {/* Right - Get the App Button + Mobile Menu Button */}
        <div className="flex items-center gap-2">
          {/* Get the App Button - now visible on mobile */}
          <a
            href="https://nearmobile.app/downloadredirect"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-row justify-center items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 gap-1 sm:gap-2 h-7 sm:h-8 md:h-10 bg-primary rounded-full hover:opacity-80 transition-opacity"
          >
            <span className="font-sf font-medium text-xs sm:text-sm md:text-base leading-3 sm:leading-4 md:leading-6 text-center tracking-[-0.01em] text-white whitespace-nowrap">
              Get the app
            </span>
          </a>

          {/* Mobile Menu Button - Only visible on smaller screens */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-nm-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 bg-white shadow-[0px_4px_16px_rgba(48,50,54,0.12)] rounded-xl">
          <div className="flex flex-col space-y-4">
            {/* Navigation Links */}
            <div className="flex flex-col space-y-3 pb-3 border-b border-gray-100">
              <a
                href="https://nearmobile.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sf font-medium text-base leading-6 tracking-[-0.01em] text-nm-muted hover:text-nm-text transition-colors py-2 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <div className="py-2 text-center">
                <span className="font-sf font-medium text-base leading-6 tracking-[-0.01em] text-nm-text">
                  NPRO
                </span>
              </div>
              <a
                href="https://discord.com/invite/y3dsWCJFcM"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sf font-medium text-base leading-6 tracking-[-0.01em] text-nm-muted hover:text-nm-text transition-colors py-2 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Support
              </a>
              <a
                href="https://nearmobile.app/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sf font-medium text-base leading-6 tracking-[-0.01em] text-nm-muted hover:text-nm-text transition-colors py-2 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </a>
            </div>

            {/* RPC Status Section */}
            <div className="pt-3 border-t border-gray-100">
              <RpcStatus isMobile={true} />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
