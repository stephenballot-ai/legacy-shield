import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ — LegacyShield',
  description: 'Frequently asked questions about LegacyShield — zero-knowledge encryption, emergency access, and document security.',
}

const faqs = [
  {
    q: 'What is LegacyShield?',
    a: 'LegacyShield is a secure, encrypted document vault for your most important files — passports, wills, insurance policies, and more. It uses zero-knowledge encryption, meaning only you can access your documents. Not even we can see them.',
  },
  {
    q: 'What does "zero-knowledge encryption" mean?',
    a: 'Your files are encrypted on your device before they ever leave your browser. The encryption key is derived from your password, which we never store or transmit. This means we literally cannot access your documents — even if compelled by a court order.',
  },
  {
    q: 'Can I reset my password if I forget it?',
    a: 'No — and that\u2019s by design. Your password is the only way to derive the encryption key that protects your files. We don\u2019t have a copy, so we can\u2019t reset it. We strongly recommend using a password manager and setting up emergency access as a safety net.',
  },
  {
    q: 'What is emergency access?',
    a: 'Emergency access lets you designate a trusted person (like a spouse or family member) who can access your documents using a special unlock phrase. If something happens to you, they can retrieve your important files through the emergency portal — read-only, no modifications.',
  },
  {
    q: 'Is my data stored in the EU?',
    a: 'Yes. All data is stored on European-owned infrastructure (Hetzner, Germany/Finland). Unlike AWS or Google Cloud EU regions, Hetzner is a German company not subject to the US CLOUD Act. Your data stays under EU jurisdiction.',
  },
  {
    q: 'What happens if LegacyShield shuts down?',
    a: 'Your files are encrypted on your device. Even if our servers go offline, your locally cached encryption keys and any downloaded files remain yours. We\u2019re also exploring data export features so you can always take your documents with you.',
  },
  {
    q: 'How is this different from Dropbox or Google Drive?',
    a: 'Dropbox and Google Drive can access your files — they hold the encryption keys. LegacyShield uses client-side, zero-knowledge encryption: your files are encrypted before upload, and only you hold the key. We also offer emergency access for loved ones, which no major cloud storage provider does.',
  },
  {
    q: 'Is LegacyShield free?',
    a: 'Yes! The free plan includes 3 documents, emergency access, and 1 emergency contact — with full zero-knowledge encryption and EU hosting. Invite friends to earn up to 25 documents free! The Pro plan ($10/month) gives you 100 documents, 5 emergency contacts, and priority support.',
  },
  {
    q: 'What file types can I upload?',
    a: 'You can upload any file type — PDFs, images, Word documents, spreadsheets, and more. We support preview for PDFs and images directly in the browser.',
  },
  {
    q: 'Who can see my documents?',
    a: 'Only you — and anyone you explicitly grant emergency access to via your unlock phrase. Our team cannot see your files, file names, or any content. We can only see basic account metadata (email, plan, storage usage).',
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← Back to LegacyShield
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Everything you need to know about LegacyShield.
        </p>

        <div className="mt-12 divide-y divide-gray-200">
          {faqs.map((faq, i) => (
            <div key={i} className="py-6">
              <h2 className="text-base font-semibold text-gray-900">
                {faq.q}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600">
            Still have questions?{' '}
            <a href="mailto:support@legacyshield.eu" className="text-blue-600 hover:text-blue-800 font-medium">
              Get in touch
            </a>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/register"
            className="inline-block px-8 py-3 rounded-xl bg-accent-500 text-white font-semibold hover:bg-accent-600 transition-colors"
          >
            Create Your Free Vault
          </Link>
        </div>
      </div>
    </main>
  )
}
