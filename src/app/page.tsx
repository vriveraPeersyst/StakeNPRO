'use client'

import { Suspense, useState } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import StakeCard from '@/components/StakeCard'
import AppBanner from '@/components/AppBanner'
import NPROCalculatorBanner from '@/components/NPROCalculatorBanner'
import NPROCalculatorModal from '@/components/NPROCalculatorModal'
import FooterBar from '@/components/FooterBar'
import { useEarnedNpro } from '@/hooks/useEarnedNpro'
import { useTotalStaked } from '@/hooks/useTotalStaked'
import { useBalances } from '@/hooks/useBalances'

export default function HomePage() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const { earnedNpro } = useEarnedNpro();
  const { totalStaked } = useTotalStaked();
  const { staked } = useBalances();

  return (
    <div className="min-h-screen bg-nm-header">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src="/icons/Background.svg" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="pt-3 sm:pt-4 md:pt-8 pb-4 sm:pb-6 md:pb-12">
          <Navbar />
        </header>

        {/* Main content area */}
        <main className="flex-1 flex flex-col items-center justify-center mt-4 sm:mt-8 md:mt-24">
          {/* Hero section */}
          <section className="text-center mb-6 sm:mb-8 md:mb-12 px-4" aria-labelledby="hero-title">
            <h1 id="hero-title" className="text-xl sm:text-2xl md:text-4xl leading-7 sm:leading-8 md:leading-12 font-semibold text-nm-text tracking-tight">
              Stake NEAR.{' '}
              <span className="inline-flex items-center gap-1 sm:gap-2">
                Earn 
                {/* NPRO 3D Icon */}
                <Image 
                  src="/icons/npro3dicon.png" 
                  alt="NPRO Token" 
                  width={72}
                  height={72}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-18 lg:h-18"
                  quality={95}
                  priority
                />
              </span>{' '}
              NPRO now.
            </h1>
            <p className="sr-only">
              Stake NEAR Protocol tokens with the official NEAR Mobile validator and earn NPRO rewards. 
              Secure, transparent, and high-yield staking on the NEAR blockchain.
            </p>
          </section>

          {/* Main container with Calculator, StakeCard and AppBanner */}
          <div className="flex flex-col items-start gap-2 w-full max-w-[760px] mx-auto -mt-2 sm:-mt-4 md:-mt-8 mb-6 sm:mb-8 md:mb-16 px-4">
            {/* NPRO Calculator Section */}
            <section className="w-full" aria-labelledby="calculator-section">
              <h2 id="calculator-section" className="sr-only">NPRO Rewards Calculator</h2>
              <NPROCalculatorBanner onCalculateClick={() => setIsCalculatorOpen(true)} />
            </section>
            
            {/* Staking Interface Section */}
            <section className="w-full" aria-labelledby="staking-section">
              <h2 id="staking-section" className="sr-only">NEAR Token Staking Interface</h2>
              <Suspense fallback={
                <div className="w-full max-w-[760px] mx-auto h-96 flex items-center justify-center">
                  <p className="text-nm-muted">Loading...</p>
                </div>
              }>
                <StakeCard />
              </Suspense>
            </section>
            
            {/* Mobile App Promotion Section */}
            <section className="w-full" aria-labelledby="app-section">
              <h2 id="app-section" className="sr-only">NEAR Mobile App Download</h2>
              <AppBanner />
            </section>
          </div>
        </main>

        {/* Footer */}
        <FooterBar />
      </div>

      {/* NPRO Calculator Modal */}
      <NPROCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        currentPoolTotal={totalStaked}
        userEarnedNpro={earnedNpro}
        userStakedBalance={staked}
      />
    </div>
  )
}
