import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-bg text-fg"
      style={{
        backgroundImage:
          'radial-gradient(900px 320px at 50% -120px, color-mix(in oklab, var(--accent) 8%, transparent), transparent 60%)',
      }}
    >
      <header className="container flex items-center justify-between" style={{ padding: '20px var(--gutter)' }}>
        <Link href="/" className="no-underline">
          <Logo size="md" />
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
          Confidential · Custody
        </span>
      </header>

      <main className="container" style={{ padding: '40px var(--gutter) 64px' }}>
        <div className="mx-auto w-full max-w-[440px]">{children}</div>
      </main>

      <footer className="container" style={{ padding: '0 var(--gutter) 56px' }}>
        <p
          className="mx-auto max-w-[440px] text-center text-[11px] uppercase tracking-[0.14em] text-fg-subtle"
          style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--s-6)' }}
        >
          European hosting · Zero-knowledge encryption · GDPR
        </p>
      </footer>
    </div>
  );
}
