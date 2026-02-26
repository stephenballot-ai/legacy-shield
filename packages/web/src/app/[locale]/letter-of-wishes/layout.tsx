import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Letter of Wishes Template | LegacyShield',
  description:
    'Create your Letter of Wishes for free. A guided, private template to document your funeral wishes, personal messages, and important information for your loved ones. No sign-up required.',
  openGraph: {
    title: 'Free Letter of Wishes Template | LegacyShield',
    description:
      'Document your wishes for your loved ones with this free, private template. Generate a professional PDF — everything stays in your browser.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
