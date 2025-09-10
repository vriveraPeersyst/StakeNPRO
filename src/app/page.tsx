'use client'

import Navbar from '@/components/Navbar'
import StakeCard from '@/components/StakeCard'
import AppBanner from '@/components/AppBanner'
import FooterBar from '@/components/FooterBar'

export default function HomePage() {
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
        <header className="pt-8 pb-12">
          <Navbar />
        </header>

        {/* Main content area */}
        <main className="flex-1 flex flex-col items-center justify-center mt-24">
          {/* Hero title */}
          <div className="text-center mb-12 px-4">
            <h1 className="text-4xl leading-12 font-semibold text-nm-text tracking-tight">
              Stake NEAR.{' '}
              <span className="inline-flex items-center gap-2">
                Earn 
                {/* NPRO 3D Icon */}
                <img 
                  src="/icons/npro3dicon.svg" 
                  alt="NPRO Token" 
                  className="w-18 h-18"
                />
              </span>{' '}
              NPRO now.
            </h1>
          </div>

          {/* Main container with StakeCard and AppBanner */}
          <div className="flex flex-col items-start gap-2 w-full max-w-[760px] mx-auto -mt-8 mb-16 px-4">
            {/* Stake Card */}
            <div className="w-full">
              <StakeCard />
            </div>
            
            {/* App Banner */}
            <div className="w-full">
              <AppBanner />
            </div>
          </div>
        </main>

        {/* Footer */}
        <FooterBar />
      </div>
    </div>
  )
}
