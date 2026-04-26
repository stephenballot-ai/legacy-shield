'use client';

import { Link } from '@/i18n/routing';
import { useMemo } from 'react';
import { getCurrency } from '@/lib/utils/currency';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { Logo } from '@/components/ui/Logo';

function JsonLd({ locale }: { locale: string }) {
  const t = useTranslations('homepage.hero');
  const currency = useMemo(() => getCurrency(locale), [locale]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LegacyShield',
    operatingSystem: 'Web',
    applicationCategory: 'SecurityApplication',
    isBasedOn: 'https://bitatlas.com',
    offers: {
      '@type': 'Offer',
      price: currency.monthly,
      priceCurrency:
        locale === 'nl' || locale === 'de' || locale === 'fr' || locale === 'it' || locale === 'es'
          ? 'EUR'
          : 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '12',
    },
    description: t('title') + ' ' + t('subtitle'),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function TopBar() {
  const t = useTranslations('homepage.footer');
  return (
    <header
      className="sticky top-0 z-30 border-b border-line"
      style={{
        background: 'color-mix(in oklab, var(--bg) 88%, transparent)',
        backdropFilter: 'blur(12px) saturate(140%)',
      }}
    >
      <div className="container flex items-center" style={{ padding: '14px var(--gutter)' }}>
        <Link href="/" className="no-underline">
          <Logo size="md" />
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-[13px]" aria-label="Sections">
          <Link
            href="/blog"
            className="hidden rounded-sm px-2.5 py-1.5 text-fg-muted transition-colors hover:bg-bg-sunken hover:text-fg sm:inline"
          >
            {t('blog')}
          </Link>
          <a
            href="#how"
            className="hidden rounded-sm px-2.5 py-1.5 text-fg-muted transition-colors hover:bg-bg-sunken hover:text-fg md:inline"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="hidden rounded-sm px-2.5 py-1.5 text-fg-muted transition-colors hover:bg-bg-sunken hover:text-fg md:inline"
          >
            Pricing
          </a>
          <Link
            href="/login"
            className="hidden rounded-sm px-2.5 py-1.5 text-fg-muted transition-colors hover:bg-bg-sunken hover:text-fg sm:inline"
          >
            Sign in
          </Link>
          <Link href="/register" className="ls-btn ls-btn--sm ml-2">
            Open a vault
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Eyebrow({ children, color = 'subtle' }: { children: React.ReactNode; color?: 'subtle' | 'accent' | 'ok' }) {
  const colorVar =
    color === 'accent' ? 'var(--accent)' : color === 'ok' ? 'var(--ok)' : 'var(--fg-subtle)';
  return (
    <span className="t-eyebrow inline-flex items-center" style={{ color: colorVar }}>
      <span
        aria-hidden="true"
        className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
        style={{ background: colorVar }}
      />
      {children}
    </span>
  );
}

function SectionMark({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-[var(--s-12)] md:grid-cols-[220px_1fr] md:items-baseline">
      <span
        className="font-mono text-[12px] uppercase tracking-[0.08em] text-fg-subtle"
        style={{ borderTop: '1px solid var(--line-ink)', paddingTop: 10 }}
      >
        § {no}
      </span>
      <div>{children}</div>
    </div>
  );
}

function Hero() {
  const t = useTranslations('homepage.hero');
  const user = useAuthStore((s) => s.user);

  return (
    <section
      className="relative overflow-hidden border-b border-line"
      style={{
        padding: '64px 0 80px',
        background:
          'radial-gradient(1200px 400px at 80% -100px, color-mix(in oklab, var(--accent) 9%, transparent), transparent 60%), linear-gradient(180deg, var(--bg-sunken), var(--bg) 60%)',
      }}
    >
      <div className="container">
        <div className="grid gap-[var(--s-11)] md:grid-cols-[1.4fr_1fr] md:items-start">
          <div>
            <Eyebrow color="accent">Custody · Encrypted · EU Infrastructure</Eyebrow>
            <h1
              className="mt-[var(--s-7)] font-display text-fg text-balance"
              style={{
                fontSize: 'clamp(36px, 4.6vw, 60px)',
                lineHeight: 1.04,
                letterSpacing: 'var(--tracking-tight)',
                fontWeight: 400,
                margin: 0,
                maxWidth: '14ch',
              }}
            >
              If you died tomorrow, would your family be{' '}
              <em
                style={{
                  fontStyle: 'italic',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                locked out?
              </em>
            </h1>
            <p
              className="mt-[var(--s-7)] text-fg-muted"
              style={{
                fontSize: 'var(--t-md)',
                lineHeight: 'var(--lh-loose)',
                maxWidth: '52ch',
              }}
            >
              {t('subtitle')}
            </p>

            <div className="mt-[var(--s-9)] flex flex-wrap items-center gap-[var(--s-5)]">
              {user ? (
                <Link href="/dashboard" className="ls-btn ls-btn--lg">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="ls-btn ls-btn--lg">
                    {t('ctaPrimary')}
                  </Link>
                  <a href="#how" className="ls-btn ls-btn--secondary ls-btn--lg">
                    {t('ctaSecondary')}
                  </a>
                </>
              )}
            </div>

            {!user && (
              <p className="mt-[var(--s-6)] text-[13px] text-fg-subtle">{t('disclaimer')}</p>
            )}
          </div>

          <dl
            aria-label="System summary"
            className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line"
            style={{ background: 'var(--line)' }}
          >
            <div className="bg-bg-raised" style={{ padding: 'var(--s-7)' }}>
              <dt className="t-eyebrow" style={{ color: 'var(--fg-subtle)', marginBottom: 6 }}>
                Custody
              </dt>
              <dd
                className="font-display text-fg"
                style={{ fontSize: 'var(--t-lg)', letterSpacing: 'var(--tracking-snug)', margin: 0 }}
              >
                Zero-knowledge
              </dd>
            </div>
            <div className="bg-bg-raised" style={{ padding: 'var(--s-7)' }}>
              <dt className="t-eyebrow" style={{ color: 'var(--fg-subtle)', marginBottom: 6 }}>
                Hosting
              </dt>
              <dd
                className="font-display text-fg"
                style={{ fontSize: 'var(--t-lg)', letterSpacing: 'var(--tracking-snug)', margin: 0 }}
              >
                Frankfurt · EU
              </dd>
            </div>
            <div className="bg-bg-raised" style={{ padding: 'var(--s-7)' }}>
              <dt className="t-eyebrow" style={{ color: 'var(--fg-subtle)', marginBottom: 6 }}>
                Protocol
              </dt>
              <dd className="font-mono text-fg" style={{ fontSize: 'var(--t-md)', margin: 0 }}>
                Sentinel-X · v3
              </dd>
            </div>
            <div className="bg-bg-raised" style={{ padding: 'var(--s-7)' }}>
              <dt className="t-eyebrow" style={{ color: 'var(--fg-subtle)', marginBottom: 6 }}>
                Compliance
              </dt>
              <dd
                className="font-display text-fg"
                style={{ fontSize: 'var(--t-lg)', letterSpacing: 'var(--tracking-snug)', margin: 0 }}
              >
                GDPR · WCAG&nbsp;AA
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-[var(--s-11)] flex flex-wrap items-center gap-[var(--s-5)]">
          <span className="ls-status">
            <span className="pulse" />
            Vault online · Frankfurt
          </span>
          <span className="ls-badge ls-badge--seal">Sealed · 2026.04</span>
          <span className="ls-key">7F·A2·19·E4</span>
        </div>
      </div>
    </section>
  );
}

function WhatIfSection() {
  const t = useTranslations('homepage.whatIf');
  return (
    <section
      className="border-b border-line"
      style={{ padding: '80px 0', background: 'var(--bg-sunken)' }}
    >
      <div className="container">
        <SectionMark no="00 — The moment">
          <h2
            className="font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              lineHeight: 1.1,
              letterSpacing: 'var(--tracking-snug)',
              margin: '0 0 var(--s-9)',
            }}
          >
            {t('headline')}
          </h2>
          <ul className="grid gap-[var(--s-6)]" style={{ maxWidth: '60ch' }}>
            {(['line1', 'line2', 'line3'] as const).map((k, i) => (
              <li
                key={k}
                className="flex items-baseline gap-[var(--s-5)] text-fg"
                style={{ fontSize: 'var(--t-md)', lineHeight: 'var(--lh-loose)' }}
              >
                <span className="font-mono text-fg-subtle" style={{ fontSize: 'var(--t-xs)', minWidth: 24 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
          <p
            className="mt-[var(--s-9)] text-fg-muted"
            style={{ maxWidth: '60ch', fontSize: 'var(--t-sm)', lineHeight: 'var(--lh-loose)' }}
          >
            {t('stat')}
          </p>
          <p
            className="mt-[var(--s-7)] font-display text-fg"
            style={{
              fontSize: 'var(--t-2xl)',
              letterSpacing: 'var(--tracking-snug)',
              maxWidth: '40ch',
              lineHeight: 'var(--lh-snug)',
            }}
          >
            {t('resolution')}
          </p>
        </SectionMark>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  const principles = [
    { no: 'i.', title: 'Discretion over display.', body: 'No theatre, no decoration. Restraint is the loudest signal of seriousness we possess.' },
    { no: 'ii.', title: 'Permanence in form.', body: 'Materials echo paper, ink, and notarial seals — the language of documents that outlive their authors.' },
    { no: 'iii.', title: 'Evidence, not assurance.', body: 'We show encryption state, custody, and timestamps. We never merely promise security in marketing copy.' },
    { no: 'iv.', title: 'Tone of counsel.', body: 'We write the way a fiduciary advisor speaks — calm, measured, and never jovial about consequence.' },
    { no: 'v.', title: 'European in posture.', body: 'Hosted on European-owned hardware. Built to European editorial and privacy traditions.' },
    { no: 'vi.', title: 'Legibility above all.', body: 'If a beneficiary cannot read it on their worst day, the design has failed its only job.' },
  ];
  return (
    <section className="border-b border-line" style={{ padding: '80px 0' }}>
      <div className="container">
        <SectionMark no="01 — Principles">
          <h2
            className="font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              lineHeight: 1.1,
              letterSpacing: 'var(--tracking-snug)',
              margin: '0 0 var(--s-5)',
            }}
          >
            Six quiet covenants.
          </h2>
          <p
            className="text-fg-muted"
            style={{
              fontSize: 'var(--t-md)',
              lineHeight: 'var(--lh-loose)',
              maxWidth: '60ch',
              margin: 0,
            }}
          >
            Each principle exists to be felt, not noticed — the way a lawyer&apos;s office signals
            competence without ever announcing it.
          </p>

          <div
            className="mt-[var(--s-11)] grid gap-x-[var(--s-9)] gap-y-[var(--s-9)] md:grid-cols-3"
          >
            {principles.map((p) => (
              <article
                key={p.no}
                style={{ borderTop: '1px solid var(--line-ink)', paddingTop: 'var(--s-7)' }}
              >
                <div className="font-mono text-[11px] tracking-[0.06em] text-fg-subtle">{p.no}</div>
                <h3
                  className="my-[var(--s-5)] font-display text-fg"
                  style={{
                    fontSize: 'var(--t-xl)',
                    letterSpacing: 'var(--tracking-snug)',
                    lineHeight: 'var(--lh-snug)',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-fg-muted"
                  style={{
                    fontSize: 'var(--t-sm)',
                    lineHeight: 'var(--lh-loose)',
                    maxWidth: '36ch',
                    margin: 0,
                  }}
                >
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </SectionMark>
      </div>
    </section>
  );
}

function CustodySection() {
  const t = useTranslations('homepage.features');
  const items = [
    { key: 'insurance', badge: 'In custody', tone: 'info' as const },
    { key: 'bank', badge: 'Encrypted', tone: 'ok' as const },
    { key: 'wills', badge: 'Sealed', tone: 'seal' as const },
    { key: 'encryption', badge: 'Sentinel-X', tone: 'solid' as const },
    { key: 'emergency', badge: 'Heir-bound', tone: 'info' as const },
    { key: 'hosting', badge: 'Frankfurt · EU', tone: 'ok' as const },
  ] as const;

  const badgeClass = (tone: 'info' | 'ok' | 'seal' | 'solid') =>
    tone === 'seal'
      ? 'ls-badge ls-badge--seal'
      : tone === 'solid'
      ? 'ls-badge ls-badge--solid'
      : tone === 'ok'
      ? 'ls-badge ls-badge--ok'
      : 'ls-badge ls-badge--info';

  return (
    <section className="border-b border-line" style={{ padding: '80px 0' }}>
      <div className="container">
        <SectionMark no="02 — Custody">
          <h2
            className="font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              lineHeight: 1.1,
              letterSpacing: 'var(--tracking-snug)',
              margin: '0 0 var(--s-5)',
            }}
          >
            {t('sectionTitle')}
          </h2>
          <p
            className="text-fg-muted"
            style={{
              fontSize: 'var(--t-md)',
              lineHeight: 'var(--lh-loose)',
              maxWidth: '60ch',
              margin: 0,
            }}
          >
            {t('sectionSubtitle')}
          </p>

          <div className="mt-[var(--s-11)] grid gap-[var(--s-6)] md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ key, badge, tone }) => (
              <article key={key} className="ls-surface" style={{ padding: 'var(--s-9)' }}>
                <div className="flex items-center justify-between">
                  <span className={badgeClass(tone)}>
                    {tone !== 'seal' && tone !== 'solid' && <span className="dot" />}
                    {badge}
                  </span>
                  <span className="font-mono text-[11px] text-fg-subtle">
                    LSV-2026-{(key.charCodeAt(0) % 90) + 10}
                  </span>
                </div>
                <h3
                  className="mt-[var(--s-7)] font-display text-fg"
                  style={{
                    fontSize: 'var(--t-xl)',
                    letterSpacing: 'var(--tracking-snug)',
                    lineHeight: 'var(--lh-snug)',
                    margin: 0,
                  }}
                >
                  {t(`${key}.title`)}
                </h3>
                <p
                  className="mt-[var(--s-5)] text-fg-muted"
                  style={{ fontSize: 'var(--t-sm)', lineHeight: 'var(--lh-loose)', margin: 0 }}
                >
                  {t(`${key}.desc`)}
                </p>
              </article>
            ))}
          </div>
        </SectionMark>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const t = useTranslations('homepage.howItWorks');
  const steps = [
    { step: '01', key: 'step1' },
    { step: '02', key: 'step2' },
    { step: '03', key: 'step3' },
  ] as const;
  return (
    <section
      id="how"
      className="border-b border-line scroll-mt-20"
      style={{ padding: '80px 0', background: 'var(--bg-sunken)' }}
    >
      <div className="container">
        <SectionMark no="03 — Procedure">
          <h2
            className="font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              lineHeight: 1.1,
              letterSpacing: 'var(--tracking-snug)',
              margin: '0 0 var(--s-5)',
            }}
          >
            {t('title')}
          </h2>
          <p
            className="text-fg-muted"
            style={{
              fontSize: 'var(--t-md)',
              lineHeight: 'var(--lh-loose)',
              maxWidth: '60ch',
              margin: 0,
            }}
          >
            {t('subtitle')}
          </p>

          <ol className="mt-[var(--s-11)] grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-3">
            {steps.map(({ step, key }) => (
              <li key={step} className="bg-bg-raised" style={{ padding: 'var(--s-9)' }}>
                <div className="flex items-baseline gap-[var(--s-5)]">
                  <span className="font-mono text-[12px] tracking-[0.08em] text-fg-subtle">{step}</span>
                  <span
                    aria-hidden="true"
                    className="block h-px flex-1"
                    style={{ background: 'var(--line)' }}
                  />
                </div>
                <h3
                  className="mt-[var(--s-6)] font-display text-fg"
                  style={{
                    fontSize: 'var(--t-xl)',
                    letterSpacing: 'var(--tracking-snug)',
                    lineHeight: 'var(--lh-snug)',
                    margin: 0,
                  }}
                >
                  {t(`${key}.title`)}
                </h3>
                <p
                  className="mt-[var(--s-5)] text-fg-muted"
                  style={{ fontSize: 'var(--t-sm)', lineHeight: 'var(--lh-loose)', margin: 0 }}
                >
                  {t(`${key}.desc`)}
                </p>
              </li>
            ))}
          </ol>
        </SectionMark>
      </div>
    </section>
  );
}

function SentinelXSection() {
  const t = useTranslations('homepage.sentinelX');
  return (
    <section
      className="border-b border-line"
      style={{ padding: '80px 0', background: 'var(--bg-inset)' }}
    >
      <div className="container">
        <SectionMark no="04 — Protocol">
          <div className="grid gap-[var(--s-12)] md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <span className="ls-badge ls-badge--solid">Sentinel-X · v3.2</span>
              <h2
                className="mt-[var(--s-6)] font-display text-fg"
                style={{
                  fontSize: 'var(--t-3xl)',
                  lineHeight: 1.05,
                  letterSpacing: 'var(--tracking-snug)',
                  margin: 0,
                }}
              >
                {t('title')}
              </h2>
              <p
                className="mt-[var(--s-7)] text-fg-muted"
                style={{
                  fontSize: 'var(--t-md)',
                  lineHeight: 'var(--lh-loose)',
                  maxWidth: '52ch',
                  margin: 0,
                }}
              >
                {t('subtitle')}
              </p>
              <div className="mt-[var(--s-9)] flex flex-wrap items-center gap-[var(--s-4)]">
                <span className="ls-encrypting">
                  <span className="glyph" />
                  End-to-end · client-side
                </span>
              </div>
            </div>

            <div className="ls-surface ls-surface--ink" style={{ padding: 'var(--s-9)' }}>
              <div className="t-eyebrow" style={{ color: 'var(--accent)', marginBottom: 'var(--s-6)' }}>
                Custody record
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 'var(--t-sm)',
                  lineHeight: 1.9,
                  color: 'var(--fg-on-ink)',
                  opacity: 0.86,
                }}
              >
                <div>vault.id      <span style={{ color: 'var(--ls-gold-soft)' }}>LSV-2026-074</span></div>
                <div>cipher        AES-256-GCM</div>
                <div>kdf           Argon2id · t=4 · m=64 MiB</div>
                <div>region        eu-central-1 · Frankfurt</div>
                <div>seal          7F·A2·19·E4</div>
                <div>last_rotated  2026-04-22T14:32Z</div>
                <div>state         <span style={{ color: '#6FB58C' }}>VERIFIED</span></div>
              </div>
              <div className="mt-[var(--s-7)] flex items-center gap-[var(--s-4)]">
                <span className="ls-key" style={{ background: 'transparent', borderColor: 'var(--ls-ink-soft)', color: 'var(--ls-bone-soft)' }}>
                  ⌘ K
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--ls-bone-soft)', opacity: 0.6 }}>
                  Inspect ledger entry
                </span>
              </div>
            </div>
          </div>
        </SectionMark>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const t = useTranslations('homepage.useCases');
  const items = ['passports', 'wills', 'property', 'insurance', 'medical', 'financial', 'crypto', 'tax'] as const;
  return (
    <section className="border-b border-line" style={{ padding: '80px 0' }}>
      <div className="container">
        <SectionMark no="05 — Manifest">
          <h2
            className="font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              lineHeight: 1.1,
              letterSpacing: 'var(--tracking-snug)',
              margin: '0 0 var(--s-5)',
            }}
          >
            {t('title')}
          </h2>
          <p
            className="text-fg-muted"
            style={{
              fontSize: 'var(--t-md)',
              lineHeight: 'var(--lh-loose)',
              maxWidth: '60ch',
              margin: 0,
            }}
          >
            {t('subtitle')}
          </p>

          <ul
            className="mt-[var(--s-11)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ borderTop: '1px solid var(--line-ink)' }}
          >
            {items.map((k, i) => (
              <li
                key={k}
                className="flex items-center justify-between"
                style={{
                  padding: 'var(--s-7) var(--s-6)',
                  borderBottom: '1px solid var(--line)',
                  borderRight: i % 4 !== 3 ? '1px solid var(--line)' : 'none',
                }}
              >
                <span className="font-mono text-[12px] tracking-[0.04em] text-fg-subtle">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="font-display text-fg"
                  style={{
                    fontSize: 'var(--t-md)',
                    letterSpacing: 'var(--tracking-snug)',
                  }}
                >
                  {t(`items.${k}`)}
                </span>
              </li>
            ))}
          </ul>
        </SectionMark>
      </div>
    </section>
  );
}

function PricingSection({ locale }: { locale: string }) {
  const t = useTranslations('homepage.pricing');
  const currency = useMemo(() => getCurrency(locale), [locale]);
  const proFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'] as const;
  const freeFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'] as const;

  const Check = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: 4 }}
    >
      <path
        d="M2 7.5 L5.5 11 L12 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <section
      id="pricing"
      className="border-b border-line scroll-mt-20"
      style={{ padding: '80px 0' }}
    >
      <div className="container">
        <SectionMark no="06 — Engagement">
          <h2
            className="font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              lineHeight: 1.1,
              letterSpacing: 'var(--tracking-snug)',
              margin: '0 0 var(--s-5)',
            }}
          >
            {t('title')}
          </h2>
          <p
            className="text-fg-muted"
            style={{
              fontSize: 'var(--t-md)',
              lineHeight: 'var(--lh-loose)',
              maxWidth: '60ch',
              margin: 0,
            }}
          >
            {t('subtitle')}
          </p>

          <div className="mt-[var(--s-11)] grid gap-[var(--s-7)] md:grid-cols-2">
            {/* Free / Basic */}
            <div className="ls-surface" style={{ padding: 'var(--s-10)' }}>
              <div className="flex items-baseline justify-between">
                <span className="t-eyebrow" style={{ color: 'var(--fg-subtle)' }}>
                  Tier I
                </span>
                <span className="font-mono text-[11px] text-fg-subtle">forever</span>
              </div>
              <h3
                className="mt-[var(--s-5)] font-display text-fg"
                style={{
                  fontSize: 'var(--t-2xl)',
                  letterSpacing: 'var(--tracking-snug)',
                  margin: 0,
                }}
              >
                {t('free.name')}
              </h3>
              <div className="mt-[var(--s-6)] flex items-baseline gap-2">
                <span
                  className="font-display text-fg"
                  style={{ fontSize: 'var(--t-4xl)', letterSpacing: 'var(--tracking-tight)' }}
                >
                  {currency.symbol}0
                </span>
                <span className="text-fg-subtle" style={{ fontSize: 'var(--t-sm)' }}>
                  {t('free.period')}
                </span>
              </div>
              <ul className="mt-[var(--s-9)] grid gap-[var(--s-5)]">
                {freeFeatures.map((k) => (
                  <li key={k} className="flex gap-[var(--s-4)] text-fg" style={{ fontSize: 'var(--t-sm)' }}>
                    <span style={{ color: 'var(--fg-subtle)' }}>
                      <Check />
                    </span>
                    <span>{t(`free.features.${k}`)}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="ls-btn ls-btn--secondary ls-btn--block mt-[var(--s-9)]">
                {t('free.cta')}
              </Link>
            </div>

            {/* Pro */}
            <div className="ls-surface ls-surface--ink relative" style={{ padding: 'var(--s-10)' }}>
              <span
                className="ls-badge ls-badge--seal absolute"
                style={{
                  top: 'var(--s-7)',
                  right: 'var(--s-7)',
                  background: 'transparent',
                  color: 'var(--accent)',
                  borderColor: 'var(--accent)',
                }}
              >
                {t('pro.badge')}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="t-eyebrow" style={{ color: 'var(--accent)' }}>
                  Tier II
                </span>
              </div>
              <h3
                className="mt-[var(--s-5)] font-display"
                style={{
                  fontSize: 'var(--t-2xl)',
                  letterSpacing: 'var(--tracking-snug)',
                  margin: 0,
                  color: 'var(--ls-bone-soft)',
                }}
              >
                {t('pro.name')}
              </h3>
              <div className="mt-[var(--s-6)] flex items-baseline gap-2">
                <span
                  className="font-display"
                  style={{
                    fontSize: 'var(--t-4xl)',
                    letterSpacing: 'var(--tracking-tight)',
                    color: 'var(--ls-bone-soft)',
                  }}
                >
                  {currency.symbol}
                  {currency.monthly}
                </span>
                <span style={{ fontSize: 'var(--t-sm)', color: 'var(--ls-bone-soft)', opacity: 0.6 }}>
                  {t('pro.period')}
                </span>
              </div>
              <ul className="mt-[var(--s-9)] grid gap-[var(--s-5)]">
                {proFeatures.map((k) => (
                  <li
                    key={k}
                    className="flex gap-[var(--s-4)]"
                    style={{ fontSize: 'var(--t-sm)', color: 'var(--ls-bone-soft)' }}
                  >
                    <span style={{ color: 'var(--accent)' }}>
                      <Check />
                    </span>
                    <span>{t(`pro.features.${k}`)}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="ls-btn ls-btn--accent ls-btn--block mt-[var(--s-9)]">
                {t('pro.cta')}
              </Link>
            </div>
          </div>
        </SectionMark>
      </div>
    </section>
  );
}

function ClosingCTA() {
  const t = useTranslations('homepage.cta');
  return (
    <section
      style={{
        padding: '96px 0',
        background:
          'radial-gradient(800px 300px at 80% 100%, color-mix(in oklab, var(--accent) 8%, transparent), transparent 60%), var(--ls-ink-deep)',
        color: 'var(--fg-on-ink)',
      }}
      className="border-b border-line"
    >
      <div className="container">
        <SectionMark no="07 — Custody begins">
          <h2
            className="font-display"
            style={{
              fontSize: 'var(--t-3xl)',
              lineHeight: 1.1,
              letterSpacing: 'var(--tracking-snug)',
              margin: '0 0 var(--s-7)',
              color: 'var(--ls-bone-soft)',
              maxWidth: '24ch',
            }}
          >
            {t('title')}
          </h2>
          <p
            style={{
              fontSize: 'var(--t-md)',
              lineHeight: 'var(--lh-loose)',
              maxWidth: '52ch',
              margin: '0 0 var(--s-9)',
              color: 'var(--ls-bone-soft)',
              opacity: 0.78,
            }}
          >
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap items-center gap-[var(--s-5)]">
            <Link href="/register" className="ls-btn ls-btn--accent ls-btn--lg">
              {t('button')}
            </Link>
            <Link
              href="/continuity"
              className="ls-btn ls-btn--tertiary ls-btn--lg"
              style={{ color: 'var(--ls-bone-soft)' }}
            >
              Read the custody guide
            </Link>
          </div>
        </SectionMark>
      </div>
    </section>
  );
}

function Footer({ locale }: { locale: string }) {
  const t = useTranslations('homepage.footer');
  return (
    <footer style={{ padding: '64px 0 32px', color: 'var(--fg-subtle)' }}>
      <div className="container">
        <div
          className="grid gap-[var(--s-9)] md:grid-cols-[2fr_1fr_1fr_1fr]"
          style={{ borderTop: '1px solid var(--line-ink)', paddingTop: 'var(--s-8)' }}
        >
          <div>
            <Logo size="sm" />
            <p
              className="mt-[var(--s-5)]"
              style={{ maxWidth: '38ch', lineHeight: 'var(--lh-loose)', fontSize: 'var(--t-xs)' }}
            >
              A zero-knowledge vault for the documents that outlive their authors. Designed,
              engineered, and hosted in the European Union.
            </p>
          </div>
          <FooterCol heading="System">
            <FooterLink href="/blog">{t('blog')}</FooterLink>
            <FooterLink href="/faq">{t('faq')}</FooterLink>
            <FooterLink href="/continuity">{t('continuity')}</FooterLink>
          </FooterCol>
          <FooterCol heading="Custody">
            <FooterLink href="/made-in-eu">{t('madeInEu')}</FooterLink>
            {locale === 'nl' && <FooterLink href="/notaris">{t('notary')}</FooterLink>}
            <FooterLink href="/letter-of-wishes">Letter of Wishes</FooterLink>
          </FooterCol>
          <FooterCol heading="Document">
            <FooterLink href="/privacy">{t('privacy')}</FooterLink>
            <FooterLink href="/terms">{t('terms')}</FooterLink>
            <li className="py-1 text-fg-subtle">
              <span className="font-mono text-[11px]">© {new Date().getFullYear()}</span>
            </li>
          </FooterCol>
        </div>
        <p className="mt-[var(--s-9)] text-[11px]" style={{ color: 'var(--fg-subtle)' }}>
          {t('tagline')}{' '}
          <a
            href="https://bitatlas.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            Encrypted by BitAtlas
          </a>
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="t-eyebrow" style={{ color: 'var(--fg)', marginBottom: 'var(--s-5)' }}>
        {heading}
      </h5>
      <ul className="m-0 list-none p-0">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: any; children: React.ReactNode }) {
  return (
    <li className="py-1" style={{ fontSize: 'var(--t-xs)' }}>
      <Link href={href} className="text-fg-subtle no-underline transition-colors hover:text-accent">
        {children}
      </Link>
    </li>
  );
}

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <main className="bg-bg text-fg">
      <JsonLd locale={params.locale} />
      <TopBar />
      <Hero />
      <WhatIfSection />
      <PrinciplesSection />
      <CustodySection />
      <HowItWorksSection />
      <SentinelXSection />
      <UseCasesSection />
      <PricingSection locale={params.locale} />
      <ClosingCTA />
      <Footer locale={params.locale} />
    </main>
  );
}
