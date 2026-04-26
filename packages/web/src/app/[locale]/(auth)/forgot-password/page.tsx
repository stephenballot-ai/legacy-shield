'use client';

import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  const items = [
    {
      no: 'i.',
      title: 'Why we cannot reset your password.',
      body: 'Your password derives a key that protects your files. The key only exists on your device. Without your password, your documents cannot be decrypted by anyone — including us.',
    },
    {
      no: 'ii.',
      title: 'If emergency access is set up.',
      body: (
        <>
          A trusted contact can retrieve your documents using the unlock phrase. Begin from the{' '}
          <Link href="/emergency-portal" className="text-fg no-underline underline-offset-4 hover:text-accent">
            emergency portal
          </Link>
          .
        </>
      ),
    },
    {
      no: 'iii.',
      title: 'For next time.',
      body: 'Use a password manager to store your LegacyShield password. Designate at least one heir so a trusted person can recover your documents.',
    },
  ];

  return (
    <Card>
      <div className="mb-[var(--s-8)]">
        <span className="t-eyebrow text-fg-subtle">§ Account recovery</span>
        <h1
          className="mt-[var(--s-4)] font-display text-fg"
          style={{
            fontSize: 'var(--t-2xl)',
            letterSpacing: 'var(--tracking-snug)',
            lineHeight: 'var(--lh-snug)',
            margin: 0,
          }}
        >
          You cannot reset your master password.
        </h1>
        <p className="mt-[var(--s-5)] text-[13px] leading-[var(--lh-loose)] text-fg-muted">
          LegacyShield uses zero-knowledge encryption. We never see your password — by design.
        </p>
      </div>

      <ol className="grid gap-[var(--s-7)]">
        {items.map((it) => (
          <li
            key={it.no}
            style={{ borderTop: '1px solid var(--line-ink)', paddingTop: 'var(--s-5)' }}
          >
            <span className="font-mono text-[11px] tracking-[0.06em] text-fg-subtle">{it.no}</span>
            <h3
              className="mt-[var(--s-3)] font-display text-fg"
              style={{
                fontSize: 'var(--t-md)',
                letterSpacing: 'var(--tracking-snug)',
                margin: 0,
                fontWeight: 500,
              }}
            >
              {it.title}
            </h3>
            <p className="mt-[var(--s-3)] text-[13px] leading-[var(--lh-loose)] text-fg-muted">
              {it.body}
            </p>
          </li>
        ))}
      </ol>

      <p
        className="mt-[var(--s-9)] text-[11px] uppercase tracking-[0.14em] text-fg-subtle"
        style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--s-5)' }}
      >
        This is by design — not a limitation.
      </p>

      <Link
        href="/login"
        className="ls-btn ls-btn--tertiary ls-btn--block mt-[var(--s-6)]"
      >
        ← Back to sign in
      </Link>
    </Card>
  );
}
