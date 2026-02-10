export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-neutral-400">Last updated: February 2026</p>
        </div>
        <div className="space-y-8 text-neutral-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              SubGuard AI ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our subscription management platform.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Account registration data (email, password)</li>
              <li>Subscription information (service names, costs, renewal dates)</li>
              <li>Payment details (processed securely via third parties)</li>
              <li>Activity logs (actions taken within the platform)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send notifications</li>
              <li>Generate AI-powered optimization recommendations</li>
              <li>Conduct subscription analysis and negotiations</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Contact Us</h2>
            <div className="bg-neutral-800/50 rounded-lg p-4 mt-4">
              <p><strong>Email:</strong> <a href="mailto:contact@subguard.ai" className="text-blue-400 hover:text-blue-300">contact@subguard.ai</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
