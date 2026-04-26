'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmergencySetupWizard } from '@/components/emergency/EmergencySetupWizard';
import { EmergencyContactsList } from '@/components/emergency/EmergencyContactsList';
import { EmergencyInstructions } from '@/components/emergency/EmergencyInstructions';
import { emergencyAccessApi } from '@/lib/api/emergencyAccess';
import { useAuthStore } from '@/store/authStore';
import { EMERGENCY_CONTACT_LIMITS } from '@legacy-shield/shared';
import { Printer, RotateCcw, Share2, Check } from 'lucide-react';

export default function EmergencyAccessPage() {
  const [status, setStatus] = useState<{ isSetUp: boolean; contactCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRotateWarning, setShowRotateWarning] = useState(false);
  const [copied, setCopied] = useState(false);
  const user = useAuthStore((s) => s.user);

  const sharePortal = async () => {
    const shareUrl = `${window.location.origin}/emergency-portal?owner=${encodeURIComponent(
      user?.email || ''
    )}`;
    const shareData = {
      title: 'LegacyShield Emergency Access',
      text: 'In case of emergency, you can access my important documents here. You will need my unlock phrase.',
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await emergencyAccessApi.getStatus();
      setStatus(res);
    } catch {
      setStatus({ isSetUp: false, contactCount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[var(--s-13)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showSetup || !status?.isSetUp) {
    return (
      <div>
        <header className="mb-[var(--s-9)]">
          <span className="t-eyebrow text-fg-subtle">§ Designation</span>
          <h1
            className="mt-[var(--s-3)] font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              letterSpacing: 'var(--tracking-snug)',
              lineHeight: 'var(--lh-snug)',
              margin: 0,
            }}
          >
            Set up emergency access
          </h1>
        </header>
        <EmergencySetupWizard
          onComplete={() => {
            setShowSetup(false);
            fetchStatus();
          }}
        />
      </div>
    );
  }

  const maxContacts =
    user?.tier === 'PRO' ? EMERGENCY_CONTACT_LIMITS.PRO_TIER : EMERGENCY_CONTACT_LIMITS.FREE_TIER;

  return (
    <div className="space-y-[var(--s-9)]">
      <header className="flex items-end justify-between gap-[var(--s-5)]">
        <div>
          <span className="t-eyebrow text-fg-subtle">§ Heirs</span>
          <h1
            className="mt-[var(--s-3)] font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              letterSpacing: 'var(--tracking-snug)',
              lineHeight: 'var(--lh-snug)',
              margin: 0,
            }}
          >
            Emergency access
          </h1>
        </div>
        <button
          type="button"
          onClick={sharePortal}
          className="ls-btn ls-btn--secondary ls-btn--sm"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={1.8} /> Link copied
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.8} /> Share access link
            </>
          )}
        </button>
      </header>

      <Card>
        <div className="flex items-start justify-between gap-[var(--s-6)]">
          <div className="flex-1">
            <span className="ls-status">
              <span className="pulse" />
              Emergency access active
            </span>
            <h2
              className="mt-[var(--s-5)] font-display text-fg"
              style={{
                fontSize: 'var(--t-lg)',
                letterSpacing: 'var(--tracking-snug)',
                margin: 0,
              }}
            >
              {status.contactCount} heir{status.contactCount !== 1 ? 's' : ''} designated
            </h2>
            <p className="mt-[var(--s-3)] text-[13px] text-fg-muted">
              They can request release of your vault using the unlock phrase you assigned.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <Printer className="h-3.5 w-3.5" strokeWidth={1.8} />
            {showInstructions ? 'Hide kit' : 'Emergency kit'}
          </Button>
        </div>
      </Card>

      {showInstructions && (
        <Card>
          <EmergencyInstructions ownerEmail={user?.email} />
        </Card>
      )}

      <EmergencyContactsList maxContacts={maxContacts} onContactsChange={fetchStatus} />

      <section
        className="pt-[var(--s-9)]"
        style={{ borderTop: '1px solid var(--line-ink)' }}
      >
        <span className="t-eyebrow text-fg-subtle">§ Advanced</span>
        <div className="mt-[var(--s-5)] flex items-center justify-between gap-[var(--s-5)]">
          <div>
            <p className="text-[13px] font-medium text-fg">Rotate unlock phrase</p>
            <p className="mt-1 text-[12px] text-fg-muted">
              Invalidates the current phrase. Use if it may have been compromised.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setShowRotateWarning(true)}>
            Rotate
          </Button>
        </div>
      </section>

      {showRotateWarning && (
        <div className="ls-scrim">
          <div className="ls-modal ls-modal--danger">
            <div className="ls-modal__hd">
              <div>
                <span className="ls-modal__seal" style={{ color: 'var(--danger)' }}>
                  <RotateCcw className="h-3 w-3" strokeWidth={1.8} />
                  Destructive action
                </span>
                <h3 className="ls-modal__title" style={{ marginTop: 8 }}>
                  Rotate the unlock phrase?
                </h3>
                <p className="ls-modal__sub">
                  This creates a <strong>new unlock phrase</strong>. The old one stops working
                  immediately.
                </p>
              </div>
            </div>
            <div className="ls-modal__bd">
              <ul
                className="m-0 list-disc pl-5 text-[13px] text-fg-muted"
                style={{ lineHeight: 'var(--lh-loose)' }}
              >
                <li>You must share the new phrase with your heirs.</li>
                <li>All file keys will be re-encrypted — this may take a moment.</li>
              </ul>
            </div>
            <div className="ls-modal__ft">
              <Button variant="secondary" onClick={() => setShowRotateWarning(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowRotateWarning(false);
                  setShowSetup(true);
                }}
              >
                Begin rotation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
