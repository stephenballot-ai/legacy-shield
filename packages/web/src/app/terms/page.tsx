import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — LegacyShield',
  description: 'Terms and conditions for using LegacyShield, the encrypted document vault with emergency access.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← Back to LegacyShield
        </Link>

        <h1 className="text-4xl font-bold mb-2" style={{ color: '#1e3a5f' }}>
          Terms of Service
        </h1>
        <p className="text-gray-500 mb-12">Last updated: February 15, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>What LegacyShield is</h2>
            <p>
              LegacyShield is an encrypted document vault with emergency access. You upload important
              documents, they’re encrypted on your device with AES-256-GCM before reaching our servers,
              and you can designate trusted people who can request access in an emergency.
            </p>
            <p>
              The service is operated by Stephen Ballot, based in the Netherlands. By using LegacyShield,
              you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Your account</h2>
            <p>
              You need an account to use LegacyShield. You’re responsible for keeping your login
              credentials secure. One person, one account — don’t share your credentials.
            </p>
            <p>
              You must be at least 18 years old to create an account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Zero-knowledge encryption — read this carefully</h2>
            <p>
              Your documents are encrypted on your device before they reach our servers. We do not have
              access to your encryption keys or passwords. This is a feature, not a bug.
            </p>
            <p className="font-medium mt-3">
              This means: if you lose your password and have no recovery method set up, we cannot help
              you recover your data. It is gone. We cannot make exceptions to this because we
              literally do not have the ability to decrypt your files.
            </p>
            <p>
              You are solely responsible for remembering your password and maintaining any recovery
              methods you set up.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Emergency access</h2>
            <p>
              You can designate emergency contacts who may request access to your vault. Here’s how it works:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>You choose who can request access and under what conditions</li>
              <li>When an emergency contact requests access, you are notified and have a waiting period to deny the request</li>
              <li>If you don’t respond within the waiting period you configured, access is granted</li>
              <li>You can revoke emergency access at any time while your account is active</li>
            </ul>
            <p className="mt-2">
              You are responsible for choosing your emergency contacts carefully. LegacyShield is not
              liable for what your emergency contacts do with access once granted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>What you can (and can’t) store</h2>
            <p>You may use LegacyShield to store personal and business documents. You may not use it to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Store illegal content of any kind</li>
              <li>Facilitate fraud, money laundering, or other criminal activity</li>
              <li>Store content that infringes on others\u2019 intellectual property rights</li>
              <li>Abuse the service in any way that degrades it for others</li>
            </ul>
            <p className="mt-2">
              While we can’t see your encrypted files, if we become aware of illegal use, we will
              terminate your account and cooperate with law enforcement as required by Dutch law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Plans and payment</h2>
            <p><strong>Free tier:</strong> Up to 3 documents and 1 emergency contact. No credit card required.</p>
            <p className="mt-2"><strong>Pro plan:</strong> €10/month or €500 for lifetime access. Includes unlimited documents and emergency contacts.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Monthly subscriptions renew automatically. Cancel anytime — you keep access until the end of your billing period</li>
              <li>Lifetime access is a one-time payment. It means for the lifetime of the service</li>
              <li>Refunds are handled on a case-by-case basis within 14 days of purchase, in accordance with EU consumer protection law</li>
              <li>We may change pricing for new subscriptions. Existing subscribers keep their current rate</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Service availability</h2>
            <p>
              We aim for high availability but don’t guarantee 100% uptime. We may have planned
              maintenance or unexpected outages. We’ll do our best to communicate about downtime in advance.
            </p>
            <p>
              We reserve the right to modify or discontinue features with reasonable notice. If we
              ever shut down the service entirely, we’ll give you at least 90 days to export your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Termination</h2>
            <p>
              <strong>By you:</strong> You can delete your account at any time. Your encrypted data will be
              deleted within 30 days.
            </p>
            <p className="mt-2">
              <strong>By us:</strong> We may suspend or terminate your account if you violate these terms,
              don’t pay, or abuse the service. We’ll notify you and give you a chance to export your
              data unless the violation is severe (e.g., illegal content).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Limitation of liability</h2>
            <p>
              LegacyShield is provided &ldquo;as is.&rdquo; To the maximum extent permitted by law:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>We are not liable for data loss due to forgotten passwords or lost encryption keys</li>
              <li>We are not liable for actions taken by your designated emergency contacts</li>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you’ve paid us in the 12 months before the claim</li>
            </ul>
            <p className="mt-2">
              Nothing in these terms limits liability for fraud, gross negligence, or anything that
              can’t be limited under Dutch or EU law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Governing law</h2>
            <p>
              These terms are governed by Dutch law. Any disputes will be resolved in the courts of
              the Netherlands. If you’re an EU consumer, you also have the right to use the{' '}
              <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                EU Online Dispute Resolution platform
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Changes to these terms</h2>
            <p>
              We may update these terms from time to time. We’ll notify you of significant changes by
              email at least 30 days before they take effect. Continued use after changes means you
              accept the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e3a5f' }}>Contact</h2>
            <p>
              Questions? Email{' '}
              <a href="mailto:stephenballot@gmail.com" className="text-blue-600 hover:text-blue-800">
                stephenballot@gmail.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
