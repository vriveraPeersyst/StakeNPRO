'use client'

import { useState, useEffect } from 'react'
import { rpcManager } from '@/lib/rpcManager'

export function RpcStatus() {
  const [status, setStatus] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const updateStatus = () => {
      setStatus(rpcManager.getStatus())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

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
            Current: {status.currentUrl.split('//')[1]?.split('/')[0] || 'unknown'}
          </div>
          
          <div className="space-y-1">
            {status.endpoints.map((ep: any, i: number) => (
              <div
                key={i}
                className={`flex justify-between items-center p-1 rounded text-xs ${
                  ep.isBlacklisted ? 'bg-red-50' : ep.failures > 0 ? 'bg-yellow-50' : 'bg-green-50'
                }`}
              >
                <span className={`truncate flex-1 ${ep.isBlacklisted ? 'text-red-600' : ''}`}>
                  {ep.url.split('//')[1]?.split('/')[0] || ep.url}
                </span>
                <div className="flex gap-2 text-xs">
                  {ep.failures > 0 && (
                    <span className="text-orange-600">F:{ep.failures}</span>
                  )}
                  {ep.isBlacklisted && (
                    <span className="text-red-600">BL</span>
                  )}
                </div>
              </div>
            ))}
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
