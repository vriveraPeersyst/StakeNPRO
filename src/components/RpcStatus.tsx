'use client'

import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRpcStatus } from '@/hooks/useRpcStatus'

export function RpcStatus() {
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
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg border p-3 text-xs max-h-96 overflow-y-auto">
          <div className="font-semibold mb-2 flex justify-between items-center">
            <span>RPC Status</span>
            <button
              onClick={() => setShowAddRpc(!showAddRpc)}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
            >
              + Add RPC
            </button>
          </div>
          
          <div className="mb-2 text-green-600">
            Current: {currentUrl.split('//')[1]?.split('/')[0] || 'unknown'}
          </div>

          {showAddRpc && (
            <div className="mb-3 p-2 bg-gray-50 rounded border">
              <div className="font-medium mb-2">Add Custom RPC</div>
              <input
                type="text"
                value={newRpcUrl}
                onChange={(e) => setNewRpcUrl(e.target.value)}
                placeholder="https://your-rpc-endpoint.com"
                className="w-full px-2 py-1 border rounded text-xs mb-2"
              />
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="makeItPrimary"
                  checked={makeItPrimary}
                  onChange={(e) => setMakeItPrimary(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="makeItPrimary" className="text-xs">
                  Make it primary and switch to it
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustomRpc}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddRpc(false)
                    setNewRpcUrl('')
                    setMakeItPrimary(false)
                  }}
                  className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="mb-3 text-gray-600 text-xs">
            Click on any RPC to switch to it
          </div>
          
          <div className="space-y-1">
            {status.endpoints.map((ep: any, i: number) => {
              const isCurrentRpc = currentUrl === ep.url
              return (
                <div
                  key={i}
                  className={`w-full flex justify-between items-center p-2 rounded text-xs transition-colors ${
                    isCurrentRpc 
                      ? 'bg-blue-100 border-2 border-blue-300 text-blue-800' 
                      : ep.isBlacklisted 
                        ? 'bg-red-50 text-red-400' 
                        : ep.failures > 0 
                          ? 'bg-yellow-50' 
                          : 'bg-green-50'
                  }`}
                >
                  <button
                    onClick={() => !ep.isBlacklisted && handleRpcSwitch(ep.url)}
                    disabled={ep.isBlacklisted}
                    className={`flex items-center gap-2 flex-1 text-left ${
                      ep.isBlacklisted ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                    }`}
                  >
                    {isCurrentRpc && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <span className={`truncate ${ep.isBlacklisted ? 'text-red-600' : isCurrentRpc ? 'text-blue-800 font-medium' : ''}`}>
                      {ep.url.split('//')[1]?.split('/')[0] || ep.url}
                    </span>
                  </button>
                  <div className="flex gap-2 items-center text-xs">
                    {ep.failures > 0 && (
                      <span className="text-orange-600">F:{ep.failures}</span>
                    )}
                    {ep.isBlacklisted && (
                      <span className="text-red-600">BL</span>
                    )}
                    {isCurrentRpc && (
                      <span className="text-blue-600 font-medium">Active</span>
                    )}
                    {!ep.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveRpc(ep.url)
                        }}
                        className="ml-1 px-1 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        title="Remove custom RPC"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          <button
            onClick={() => setShowDetails(false)}
            className="mt-2 w-full text-center text-gray-500 hover:text-gray-700"
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
              className="mt-1 w-full text-center text-red-500 hover:text-red-700 text-xs"
            >
              Reset to Defaults
            </button>
          )}
        </div>
      )}
    </div>
  )
}
