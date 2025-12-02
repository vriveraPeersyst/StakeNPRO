'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

// Component that handles URL search params
function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const { earnedNpro, rheaBoost } = useEarnedNpro();
  const { totalStaked } = useTotalStaked();
  const { staked } = useBalances();

  // Initialize modal state from URL parameters
  useEffect(() => {
    const calculatorParam = searchParams.get('calculator');
    setIsCalculatorOpen(calculatorParam === 'open');
  }, [searchParams]);

  // Handle opening the calculator
  const handleCalculatorOpen = () => {
    setIsCalculatorOpen(true);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('calculator', 'open');
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  // Handle closing the calculator
  const handleCalculatorClose = () => {
    setIsCalculatorOpen(false);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('calculator');
    const paramString = newParams.toString();
    router.push(paramString ? `?${paramString}` : '/', { scroll: false });
  };

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
              <NPROCalculatorBanner onCalculateClick={handleCalculatorOpen} />
            </section>
            
            {/* Staking Interface Section */}
            <section className="w-full" aria-labelledby="staking-section">
              <h2 id="staking-section" className="sr-only">NEAR Token Staking Interface</h2>
              <StakeCard />
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
        onClose={handleCalculatorClose}
        currentPoolTotal={totalStaked}
        userEarnedNpro={earnedNpro}
        userRheaBoost={rheaBoost}
        userStakedBalance={staked}
      />
    </div>
  )
}

// Main page component with Suspense wrapper
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-nm-header flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-nm-muted">Loading...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}
