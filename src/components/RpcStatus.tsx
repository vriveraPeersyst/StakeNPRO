'use client'

import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRpcStatus } from '@/hooks/useRpcStatus'

interface RpcStatusProps {
  isMobile?: boolean
}

export function RpcStatus({ isMobile = false }: RpcStatusProps) {
  const { status, currentUrl, switchRpc, addCustomRpc, removeRpc, clearPreferences } = useRpcStatus()
  const [showDetails, setShowDetails] = useState(false)
  const [showAddRpc, setShowAddRpc] = useState(false)
  const [newRpcUrl, setNewRpcUrl] = useState('')
  const [makeItPrimary, setMakeItPrimary] = useState(false)
  const queryClient = useQueryClient()

  if (!status) return null

  const handleRpcSwitch = (url: string) => {
    const success = switchRpc(url)
    if (success) {
      // Invalidate all React Query caches to force re-fetch with new RPC
      queryClient.invalidateQueries()
      console.log('RPC switched and caches invalidated')
    }
  }

  const handleAddCustomRpc = () => {
    if (!newRpcUrl.trim()) return

    const success = addCustomRpc(newRpcUrl.trim(), makeItPrimary)
    if (success) {
      setNewRpcUrl('')
      setMakeItPrimary(false)
      setShowAddRpc(false)
      if (makeItPrimary) {
        queryClient.invalidateQueries()
      }
      console.log('Custom RPC added successfully')
    } else {
      alert('Failed to add RPC endpoint. Please check the URL format.')
    }
  }

  const handleRemoveRpc = (url: string) => {
    if (confirm(`Are you sure you want to remove RPC endpoint: ${url}?`)) {
      const success = removeRpc(url)
      if (success) {
        console.log('RPC endpoint removed successfully')
      }
    }
  }

  if (!status) return null

  // Only show if there are failures or in development
  const shouldShow = process.env.NODE_ENV === 'development' || 
    status.endpoints.some((ep: any) => ep.failures > 0 || ep.isBlacklisted)

  if (!shouldShow && !showDetails) return null

  const hasBlacklisted = status.endpoints.some((ep: any) => ep.isBlacklisted)
  const hasFailures = status.endpoints.some((ep: any) => ep.failures > 0)
  const availableCount = status.endpoints.filter((ep: any) => !ep.isBlacklisted).length

  // Mobile version - embedded in navbar
  if (isMobile) {
    return (
      <div className="w-full">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`w-full px-2 py-1 rounded text-xs font-sf-mono font-medium shadow-sm transition-all duration-200 ${
            hasBlacklisted 
              ? 'bg-red-50 text-nm-error border border-red-200' 
              : hasFailures
              ? 'bg-yellow-50 text-nm-warning border border-yellow-200'
              : 'bg-green-50 text-nm-success border border-green-200'
          }`}
        >
          RPC: {availableCount}/{status.endpoints.length} endpoints
        </button>
        
        {showDetails && (
          <div className="mt-2 w-full bg-white/95 backdrop-blur-xl shadow-nm rounded-nm border border-nm-border overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 bg-nm-header border-b border-nm-border">
              <div className="flex justify-between items-center">
                <h4 className="font-sf font-semibold text-sm text-nm-text">
                  RPC Status
                </h4>
                <button
                  onClick={() => setShowAddRpc(!showAddRpc)}
                  className="flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-nm-sm text-xs hover:bg-primary/80 transition-all font-sf font-medium shadow-nm-button"
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add
                </button>
              </div>
            </div>

            <div className="px-3 py-3">
              {/* Current RPC Display */}
              <div className="mb-3">
                <div className="text-xs font-sf font-medium text-nm-textSecondary mb-1">
                  Current
                </div>
                <div className="px-3 py-2 bg-nm-accent rounded-nm-sm text-xs border border-nm-border shadow-sm">
                  <span className="font-sf-mono text-xs text-nm-text">
                    {currentUrl.split('//')[1]?.split('/')[0] || 'unknown'}
                  </span>
                </div>
              </div>

              {/* Add Custom RPC Form */}
              {showAddRpc && (
                <div className="mb-3 p-3 bg-nm-accent rounded-nm border border-nm-border shadow-sm">
                  <h5 className="font-sf font-semibold text-xs text-nm-text mb-2">
                    Add Custom RPC
                  </h5>
                  <input
                    type="text"
                    value={newRpcUrl}
                    onChange={(e) => setNewRpcUrl(e.target.value)}
                    placeholder="https://your-rpc-endpoint.com"
                    className="w-full px-3 py-2 border border-nm-border rounded-nm-sm text-xs font-sf text-nm-text placeholder-nm-muted bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 mb-2 shadow-sm"
                  />
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="makeItPrimary-mobile"
                      checked={makeItPrimary}
                      onChange={(e) => setMakeItPrimary(e.target.checked)}
                      className="mr-2 w-3 h-3 text-primary bg-white border-nm-border rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="makeItPrimary-mobile" className="text-xs font-sf font-medium text-nm-textSecondary">
                      Make primary
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCustomRpc}
                      className="px-3 py-1.5 bg-nm-success text-white rounded-nm-sm text-xs hover:bg-nm-success/80 transition-all font-sf font-medium shadow-nm-button"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRpc(false)
                        setNewRpcUrl('')
                        setMakeItPrimary(false)
                      }}
                      className="px-3 py-1.5 bg-nm-muted text-white rounded-nm-sm text-xs hover:bg-nm-muted/80 transition-all font-sf font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Instructions */}
              <div className="mb-2">
                <p className="text-xs font-sf font-medium text-nm-muted">
                  Tap to switch endpoint
                </p>
              </div>
              
              {/* RPC Endpoints List */}
              <div className="space-y-2">
                {status.endpoints.map((ep: any, i: number) => {
                  const isCurrentRpc = currentUrl === ep.url
                  return (
                    <div
                      key={i}
                      className={`flex justify-between items-center p-2.5 rounded-nm-sm border transition-all duration-200 shadow-sm ${
                        isCurrentRpc 
                          ? 'bg-primary/10 border-primary/40 shadow-nm' 
                          : ep.isBlacklisted 
                            ? 'bg-nm-error/10 border-nm-error/30 text-nm-error' 
                            : ep.failures > 0 
                              ? 'bg-nm-warning/10 border-nm-warning/30' 
                              : 'bg-white border-nm-border hover:border-primary/40 hover:shadow-nm'
                      }`}
                    >
                      <button
                        onClick={() => !ep.isBlacklisted && handleRpcSwitch(ep.url)}
                        disabled={ep.isBlacklisted}
                        className={`flex items-center gap-2 flex-1 text-left min-w-0 ${
                          ep.isBlacklisted ? 'cursor-not-allowed' : 'cursor-pointer group'
                        }`}
                      >
                        {/* Status Indicator */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isCurrentRpc 
                            ? 'bg-primary shadow-sm shadow-primary/30' 
                            : ep.isBlacklisted 
                              ? 'bg-nm-error' 
                              : ep.failures > 0 
                                ? 'bg-nm-warning' 
                                : 'bg-nm-success'
                        }`}></div>
                        
                        {/* RPC URL */}
                        <span className={`truncate font-sf-mono text-xs ${
                          ep.isBlacklisted 
                            ? 'text-nm-error' 
                            : isCurrentRpc 
                              ? 'text-primary font-semibold' 
                              : 'text-nm-text group-hover:text-primary'
                        }`}>
                          {ep.url.split('//')[1]?.split('/')[0] || ep.url}
                        </span>
                      </button>
                      
                      {/* Status Badges and Actions */}
                      <div className="flex gap-1 items-center flex-shrink-0">
                        {ep.failures > 0 && (
                          <span className="px-1.5 py-0.5 bg-nm-warning text-white rounded-nm-sm text-xs font-sf font-medium shadow-nm-button">
                            F:{ep.failures}
                          </span>
                        )}
                        {ep.isBlacklisted && (
                          <span className="px-1.5 py-0.5 bg-nm-error text-white rounded-nm-sm text-xs font-sf font-medium shadow-nm-button">
                            BL
                          </span>
                        )}
                        {isCurrentRpc && (
                          <span className="px-1.5 py-0.5 bg-primary text-white rounded-nm-sm text-xs font-sf font-semibold shadow-nm-button">
                            ●
                          </span>
                        )}
                        {!ep.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveRpc(ep.url)
                            }}
                            className="w-5 h-5 flex items-center justify-center bg-nm-error text-white rounded-nm-sm hover:bg-nm-error/80 transition-all shadow-nm-button"
                            title="Remove custom RPC"
                          >
                            <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-nm-header border-t border-nm-border">
              <div className="flex justify-between items-center gap-2">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 py-1 text-center text-nm-muted hover:text-nm-text transition-colors font-sf font-medium text-xs"
                >
                  Close
                </button>
                
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => {
                      if (confirm('Reset all RPC preferences to defaults?')) {
                        clearPreferences()
                      }
                    }}
                    className="px-2 py-1 text-center text-nm-error hover:opacity-80 transition-opacity font-sf font-medium text-xs rounded-nm-sm bg-nm-error/10"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop version - floating
  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`px-2 py-1 rounded text-xs font-sf-mono font-medium shadow-nm transition-all duration-200 hover:shadow-nm-hover ${
          hasBlacklisted 
            ? 'bg-red-50 text-nm-error border border-red-200' 
            : hasFailures
            ? 'bg-yellow-50 text-nm-warning border border-yellow-200'
            : 'bg-green-50 text-nm-success border border-green-200'
        }`}
      >
        RPC: {availableCount}/{status.endpoints.length}
      </button>
      
      {showDetails && (
        <div className="absolute right-0 mt-2 w-80 bg-white/20 backdrop-blur-xl shadow-nm-hover rounded-nm border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 bg-white/10 backdrop-blur-xl border-b border-white/10">
            <div className="flex justify-between items-center">
              <h3 className="font-sf font-semibold text-sm text-nm-text">
                RPC Status
              </h3>
              <button
                onClick={() => setShowAddRpc(!showAddRpc)}
                className="flex items-center gap-1 px-3 py-1 bg-primary/70 backdrop-blur-sm text-white rounded-nm-sm text-xs hover:bg-primary/80 transition-all font-sf font-medium shadow-nm-button"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add
              </button>
            </div>
          </div>

          <div className="px-3 py-2 max-h-64 overflow-y-auto bg-white/5 backdrop-blur-xl">
            {/* Current RPC Display */}
            <div className="mb-3">
              <div className="text-xs font-sf font-medium text-nm-textSecondary mb-1 tracking-[-0.01em]">
                Current
              </div>
              <div className="px-3 py-2 bg-white/20 backdrop-blur-lg rounded-nm-sm text-xs border border-white/20 shadow-nm">
                <span className="font-sf-mono text-xs text-nm-text tracking-tight">
                  {currentUrl.split('//')[1]?.split('/')[0] || 'unknown'}
                </span>
              </div>
            </div>

            {/* Add Custom RPC Form */}
            {showAddRpc && (
              <div className="mb-3 p-3 bg-white/15 backdrop-blur-xl rounded-nm border border-white/15 shadow-nm">
                <h4 className="font-sf font-semibold text-xs text-nm-text mb-3 tracking-[-0.01em]">
                  Add Custom RPC
                </h4>
                <input
                  type="text"
                  value={newRpcUrl}
                  onChange={(e) => setNewRpcUrl(e.target.value)}
                  placeholder="https://your-rpc-endpoint.com"
                  className="w-full px-3 py-2 border border-white/25 rounded-nm-sm text-xs font-sf text-nm-text placeholder-nm-muted bg-white/30 backdrop-blur-md focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white/40 mb-3 tracking-[-0.01em] shadow-sm"
                />
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="makeItPrimary"
                    checked={makeItPrimary}
                    onChange={(e) => setMakeItPrimary(e.target.checked)}
                    className="mr-3 w-4 h-4 text-primary bg-white/40 border-white/30 rounded-sm focus:ring-primary/30 focus:ring-2 backdrop-blur-sm"
                  />
                  <label htmlFor="makeItPrimary" className="text-xs font-sf font-medium text-nm-textSecondary tracking-[-0.01em]">
                    Make primary
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCustomRpc}
                    className="px-4 py-2 bg-nm-success/70 backdrop-blur-sm text-white rounded-nm-sm text-xs hover:bg-nm-success/80 transition-all font-sf font-semibold shadow-nm-button tracking-[-0.01em]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddRpc(false)
                      setNewRpcUrl('')
                      setMakeItPrimary(false)
                    }}
                    className="px-4 py-2 bg-nm-muted/70 backdrop-blur-sm text-white rounded-nm-sm text-xs hover:bg-nm-muted/80 transition-all font-sf font-semibold tracking-[-0.01em]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Instructions */}
            <div className="mb-2">
              <p className="text-xs font-sf font-medium text-nm-muted tracking-[-0.01em]">
                Click to switch endpoint
              </p>
            </div>
            
            {/* RPC Endpoints List */}
            <div className="space-y-2">
              {status.endpoints.map((ep: any, i: number) => {
                const isCurrentRpc = currentUrl === ep.url
                return (
                  <div
                    key={i}
                    className={`flex justify-between items-center p-3 rounded-nm-sm border transition-all duration-200 backdrop-blur-lg shadow-sm ${
                      isCurrentRpc 
                        ? 'bg-primary/20 border-primary/40 shadow-nm' 
                        : ep.isBlacklisted 
                          ? 'bg-nm-error/15 border-nm-error/30 text-nm-error' 
                          : ep.failures > 0 
                            ? 'bg-nm-warning/15 border-nm-warning/30' 
                            : 'bg-white/10 border-white/15 hover:border-primary/40 hover:shadow-nm hover:bg-white/20'
                    }`}
                  >
                    <button
                      onClick={() => !ep.isBlacklisted && handleRpcSwitch(ep.url)}
                      disabled={ep.isBlacklisted}
                      className={`flex items-center gap-3 flex-1 text-left ${
                        ep.isBlacklisted ? 'cursor-not-allowed' : 'cursor-pointer group'
                      }`}
                    >
                      {/* Status Indicator */}
                      <div className={`w-2 h-2 rounded-full ${
                        isCurrentRpc 
                          ? 'bg-primary shadow-lg shadow-primary/30' 
                          : ep.isBlacklisted 
                            ? 'bg-nm-error' 
                            : ep.failures > 0 
                              ? 'bg-nm-warning' 
                              : 'bg-nm-success'
                      }`}></div>
                      
                      {/* RPC URL */}
                      <span className={`truncate font-sf-mono text-xs tracking-tight ${
                        ep.isBlacklisted 
                          ? 'text-nm-error' 
                          : isCurrentRpc 
                            ? 'text-primary font-semibold' 
                            : 'text-nm-text group-hover:text-primary'
                      }`}>
                        {ep.url.split('//')[1]?.split('/')[0] || ep.url}
                      </span>
                    </button>
                    
                    {/* Status Badges and Actions */}
                    <div className="flex gap-2 items-center">
                      {ep.failures > 0 && (
                        <span className="px-2 py-1 bg-nm-warning/80 backdrop-blur-sm text-white rounded-nm-sm text-xs font-sf font-semibold tracking-[-0.01em] shadow-nm-button">
                          F:{ep.failures}
                        </span>
                      )}
                      {ep.isBlacklisted && (
                        <span className="px-2 py-1 bg-nm-error/80 backdrop-blur-sm text-white rounded-nm-sm text-xs font-sf font-semibold tracking-[-0.01em] shadow-nm-button">
                          BL
                        </span>
                      )}
                      {isCurrentRpc && (
                        <span className="px-2 py-1 bg-primary/80 backdrop-blur-sm text-white rounded-nm-sm text-xs font-sf font-semibold tracking-[-0.01em] shadow-nm-button">
                          ●
                        </span>
                      )}
                      {!ep.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveRpc(ep.url)
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-nm-error/80 backdrop-blur-sm text-white rounded-nm-sm hover:bg-nm-error/90 transition-all shadow-nm-button"
                          title="Remove custom RPC"
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-white/10 backdrop-blur-xl border-t border-white/10">
            <button
              onClick={() => setShowDetails(false)}
              className="w-full py-2 text-center text-nm-muted hover:text-nm-text transition-colors font-sf font-semibold text-xs tracking-[-0.01em]"
            >
              Close
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => {
                  if (confirm('Reset all RPC preferences to defaults?')) {
                    clearPreferences()
                  }
                }}
                className="w-full mt-2 py-1 text-center text-nm-error hover:opacity-80 transition-opacity font-sf font-medium text-xs tracking-[-0.01em]"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
