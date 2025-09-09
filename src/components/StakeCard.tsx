'use client'

import { useState } from 'react'
import AmountInput from './AmountInput'
import { useWallet } from '@/hooks/useWallet'
import { useBalances } from '@/hooks/useBalances'
import { useStake } from '@/hooks/useStake'
import { useUnstake } from '@/hooks/useUnstake'
import { useWithdraw } from '@/hooks/useWithdraw'
import { formatNearAmount, NEAR_BUFFER } from '@/lib/pool'
import { useQuery } from '@tanstack/react-query'
import { getNearPrice } from '@/lib/prices'

type Tab = 'stake' | 'position' | 'why'

export default function StakeCard() {
  const [activeTab, setActiveTab] = useState<Tab>('stake')
  const [stakeAmount, setStakeAmount] = useState('')
  
  const { isConnected, accountId, signIn } = useWallet()
  const { staked, unstaked, total, canWithdraw, isLoading: balancesLoading } = useBalances()
  const { stake, isLoading: stakeLoading, txHash: stakeTxHash } = useStake()
  const { unstake, isLoading: unstakeLoading, txHash: unstakeTxHash } = useUnstake()
  const { withdraw, isLoading: withdrawLoading, txHash: withdrawTxHash } = useWithdraw()

  // Fetch NEAR price for fiat display
  const { data: priceData } = useQuery({
    queryKey: ['nearPrice'],
    queryFn: getNearPrice,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    enabled: process.env.NEXT_PUBLIC_SHOW_FIAT === 'true',
  })

  const handleMaxClick = () => {
    if (!isConnected) return
    // TODO: Get actual wallet balance and subtract buffer
    // For now, set a placeholder amount
    setStakeAmount('1.0')
  }

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return
    stake(stakeAmount)
  }

  const handleUnstake = () => {
    if (!staked || staked === '0') return
    unstake(staked) // Unstake all
  }

  const handleWithdraw = () => {
    withdraw()
  }

  const tabs = [
    { id: 'stake' as Tab, label: 'Stake', active: activeTab === 'stake' },
    { id: 'position' as Tab, label: 'My position', active: activeTab === 'position' },
    { id: 'why' as Tab, label: 'Why stake to earn NPRO', active: activeTab === 'why' },
  ]

  const renderStakeTab = () => {
    if (!isConnected) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-base leading-6 font-semibold text-nm-text mb-4">
              Amount
            </label>
            <AmountInput
              value={stakeAmount}
              onChange={setStakeAmount}
              onMaxClick={handleMaxClick}
              disabled={true}
              nearPrice={priceData?.usd}
            />
          </div>

          <button
            onClick={signIn}
            className="flex flex-row justify-center items-center py-3.5 px-5 gap-2 w-full h-13 bg-[#E5ECFE] rounded-[100px] font-medium text-base leading-6 text-center tracking-[-0.01em] text-[#5F8AFA] hover:opacity-80 transition-opacity"
          >
            Connect Wallet
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-base leading-6 font-semibold text-nm-text mb-4">
            Amount
          </label>
          <AmountInput
            value={stakeAmount}
            onChange={setStakeAmount}
            onMaxClick={handleMaxClick}
            disabled={stakeLoading}
            nearPrice={priceData?.usd}
          />
        </div>

        <button
          onClick={handleStake}
          disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || stakeLoading || !isConnected}
          className="w-full h-13 bg-nm-cta text-primary rounded-pill font-semibold text-base hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {stakeLoading ? 'Staking...' : 'Stake NEAR'}
        </button>

        {stakeTxHash && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Transaction successful!{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_EXPLORER_BASE}/txns/${stakeTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                View on explorer
              </a>
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderPositionTab = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col justify-center items-center py-6 px-32 gap-4 w-full h-76 bg-white border-b border-[#E5E5E5]">
          <h2 className="w-full max-w-[504px] h-8 font-medium text-2xl leading-8 text-center tracking-[-0.01em] text-[#3F4246]">
            You haven't connected your Wallet yet.
          </h2>
          <p className="w-full max-w-[504px] h-12 font-normal text-base leading-6 text-center tracking-[-0.01em] text-[#999999]">
            Connect your Wallet now and start staking NEAR to be among the first users to earn NPRO.
          </p>
          <button
            onClick={signIn}
            className="flex flex-row justify-center items-center py-3.5 px-5 gap-2 w-39 h-13 bg-[#E5ECFE] rounded-[100px] font-medium text-base leading-6 text-center tracking-[-0.01em] text-[#5F8AFA] hover:opacity-80 transition-opacity"
          >
            Connect Wallet
          </button>
        </div>
      )
    }

    if (balancesLoading) {
      return (
        <div className="text-center py-8">
          <p className="text-nm-muted">Loading your position...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Earning NPRO Card */}
        <div className="p-4 border border-nm-border rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-nm-text">Earning NPRO</h3>
            <button
              onClick={handleUnstake}
              disabled={unstakeLoading || !staked || staked === '0'}
              className="px-4 py-2 bg-nm-cta text-primary rounded-pill font-semibold text-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {unstakeLoading ? 'Unstaking...' : 'Unstake'}
            </button>
          </div>
          
          <div className="space-y-2">
            {priceData && (
              <p className="text-2xl font-bold text-nm-text">
                ${((parseFloat(formatNearAmount(total)) || 0) * priceData.usd).toFixed(2)}
              </p>
            )}
            <p className="text-lg text-nm-muted">
              {formatNearAmount(total)} NEAR
            </p>
            <p className="text-sm text-nm-muted">
              NPRO earned: <span className="font-mono">Coming soon...</span>
            </p>
          </div>
        </div>

        {/* Unstaking info */}
        {unstaked && unstaked !== '0' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 mb-2">
              <strong>Unstaking takes ~30–37 hours</strong> (4 epochs; ~43,200 blocks per epoch ≈ 7 hours). 
              When ready, Withdraw will activate.
            </p>
            <p className="text-sm text-orange-700">
              Unstaked amount: {formatNearAmount(unstaked)} NEAR
            </p>
          </div>
        )}

        {/* Withdraw button */}
        {canWithdraw && unstaked && unstaked !== '0' && (
          <button
            onClick={handleWithdraw}
            disabled={withdrawLoading}
            className="w-full h-13 bg-primary text-white rounded-pill font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawLoading ? 'Withdrawing...' : `Withdraw ${formatNearAmount(unstaked)} NEAR`}
          </button>
        )}

        {/* Transaction status */}
        {unstakeTxHash && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              Unstake transaction successful!{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_EXPLORER_BASE}/txns/${unstakeTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                View on explorer
              </a>
            </p>
          </div>
        )}

        {withdrawTxHash && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Withdraw transaction successful!{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_EXPLORER_BASE}/txns/${withdrawTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                View on explorer
              </a>
            </p>
          </div>
        )}

        {/* About NPRO */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">About NPRO distribution</h4>
          <p className="text-sm text-blue-800">
            NPRO tokens are distributed to stakers based on their staking duration and amount. 
            The longer you stake, the more NPRO you earn. Distribution details coming soon.
          </p>
        </div>
      </div>
    )
  }

  const renderWhyTab = () => (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h3 className="text-xl font-semibold text-nm-text mb-4">Why stake to earn NPRO?</h3>
        
        <div className="space-y-4 text-nm-text">
          <p>
            NPRO is the native token of the NEAR Mobile ecosystem. By staking your NEAR tokens 
            to the NPRO validator, you're not only securing the NEAR network but also earning 
            NPRO rewards.
          </p>
          
          <h4 className="text-lg font-semibold">Benefits of staking to NPRO:</h4>
          <ul className="list-disc list-inside space-y-2 text-nm-muted">
            <li>Earn both NEAR staking rewards and NPRO tokens</li>
            <li>Support the decentralization of the NEAR network</li>
            <li>Get early access to NEAR Mobile features</li>
            <li>Participate in the NPRO governance ecosystem</li>
          </ul>

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-teal/10 rounded-2xl">
            <h4 className="font-semibold mb-2">NPRO Token Utility</h4>
            <p className="text-sm text-nm-muted">
              NPRO tokens will provide access to premium features in the NEAR Mobile app, 
              governance voting rights, and exclusive rewards. The token economics are designed 
              to create long-term value for the NEAR ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder bonding curve chart */}
      <div className="mt-8 p-8 bg-nm-chip rounded-2xl text-center">
        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-teal/20 rounded-xl flex items-center justify-center">
          <p className="text-nm-muted">Bonding Curve Chart</p>
        </div>
        <p className="text-sm text-nm-muted mt-4">
          NPRO distribution follows a bonding curve that rewards early and long-term stakers
        </p>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-[760px] mx-auto">
      <div className="flex flex-col items-start w-full h-96 bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden">
        {/* Tabs Header */}
        <div className="h-20 border-b border-[#E5E5E5] bg-white w-full">
          <div className="flex items-center px-0 pr-6 h-full">
            <div className="flex items-center px-6 gap-6 h-full">
              {tabs.map((tab, index) => {
                const widths = ['w-[42px]', 'w-[88px]', 'w-[182px]']
                const width = widths[index] || 'w-auto'
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex justify-center items-center h-20 ${width} transition-colors ${
                      tab.active 
                        ? 'text-[#3F4246] font-medium border-b-2 border-[#5F8AFA]' 
                        : index === 0
                          ? 'text-[#999999] font-normal hover:text-[#3F4246]'
                          : 'text-[#999999] font-normal hover:text-[#3F4246]'
                    }`}
                    style={{
                      fontSize: '16px',
                      lineHeight: '24px',
                      letterSpacing: '-0.01em',
                      textAlign: 'center'
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 w-full flex-1">
          {activeTab === 'stake' && renderStakeTab()}
          {activeTab === 'position' && renderPositionTab()}
          {activeTab === 'why' && renderWhyTab()}
        </div>
      </div>
    </div>
  )
}
