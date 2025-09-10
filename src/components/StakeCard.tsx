'use client'

import { useState } from 'react'
import AmountInput from './AmountInput'
import AccountDropdown from './AccountDropdown'
import { useWallet } from '@/hooks/useWallet'
import { useBalances } from '@/hooks/useBalances'
import { useWalletBalance } from '@/hooks/useWalletBalance'
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
  const [selectedPercentage, setSelectedPercentage] = useState<string | null>(null)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [unstakeSelectedPercentage, setUnstakeSelectedPercentage] = useState<string | null>(null)
  
  const { isConnected, accountId, signIn, signOut } = useWallet()
  const { staked, unstaked, total, canWithdraw, isLoading: balancesLoading } = useBalances()
  const { balance, calculatePercentageAmount, getMaxAmount, isLoading: walletBalanceLoading } = useWalletBalance()
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
    const maxAmount = getMaxAmount()
    setStakeAmount(maxAmount)
    setSelectedPercentage('Max')
  }

  const handlePercentageClick = (percentage: string, value: number) => {
    if (!isConnected) return
    const amount = calculatePercentageAmount(value)
    setStakeAmount(amount)
    setSelectedPercentage(percentage)
  }

  const handleAmountChange = (value: string) => {
    setStakeAmount(value)
    // Clear percentage selection when user manually types
    if (selectedPercentage) {
      setSelectedPercentage(null)
    }
  }

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return
    stake(stakeAmount)
  }

  const handleUnstake = () => {
    if (!staked || staked === '0') return
    setShowUnstakeModal(true)
  }

  const handleUnstakeAmount = () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) return
    unstake(unstakeAmount)
    setShowUnstakeModal(false)
    setUnstakeAmount('')
    setUnstakeSelectedPercentage(null)
  }

  const handleUnstakeAll = () => {
    if (!staked || staked === '0') return
    // Convert yoctoNEAR to NEAR format for the unstake function
    const stakedInNear = formatNearAmount(staked)
    unstake(stakedInNear) // Unstake all
    setShowUnstakeModal(false)
  }

  const handleUnstakeAmountChange = (value: string) => {
    setUnstakeAmount(value)
    if (unstakeSelectedPercentage) {
      setUnstakeSelectedPercentage(null)
    }
  }

  const handleUnstakePercentageClick = (percentage: string, value: number) => {
    if (!staked || staked === '0') return
    const stakedInNear = parseFloat(formatNearAmount(staked))
    const amount = (stakedInNear * value).toFixed(6)
    setUnstakeAmount(amount)
    setUnstakeSelectedPercentage(percentage)
  }

  const handleUnstakeMaxClick = () => {
    if (!staked || staked === '0') return
    const stakedInNear = formatNearAmount(staked)
    setUnstakeAmount(stakedInNear)
    setUnstakeSelectedPercentage('Max')
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
              onChange={handleAmountChange}
              onMaxClick={handleMaxClick}
              onPercentageClick={handlePercentageClick}
              disabled={true}
              nearPrice={priceData?.usd}
              isConnected={false}
              selectedPercentage={null}
            />
          </div>

          <button
            onClick={signIn}
            className="flex flex-row justify-center items-center py-3.5 px-5 gap-2 w-full h-[52px] bg-[#E5ECFE] rounded-[100px] font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-[#5F8AFA] hover:opacity-80 transition-opacity"
          >
            Connect Wallet
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <label className="block font-sf text-base leading-6 font-semibold text-nm-text mb-4">
            Amount
          </label>
          <AmountInput
            value={stakeAmount}
            onChange={handleAmountChange}
            onMaxClick={handleMaxClick}
            onPercentageClick={handlePercentageClick}
            disabled={stakeLoading}
            nearPrice={priceData?.usd}
            isConnected={isConnected}
            selectedPercentage={selectedPercentage}
            availableBalance={balance}
            isBalanceLoading={walletBalanceLoading}
          />
          
          {/* Gas Fee Warning */}
          <div className="mt-2 flex items-start gap-2">
            <svg className="w-4 h-4 text-[#999999] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-sf text-xs text-[#999999] leading-4">
              0.1 NEAR is reserved for unstaking and storage fees
            </p>
          </div>
        </div>

        <button
          onClick={handleStake}
          disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || stakeLoading || !isConnected}
          className="flex flex-row justify-center items-center py-3.5 px-5 gap-2 w-full h-[52px] bg-[#5F8AFA] rounded-[100px] font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-white hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {stakeLoading ? 'Staking...' : 'Stake NEAR'}
        </button>

        {stakeTxHash && (
          <div className="p-3 bg-teal/10 border border-teal/30 rounded-lg">
            <p className="font-sf text-sm text-teal">
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
        <div className="flex flex-col justify-center items-center py-8 px-8 gap-4 w-full bg-white">
          <h2 className="w-full max-w-[504px] font-sf font-medium text-2xl leading-8 text-center tracking-[-0.01em] text-[#3F4246]">
            You haven't connected your Wallet yet.
          </h2>
          <p className="w-full max-w-[504px] font-sf font-normal text-base leading-6 text-center tracking-[-0.01em] text-[#999999]">
            Connect your Wallet now and start staking NEAR to be among the first users to earn NPRO.
          </p>
          <button
            onClick={signIn}
            className="flex flex-row justify-center items-center py-3.5 px-5 gap-2 w-39 h-13 bg-[#E5ECFE] rounded-[100px] font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-[#5F8AFA] hover:opacity-80 transition-opacity"
          >
            Connect Wallet
          </button>
        </div>
      )
    }

    if (balancesLoading) {
      return (
        <div className="text-center py-8">
          <p className="font-sf text-nm-muted">Loading your position...</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-start p-0 gap-6 w-full bg-white">
        {/* Earning NPRO Section */}
        <div className="flex flex-col items-start gap-4 w-full">
          <h3 className="w-full font-sf font-medium text-base leading-6 tracking-[-0.01em] text-[#3F4246]">
            Earning NPRO
          </h3>
          
          {/* Token List */}
          <div className="flex flex-col items-start gap-5 w-full">
            {/* Staked NEAR Token Row - Only show if there's staked balance */}
            {staked && staked !== '0' && (
              <div className="flex flex-col items-start gap-4 w-full">
                <div className="flex flex-row justify-center items-center gap-6 w-full h-11 bg-white">
                  {/* NEAR Icon */}
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-none">
                    <img 
                      src="/icons/neartoken.svg" 
                      alt="NEAR Token" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Token Info */}
                  <div className="flex flex-col justify-center items-start flex-1">
                    <div className="w-full font-sf font-semibold text-sm leading-5 tracking-[-0.01em] text-[#3F4246]">
                      {formatNearAmount(staked)} NEAR (Staked)
                    </div>
                    <div className="w-full font-sf font-semibold text-xs leading-4 tracking-[-0.01em] text-[#999999]">
                      {priceData && `$${((parseFloat(formatNearAmount(staked)) || 0) * priceData.usd).toFixed(2)}`}
                    </div>
                  </div>
                  
                  {/* Unstake Button */}
                  <button
                    onClick={handleUnstake}
                    disabled={unstakeLoading}
                    className="flex flex-row justify-center items-center px-4 py-2 gap-2 w-[95px] h-10 bg-[#F6F6F6] rounded-[100px] font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-[#3F4246] hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-none"
                  >
                    {unstakeLoading ? 'Unstaking...' : 'Unstake'}
                  </button>
                </div>

                {/* Unstake Form - Show when modal is open */}
                {showUnstakeModal && (
                  <div className="w-full bg-[#F8F9FA] rounded-xl p-4 border border-[#E5E5E5]">
                    {/* Form Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-sf font-semibold text-base leading-6 text-[#3F4246]">
                        Choose amount to unstake
                      </h4>
                      <button
                        onClick={() => {
                          setShowUnstakeModal(false)
                          setUnstakeAmount('')
                          setUnstakeSelectedPercentage(null)
                        }}
                        className="w-5 h-5 flex items-center justify-center text-[#999999] hover:text-[#3F4246] font-sf text-sm"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-4">
                      <AmountInput
                        value={unstakeAmount}
                        onChange={handleUnstakeAmountChange}
                        onMaxClick={handleUnstakeMaxClick}
                        onPercentageClick={handleUnstakePercentageClick}
                        disabled={unstakeLoading}
                        nearPrice={priceData?.usd}
                        isConnected={true}
                        selectedPercentage={unstakeSelectedPercentage}
                        availableBalance={formatNearAmount(staked)}
                        isBalanceLoading={balancesLoading}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row gap-3">
                      {/* Unstake Specific Amount */}
                      <button
                        onClick={handleUnstakeAmount}
                        disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0 || unstakeLoading}
                        className="flex-1 flex flex-row justify-center items-center py-2.5 px-4 gap-2 h-10 bg-[#5F8AFA] rounded-[100px] font-sf font-medium text-sm leading-5 text-center tracking-[-0.01em] text-white hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {unstakeLoading ? 'Unstaking...' : 'Unstake'}
                      </button>

                      {/* Unstake All */}
                      <button
                        onClick={handleUnstakeAll}
                        disabled={unstakeLoading}
                        className="flex-1 flex flex-row justify-center items-center py-2.5 px-4 gap-2 h-10 bg-[#F6F6F6] rounded-[100px] font-sf font-medium text-sm leading-5 text-center tracking-[-0.01em] text-[#3F4246] hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {unstakeLoading ? 'Unstaking...' : 'Unstake All'}
                      </button>
                    </div>

                    {/* Info Message */}
                    <div className="mt-3 p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-sf text-xs text-orange-800">
                        <strong>Note:</strong> Unstaking takes ~30–37 hours (4 epochs).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Unstaked NEAR Token Row - Only show if there's unstaked balance */}
            {unstaked && unstaked !== '0' && (
              <div className="flex flex-row justify-center items-center gap-6 w-full h-11 bg-white">
                {/* NEAR Icon */}
                <div className="w-11 h-11 rounded-full overflow-hidden flex-none">
                  <img 
                    src="/icons/neartoken.svg" 
                    alt="NEAR Token" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Token Info */}
                <div className="flex flex-col justify-center items-start flex-1">
                  <div className="w-full font-sf font-semibold text-sm leading-5 tracking-[-0.01em] text-[#3F4246]">
                    {formatNearAmount(unstaked)} NEAR (Unstaking)
                  </div>
                  <div className="w-full font-sf font-semibold text-xs leading-4 tracking-[-0.01em] text-[#999999]">
                    {canWithdraw ? 'Ready to withdraw' : 'Pending (~30-37 hours)'}
                  </div>
                </div>
                
                {/* Withdraw Button - Only show if ready */}
                {canWithdraw ? (
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawLoading}
                    className="flex flex-row justify-center items-center px-4 py-2 gap-2 w-[95px] h-10 bg-[#5F8AFA] rounded-[100px] font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-white hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-none"
                  >
                    {withdrawLoading ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                ) : (
                  <div className="w-[95px] h-10 flex items-center justify-center">
                    <span className="font-sf font-normal text-xs text-[#999999]">Waiting</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Show message if no staked or unstaked balance */}
            {(!staked || staked === '0') && (!unstaked || unstaked === '0') && (
              <div className="flex flex-row justify-center items-center gap-6 w-full h-11 bg-white">
                <div className="w-11 h-11 rounded-full overflow-hidden flex-none">
                  <img 
                    src="/icons/neartoken.svg" 
                    alt="NEAR Token" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center items-start flex-1">
                  <div className="w-full font-sf font-semibold text-sm leading-5 tracking-[-0.01em] text-[#3F4246]">
                    0 NEAR
                  </div>
                  <div className="w-full font-sf font-semibold text-xs leading-4 tracking-[-0.01em] text-[#999999]">
                    No staked balance yet
                  </div>
                </div>
              </div>
            )}
            
            {/* NPRO Token Row */}
            <div className="flex flex-row justify-center items-center gap-6 w-full h-11 bg-white">
              {/* NPRO Icon */}
              <div className="w-11 h-11 rounded-full overflow-hidden flex-none">
                <img 
                  src="/icons/npro-token.svg" 
                  alt="NPRO Token" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Token Info */}
              <div className="flex flex-col justify-center items-start flex-1">
                <div className="w-full font-sf font-medium text-xs leading-4 tracking-[-0.01em] text-[#3F4246]">
                  NPRO earned
                </div>
                <div className="w-full font-sf font-semibold text-sm leading-5 tracking-[-0.01em] text-[#3F4246]">
                  Coming soon...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Callout */}
        <div className="flex flex-col items-start p-3 gap-3 w-full bg-[rgba(95,138,250,0.2)] rounded-xl">
          <div className="flex flex-row items-start gap-3 w-full">
            {/* Info Icon */}
            <svg className="w-6 h-6 flex-none mt-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#3F4246" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            {/* Text Content */}
            <div className="flex flex-col justify-center items-start flex-1">
              <div className="w-full font-sf font-medium text-sm leading-5 tracking-[-0.01em] text-[#3F4246]">
                NPRO Token Distribution
              </div>
              <div className="w-full font-sf font-normal text-sm leading-5 tracking-[-0.01em] text-[#3F4246]">
                NPRO tokens are distributed to stakers based on their staking duration and amount. The longer you stake, the more NPRO you earn.
              </div>
            </div>
          </div>
        </div>

        {/* Transaction status messages - Keep only the essential ones */}
        {unstakeTxHash && (
          <div className="p-3 bg-teal/10 border border-teal/30 rounded-lg w-full">
            <p className="font-sf text-sm text-teal">
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
          <div className="p-3 bg-teal/10 border border-teal/30 rounded-lg w-full">
            <p className="font-sf text-sm text-teal">
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
      </div>
    )
  }

  const renderWhyTab = () => (
    <div className="w-full bg-white">
      {/* Content aligned with header padding */}
      <div className="flex flex-col items-start px-0 py-1 gap-4 w-full">
        {/* Main Title */}
        <h3 className="font-sf font-medium text-2xl leading-8 tracking-[-0.01em] text-[#3F4246]">
          Gain an advantage by being among the first to get NPRO
        </h3>
        
        {/* Cards Container */}
        <div className="flex flex-col items-start gap-5 w-full">
          {/* Chart and Description Row */}
          <div className="flex flex-row items-start gap-5 w-full">
            {/* Chart Image */}
            <div className="w-[357px] h-[247px] flex-none">
              <img 
                src="/icons/BondingCurve.svg" 
                alt="Bonding Curve Chart" 
                className="w-full h-full object-cover"
                style={{ filter: 'drop-shadow(0px 4px 16px rgba(63, 66, 70, 0.03))' }}
              />
            </div>
            
            {/* Description Text */}
            <div className="flex-1">
              <p className="font-sf font-normal text-base leading-6 tracking-[-0.01em] text-[#999999]">
                NPRO is the NEAR Mobile token. It's value is backed through NEAR staking and will be tradable as any other popular cryptocurrencies on the app and exchanges. It will unlock superpowers on the NEAR app reducing fees and providing a complete toolking for trading crypto.
              </p>
            </div>
          </div>
          
          {/* Long Description Text */}
          <div className="w-full">
            <p className="font-sf font-normal text-base leading-6 tracking-[-0.01em] text-[#999999]">
              The amount of NPRO tokens released decreases every epoch following a bonding curve, rewarding early adopters with a decay parameter to only 25% on the last epoch to maintain the rewards interesting throughout the 5-year period. This creates natural scarcity as the token becomes progressively harder to obtain. This scarcity mechanism enhances long-term value proposition for NPRO holders, combined with required holdings to unlock premium features and the automatic liquidity mechanism, generating upward pressure to position NPRO as a strong investment opportunity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-[760px] mx-auto">
      <div className="flex flex-col items-start w-full min-h-fit bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden">
        {/* Tabs Header */}
        <div className="h-20 border-b border-[#E5E5E5] bg-white w-full">
          <div className="flex items-center justify-between px-0 pr-6 h-full">
            <div className="flex items-center px-6 gap-6 h-full">
              {tabs.map((tab, index) => {
                const widths = ['w-[42px]', 'w-[88px]', 'w-[182px]']
                const width = widths[index] || 'w-auto'
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex justify-center items-center h-20 ${width} transition-colors font-sf ${
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
            
            {/* Account Dropdown - Right side */}
            <div className="flex items-center">
              {isConnected && accountId && (
                <AccountDropdown accountId={accountId} onSignOut={signOut} />
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 w-full">
          {activeTab === 'stake' && renderStakeTab()}
          {activeTab === 'position' && renderPositionTab()}
          {activeTab === 'why' && renderWhyTab()}
        </div>
      </div>
    </div>
  )
}
