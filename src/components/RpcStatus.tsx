'use client'

import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRpcStatus } from '@/hooks/useRpcStatus'

export function RpcStatus() {
  const { status, currentUrl, switchRpc } = useRpcStatus()
  const [showDetails, setShowDetails] = useState(false)
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

  if (!status) return null

  // Only show if there are failures or in development
  const shouldShow = process.env.NODE_ENV === 'development' || 
    status.endpoints.some((ep: any) => ep.failures > 0 || ep.isBlacklisted)

  if (!shouldShow && !showDetails) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`px-3 py-1 rounded text-xs font-mono ${
          status.endpoints.some((ep: any) => ep.isBlacklisted) 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : status.endpoints.some((ep: any) => ep.failures > 0)
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}
      >
        RPC: {status.endpoints.filter((ep: any) => !ep.isBlacklisted).length}/{status.endpoints.length}
      </button>
      
      {showDetails && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border p-3 text-xs">
          <div className="font-semibold mb-2">RPC Status</div>
          <div className="mb-2 text-green-600">
            Current: {currentUrl.split('//')[1]?.split('/')[0] || 'unknown'}
          </div>
          <div className="mb-3 text-gray-600 text-xs">
            Click on any RPC to switch to it
          </div>
          
          <div className="space-y-1">
            {status.endpoints.map((ep: any, i: number) => {
              const isCurrentRpc = currentUrl === ep.url
              return (
                <button
                  key={i}
                  onClick={() => handleRpcSwitch(ep.url)}
                  disabled={ep.isBlacklisted}
                  className={`w-full flex justify-between items-center p-2 rounded text-xs transition-colors ${
                    isCurrentRpc 
                      ? 'bg-blue-100 border-2 border-blue-300 text-blue-800' 
                      : ep.isBlacklisted 
                        ? 'bg-red-50 text-red-400 cursor-not-allowed' 
                        : ep.failures > 0 
                          ? 'bg-yellow-50 hover:bg-yellow-100 cursor-pointer' 
                          : 'bg-green-50 hover:bg-green-100 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 text-left">
                    {isCurrentRpc && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <span className={`truncate ${ep.isBlacklisted ? 'text-red-600' : isCurrentRpc ? 'text-blue-800 font-medium' : ''}`}>
                      {ep.url.split('//')[1]?.split('/')[0] || ep.url}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {ep.failures > 0 && (
                      <span className="text-orange-600">F:{ep.failures}</span>
                    )}
                    {ep.isBlacklisted && (
                      <span className="text-red-600">BL</span>
                    )}
                    {isCurrentRpc && (
                      <span className="text-blue-600 font-medium">Active</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setShowDetails(false)}
            className="mt-2 w-full text-center text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
