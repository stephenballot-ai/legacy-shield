import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — LegacyShield',
  description: 'How LegacyShield handles your data. Zero-knowledge encryption, EU-only hosting, GDPR compliant.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← Back to LegacyShield
        </Link>

        <h1 className="text-4xl font-bold text-navy-900 mb-2" style={{ color: '#1e3a5f' }}>
          Privacy Policy
        </h1>
        <p className="text-gray-500 mb-12">Last updated: February 15, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>The short version</h2>
            <p>
              LegacyShield uses zero-knowledge encryption. Your documents are encrypted on your device
              before they ever reach our servers. We can’t read them. We don’t want to. This policy
              explains what little data we do handle and how we protect it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Who we are</h2>
            <p>
              LegacyShield is operated by Stephen Ballot, based in the Netherlands. You can reach us
              at{' '}
              <a href="mailto:privacy@legacyshield.eu" className="text-blue-600 hover:text-blue-800">
                privacy@legacyshield.eu
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>What data we collect</h2>
            <p className="font-medium">Account information</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Email address (for login and notifications)</li>
              <li>Name (if you provide one)</li>
              <li>Payment information (processed by our payment provider — we never store card details)</li>
            </ul>

            <p className="font-medium mt-4">Your documents</p>
            <p>
              Your files are encrypted with AES-256-GCM on your device before upload. We store only
              the encrypted data. We cannot decrypt, read, or access your documents — this is
              zero-knowledge encryption by design.
            </p>

            <p className="font-medium mt-4">Emergency contacts</p>
            <p>
              We store the name and email address of people you designate as emergency contacts, plus
              the access conditions you define. Emergency contacts do not have access to your documents
              unless your specified conditions are met.
            </p>

            <p className="font-medium mt-4">Technical data</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Server logs (IP address, timestamp, request path) — retained for 30 days</li>
              <li>We do not use analytics, trackers, or third-party cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain the service</li>
              <li>To authenticate you and manage your account</li>
              <li>To process payments</li>
              <li>To send essential service notifications (e.g., emergency access requests)</li>
              <li>To detect and prevent abuse</li>
            </ul>
            <p className="mt-2">We do not sell your data. We do not use it for advertising. We do not share it with third parties except as described here.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Legal basis (GDPR)</h2>
            <p>We process your data on the following legal grounds:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Contract performance</strong> — providing the service you signed up for</li>
              <li><strong>Legitimate interest</strong> — security, abuse prevention, server logs</li>
              <li><strong>Legal obligation</strong> — tax and financial record-keeping</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Where your data lives</h2>
            <p>
              All data is stored on Hetzner Cloud servers in Helsinki, Finland. Hetzner is a European-owned
              infrastructure provider. Your data never leaves the European Union. We do not use US cloud
              providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Cookies</h2>
            <p>
              We use only essential session cookies to keep you logged in. No tracking cookies. No
              third-party cookies. No cookie banner needed because we’re not doing anything shady.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Data retention</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account data: kept while your account is active, deleted within 30 days of account deletion</li>
              <li>Encrypted documents: deleted immediately when you delete them, or within 30 days of account deletion</li>
              <li>Server logs: 30 days</li>
              <li>Payment records: retained as required by Dutch tax law (7 years)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Your rights</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Rectification</strong> — correct inaccurate data</li>
              <li><strong>Erasure</strong> — delete your account and all associated data</li>
              <li><strong>Portability</strong> — export your data in a machine-readable format</li>
              <li><strong>Restriction</strong> — limit how we process your data</li>
              <li><strong>Objection</strong> — object to processing based on legitimate interest</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:privacy@legacyshield.eu" className="text-blue-600 hover:text-blue-800">
                privacy@legacyshield.eu
              </a>. We’ll respond within 30 days.
            </p>
            <p className="mt-2">
              You also have the right to lodge a complaint with the Dutch Data Protection Authority
              (Autoriteit Persoonsgegevens) at{' '}
              <a href="https://autoriteitpersoonsgegevens.nl" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                autoriteitpersoonsgegevens.nl
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Third-party services</h2>
            <p>We use a minimal number of third-party services:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Hetzner Cloud</strong> (hosting) — EU-based, data stays in Finland</li>
              <li><strong>Payment processor</strong> — handles card payments; we never see or store your card number</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Changes to this policy</h2>
            <p>
              We’ll update this page when things change and note the date at the top. For significant
              changes, we’ll notify you by email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Contact</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href="mailto:privacy@legacyshield.eu" className="text-blue-600 hover:text-blue-800">
                privacy@legacyshield.eu
              </a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
