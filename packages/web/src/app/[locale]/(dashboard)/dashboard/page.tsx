'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useFilesStore } from '@/store/filesStore';
import { DOCUMENT_LIMITS } from '@legacy-shield/shared';
import { usersApi } from '@/lib/api/users';
import { emergencyAccessApi } from '@/lib/api/emergencyAccess';
import { FileText, ShieldAlert, Clock, ArrowRight, Gift, Copy, Check } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LegacyReadiness } from '@/components/dashboard/LegacyReadiness';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { AccountBuilder } from '@/components/dashboard/AccountBuilder';
import { FinancialBuilder } from '@/components/dashboard/FinancialBuilder';
import type { FileCategory } from '@legacy-shield/shared';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const user = useAuthStore((s) => s.user);
  const { files, total, fetchFiles } = useFilesStore();
  const [docLimit, setDocLimit] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [emergencyCount, setEmergencyCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [accountBuilderOpen, setAccountBuilderOpen] = useState(false);
  const [financialBuilderOpen, setFinancialBuilderOpen] = useState(false);
  const [initialCategory, setInitialCategory] = useState<FileCategory | null>(null);

  const tier = user?.tier || 'FREE';
  const [isFoundingMember, setIsFoundingMember] = useState(false);
  const fallbackMax = tier === 'PRO' ? DOCUMENT_LIMITS.PRO_TIER : DOCUMENT_LIMITS.FREE_TIER;
  const maxFiles = docLimit ?? fallbackMax;

  const handleUploadClick = (category?: FileCategory) => {
    setInitialCategory(category || null);
    setUploadOpen(true);
  };

  useEffect(() => {
    usersApi
      .getMe()
      .then((p) => {
        setDocLimit(p.documentLimit);
        if (p.referralCode) setReferralCode(p.referralCode);
        if (p.foundingMember) setIsFoundingMember(true);
      })
      .catch(() => {});

    emergencyAccessApi
      .getStatus()
      .then((s) => setEmergencyCount(s.contactCount))
      .catch(() => setEmergencyCount(null));
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const recentFiles = [...files]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: 'Documents in custody', value: `${total} / ${maxFiles}`, icon: FileText },
    {
      label: 'Designated heirs',
      value: emergencyCount !== null ? emergencyCount.toString() : 'Not set up',
      icon: ShieldAlert,
    },
    {
      label: 'Last activity',
      value: recentFiles[0] ? formatDate(recentFiles[0].createdAt) : 'No activity',
      icon: Clock,
    },
  ];

  const usagePct = Math.min((total / maxFiles) * 100, 100);

  return (
    <div className="space-y-[var(--s-9)]">
      <header className="flex flex-col gap-[var(--s-5)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="t-eyebrow text-fg-subtle">§ {user?.email?.split('@')[0]}</span>
          <h1
            className="mt-[var(--s-3)] font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              letterSpacing: 'var(--tracking-snug)',
              lineHeight: 'var(--lh-snug)',
              margin: 0,
            }}
          >
            {t('welcome')}
          </h1>
          <p className="mt-[var(--s-3)] text-[13px] text-fg-muted">{t('subtitle')}</p>
          {isFoundingMember && (
            <span className="ls-badge ls-badge--seal mt-[var(--s-5)] inline-flex">
              Founding member
            </span>
          )}
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleUploadClick();
          }}
          variant={files.length === 0 ? 'accent' : 'primary'}
          size="md"
        >
          {files.length === 0 ? 'Begin custody — upload first document' : 'Upload document'}
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-[var(--s-6)] sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} padded={false}>
            <div className="flex items-start justify-between p-[var(--s-7)]">
              <div>
                <span className="t-eyebrow text-fg-subtle">{label}</span>
                <p
                  className="mt-[var(--s-4)] font-display text-fg"
                  style={{
                    fontSize: 'var(--t-2xl)',
                    letterSpacing: 'var(--tracking-snug)',
                    margin: 0,
                  }}
                >
                  {value}
                </p>
              </div>
              <Icon className="h-4 w-4 text-fg-subtle" strokeWidth={1.6} />
            </div>
          </Card>
        ))}
      </div>

      <LegacyReadiness
        onUpload={handleUploadClick}
        onBuildAccounts={() => setAccountBuilderOpen(true)}
        onBuildFinancial={() => setFinancialBuilderOpen(true)}
      />

      {recentFiles.length > 0 ? (
        <Card padded={false}>
          <div
            className="flex items-center justify-between p-[var(--s-7)]"
            style={{ borderBottom: '1px solid var(--line)' }}
          >
            <div>
              <span className="t-eyebrow text-fg-subtle">§ Custody log</span>
              <h2
                className="mt-[var(--s-2)] font-display text-fg"
                style={{
                  fontSize: 'var(--t-lg)',
                  letterSpacing: 'var(--tracking-snug)',
                  margin: 0,
                }}
              >
                Recent documents
              </h2>
            </div>
            <Link
              href="/documents"
              className="inline-flex items-center gap-[6px] text-[12px] text-fg-muted no-underline hover:text-accent"
            >
              View all <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
            </Link>
          </div>
          <ul className="m-0 list-none p-0">
            {recentFiles.map((file, i) => (
              <li
                key={file.id}
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}
              >
                <Link
                  href="/documents"
                  className="flex items-center gap-[var(--s-5)] px-[var(--s-7)] py-[var(--s-5)] no-underline transition-colors hover:bg-bg-sunken"
                >
                  <span className="font-mono text-[11px] text-fg-subtle" style={{ minWidth: 28 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <FileText className="h-4 w-4 flex-shrink-0 text-fg-subtle" strokeWidth={1.6} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">{file.filename}</p>
                    <p className="font-mono text-[11px] text-fg-subtle">
                      {formatFileSize(file.fileSizeBytes)}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-fg-subtle">
                    {formatDate(file.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <div className="ls-empty">
          <div className="ls-empty__crest">L</div>
          <h2 className="ls-empty__title">Your vault is awaiting its first document.</h2>
          <p className="ls-empty__body">
            Begin with a passport, a will, or a banking credential. Files are encrypted in your
            browser before they ever leave it.
          </p>
          <div className="ls-empty__cta">
            <Button
              variant="accent"
              onClick={(e) => {
                e.preventDefault();
                handleUploadClick();
              }}
            >
              Add a document
            </Button>
            <Link href="/continuity" className="ls-btn ls-btn--tertiary">
              Read the custody guide
            </Link>
          </div>
        </div>
      )}

      <DocumentUpload
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          fetchFiles();
        }}
        initialCategory={initialCategory}
      />

      <AccountBuilder
        open={accountBuilderOpen}
        onClose={() => {
          setAccountBuilderOpen(false);
          fetchFiles();
        }}
      />

      <FinancialBuilder
        open={financialBuilderOpen}
        onClose={() => {
          setFinancialBuilderOpen(false);
          fetchFiles();
        }}
      />

      {tier !== 'PRO' && referralCode && (
        <Card>
          <div className="flex items-start gap-[var(--s-6)]">
            <Gift className="mt-1 h-5 w-5 flex-shrink-0 text-accent" strokeWidth={1.6} />
            <div className="min-w-0 flex-1">
              <span className="t-eyebrow text-fg-subtle">§ Referral</span>
              <h3
                className="mt-[var(--s-2)] font-display text-fg"
                style={{
                  fontSize: 'var(--t-lg)',
                  letterSpacing: 'var(--tracking-snug)',
                  margin: 0,
                }}
              >
                {total >= maxFiles
                  ? 'Need more space? Invite a friend.'
                  : 'Share LegacyShield, earn more storage.'}
              </h3>
              <p className="mt-[var(--s-3)] text-[13px] text-fg-muted">
                Receive <strong className="text-fg">+5 documents</strong> for each person who signs
                up and uploads a file. Up to 25 free.
              </p>
              <div className="mt-[var(--s-5)] flex items-center gap-[var(--s-3)]">
                <code
                  className="flex-1 truncate font-mono text-[12px] text-fg-muted"
                  style={{
                    background: 'var(--bg-sunken)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    padding: '8px 12px',
                  }}
                >
                  legacyshield.eu/r/{referralCode}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://legacyshield.eu/r/${referralCode}`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="ls-btn ls-btn--secondary ls-btn--sm flex-shrink-0"
                  aria-label="Copy referral link"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-baseline justify-between">
          <span className="t-eyebrow text-fg-subtle">§ Storage</span>
          <span className="font-mono text-[12px] text-fg-subtle">
            {total} / {maxFiles}
          </span>
        </div>
        <div className="ls-meter mt-[var(--s-5)]">
          <div className="ls-meter__bar" style={{ width: `${usagePct}%` }} />
        </div>
        {total >= maxFiles && tier !== 'PRO' && (
          <p className="mt-[var(--s-4)] text-[12px]" style={{ color: 'var(--warn)' }}>
            Limit reached. Invite a friend for +5 docs, or{' '}
            <Link href="/settings" className="font-medium underline-offset-4 hover:underline">
              engage Tier II
            </Link>{' '}
            for {DOCUMENT_LIMITS.PRO_TIER}.
          </p>
        )}
      </Card>
    </div>
  );
}
