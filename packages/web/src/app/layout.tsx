import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Legacy Shield - Secure Document Vault',
  description: 'Secure digital vault for critical documents with emergency access. 100% European hosting.',
  keywords: 'document vault, encryption, estate planning, emergency access, GDPR, privacy',
  authors: [{ name: 'Legacy Shield Team' }],
  openGraph: {
    title: 'Legacy Shield - Secure Document Vault',
    description: 'Swiss Bank-like protection for your most important documents',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
