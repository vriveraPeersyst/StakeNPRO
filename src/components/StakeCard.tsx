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
        </div>

        <button
          onClick={handleStake}
          disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || stakeLoading || !isConnected}
          className="flex flex-row justify-center items-center py-3.5 px-5 gap-2 w-full h-[52px] bg-[#5F8AFA] rounded-[100px] font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-white hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {stakeLoading ? 'Staking...' : 'Stake NEAR'}
        </button>

        {stakeTxHash && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-sf text-sm text-green-800">
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
            {/* NEAR Token Row */}
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
                  {formatNearAmount(total)} NEAR
                </div>
                <div className="w-full font-sf font-semibold text-xs leading-4 tracking-[-0.01em] text-[#999999]">
                  {priceData && `$${((parseFloat(formatNearAmount(total)) || 0) * priceData.usd).toFixed(2)}`}
                </div>
              </div>
              
              {/* Unstake Button */}
              <button
                onClick={handleUnstake}
                disabled={unstakeLoading || !staked || staked === '0'}
                className="flex flex-row justify-center items-center px-4 py-2 gap-2 w-[95px] h-10 bg-[#F6F6F6] rounded-[100px] font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-[#3F4246] hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-none"
              >
                {unstakeLoading ? 'Unstaking...' : 'Unstake'}
              </button>
            </div>
            
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

        {/* Transaction Status Messages */}
        {unstaked && unstaked !== '0' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg w-full">
            <p className="font-sf text-sm text-orange-800 mb-2">
              <strong>Unstaking takes ~30–37 hours</strong> (4 epochs; ~43,200 blocks per epoch ≈ 7 hours). 
              When ready, Withdraw will activate.
            </p>
            <p className="font-sf text-sm text-orange-700">
              Unstaked amount: {formatNearAmount(unstaked)} NEAR
            </p>
          </div>
        )}

        {/* Withdraw button */}
        {canWithdraw && unstaked && unstaked !== '0' && (
          <button
            onClick={handleWithdraw}
            disabled={withdrawLoading}
            className="w-full h-13 bg-primary text-white rounded-pill font-sf font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawLoading ? 'Withdrawing...' : `Withdraw ${formatNearAmount(unstaked)} NEAR`}
          </button>
        )}

        {/* Transaction status */}
        {unstakeTxHash && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg w-full">
            <p className="font-sf text-sm text-orange-800">
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
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg w-full">
            <p className="font-sf text-sm text-green-800">
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
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h3 className="font-sf text-xl font-semibold text-nm-text mb-4">Why stake to earn NPRO?</h3>
        
        <div className="space-y-4 text-nm-text">
          <p className="font-sf">
            NPRO is the native token of the NEAR Mobile ecosystem. By staking your NEAR tokens 
            to the NPRO validator, you're not only securing the NEAR network but also earning 
            NPRO rewards.
          </p>
          
          <h4 className="font-sf text-lg font-semibold">Benefits of staking to NPRO:</h4>
          <ul className="list-disc list-inside space-y-2 text-nm-muted">
            <li className="font-sf">Earn both NEAR staking rewards and NPRO tokens</li>
            <li className="font-sf">Support the decentralization of the NEAR network</li>
            <li className="font-sf">Get early access to NEAR Mobile features</li>
            <li className="font-sf">Participate in the NPRO governance ecosystem</li>
          </ul>

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-teal/10 rounded-2xl">
            <h4 className="font-sf font-semibold mb-2">NPRO Token Utility</h4>
            <p className="font-sf text-sm text-nm-muted">
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
          <p className="font-sf text-nm-muted">Bonding Curve Chart</p>
        </div>
        <p className="font-sf text-sm text-nm-muted mt-4">
          NPRO distribution follows a bonding curve that rewards early and long-term stakers
        </p>
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
