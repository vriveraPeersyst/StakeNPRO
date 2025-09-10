export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-content mx-auto">
        <h1 className="text-3xl font-bold text-nm-text mb-4">Privacy policy NEAR Mobile</h1>
        <p className="text-sm text-nm-muted mb-8">Last updated: December 22, 2023</p>
        
        <div className="prose max-w-none text-nm-text space-y-6">
          <p>
            Thank you for choosing NEAR Mobile («us,» «we,» or «our»). This Privacy Policy is designed to inform you about the information we collect, how we use it, and the choices you have regarding your information. Please take a moment to carefully read this policy.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-4">Information We Collect:</h2>
            <p className="mb-4">
              NEAR Mobile collects basic usage data through the analytics tool Posthog. This data includes, but is not limited to:
            </p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>Device information (e.g., device type, operating system version)</li>
              <li>Usage information (e.g., features used, time spent in the app)</li>
              <li>Performance data (e.g., app crashes, error messages)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">How We Use Your Information:</h2>
            <p className="mb-6">
              The information collected is used for the sole purpose of improving the functionality, performance, and user experience of NEAR Mobile. We do not sell, share, or otherwise disclose this information to third parties, except as required by law or as described in this Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Analytics Services:</h2>
            <p className="mb-6">
              NEAR Mobile uses Posthog, an analytics service, to collect, monitor, and analyze basic usage data. Posthog has its own privacy policy, which can be found on their website [link to Posthog privacy policy]. By using NEAR Mobile, you agree to the terms outlined in both this Privacy Policy and Posthog's privacy policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Data Retention:</h2>
            <p className="mb-6">
              We retain the collected data for as long as necessary to fulfill the purposes outlined in this Privacy Policy unless a longer retention period is required or permitted by law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Security:</h2>
            <p className="mb-6">
              We take reasonable measures to protect the information collected from unauthorized access, disclosure, alteration, or destruction. However, no data transmission over the internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Your Choices:</h2>
            <p className="mb-6">
              You have the right to control the information collected by NEAR Mobile. You can opt-out of analytics tracking by adjusting your device settings or uninstalling the app.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Updates to this Privacy Policy:</h2>
            <p className="mb-6">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page, and the date of the latest revision will be indicated at the top. We encourage you to review this Privacy Policy periodically.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Contact Us:</h2>
            <p className="mb-6">
              If you have any questions, concerns, or requests regarding this Privacy Policy or the data we collect, please contact us at info@peersyst.com.
            </p>
          </div>

          <p className="font-semibold">
            By using NEAR Mobile, you agree to the terms outlined in this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
