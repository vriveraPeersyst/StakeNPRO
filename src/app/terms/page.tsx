import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for NPRO Stake - NEAR Mobile validator staking platform. Review staking risks, disclaimers, and user responsibilities.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service | NPRO Stake',
    description: 'Terms of Service for NPRO Stake - NEAR Mobile validator staking platform.',
    url: '/terms',
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-content mx-auto">
        <h1 className="text-3xl font-bold text-nm-text mb-8">Terms of Service</h1>
        
        <div className="prose max-w-none text-nm-text">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By accessing and using this NPRO staking application, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-xl font-semibold mb-4">2. Staking Risks</h2>
          <p className="mb-6">
            Staking NEAR tokens involves risks including but not limited to:
          </p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Market volatility and potential loss of value</li>
            <li>Slashing risks if the validator misbehaves</li>
            <li>Technical risks associated with smart contracts</li>
            <li>Unbonding periods during which tokens cannot be withdrawn</li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">3. No Financial Advice</h2>
          <p className="mb-6">
            This application does not provide financial advice. Users should conduct their own research and consult with financial advisors before making staking decisions.
          </p>

          <h2 className="text-xl font-semibold mb-4">4. Limitation of Liability</h2>
          <p className="mb-6">
            In no event shall the application developers be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>

          <h2 className="text-xl font-semibold mb-4">5. Changes to Terms</h2>
          <p className="mb-6">
            We reserve the right to modify these terms at any time. Continued use of the application constitutes acceptance of the modified terms.
          </p>
        </div>
      </div>
    </div>
  )
}
