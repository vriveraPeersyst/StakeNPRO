export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-content mx-auto">
        <h1 className="text-3xl font-bold text-nm-text mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none text-nm-text">
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-6">
            This application is designed to be privacy-first and collects minimal information:
          </p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Wallet addresses you connect (stored locally)</li>
            <li>Transaction data for staking operations (public on blockchain)</li>
            <li>Basic usage analytics to improve the application</li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">2. How We Use Information</h2>
          <p className="mb-6">
            Information is used solely for:
          </p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Facilitating your staking transactions</li>
            <li>Displaying your staking positions and rewards</li>
            <li>Improving application performance and user experience</li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="mb-6">
            We do not sell, trade, or otherwise transfer your personal information to third parties. 
            All blockchain transactions are public by nature of the NEAR protocol.
          </p>

          <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
          <p className="mb-6">
            We implement appropriate data collection, storage and processing practices and security measures 
            to protect against unauthorized access, alteration, disclosure or destruction of your personal information.
          </p>

          <h2 className="text-xl font-semibold mb-4">5. Third-Party Services</h2>
          <p className="mb-6">
            This application integrates with:
          </p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>NEAR Wallet Selector for wallet connections</li>
            <li>NEAR blockchain for transaction execution</li>
            <li>CoinGecko API for price data (optional)</li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">6. Changes to Privacy Policy</h2>
          <p className="mb-6">
            We may update this privacy policy from time to time. We will notify users of any material changes 
            by updating the policy on this page.
          </p>

          <h2 className="text-xl font-semibold mb-4">7. Contact Information</h2>
          <p className="mb-6">
            If you have any questions about this privacy policy, please contact us through our official channels.
          </p>
        </div>
      </div>
    </div>
  )
}
