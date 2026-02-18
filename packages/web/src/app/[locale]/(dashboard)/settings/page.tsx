'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PricingCards } from '@/components/settings/PricingCards';
import { DeleteAccountModal } from '@/components/settings/DeleteAccountModal';
import { useAuthStore } from '@/store/authStore';
import { usersApi, type UserProfile } from '@/lib/api/users';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { authApi } from '@/lib/api/auth';
import { filesApi } from '@/lib/api/files';
import {
  User,
  Shield,
  CreditCard,
  Crown,
  CheckCircle2,
  XCircle,
  Gift,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

type Tab = 'account' | 'security' | 'subscription';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get('checkout');

  const loadProfile = useCallback(async () => {
    try {
      const data = await usersApi.getMe();
      setProfile(data);
    } catch {
      // handled by auth guard
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Switch to subscription tab if coming from checkout or tab param
  useEffect(() => {
    if (checkoutResult) setActiveTab('subscription');
    const tab = searchParams.get('tab');
    if (tab === 'subscription' || tab === 'security' || tab === 'account') {
      setActiveTab(tab);
    }
  }, [checkoutResult, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {checkoutResult === 'success' && (
        <Alert variant="success" className="mb-6">
          Your subscription has been activated! Welcome to Pro. 🎉
        </Alert>
      )}
      {checkoutResult === 'cancelled' && (
        <Alert variant="info" className="mb-6">
          Checkout was cancelled. You can try again anytime.
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'account' && profile && <AccountSection profile={profile} onUpdate={loadProfile} />}
      {activeTab === 'security' && profile && <SecuritySection profile={profile} />}
      {activeTab === 'subscription' && profile && <SubscriptionSection profile={profile} />}
    </div>
  );
}

// =============================================================================
// ACCOUNT SECTION
// =============================================================================

function ReferralCard() {
  const [referral, setReferral] = useState<{ referralCode: string; referralLink: string; referralCount: number; bonusDocs: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    usersApi.getReferrals().then(setReferral).catch(() => {});
  }, []);

  if (!referral) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(referral.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Keep your important documents safe and accessible — even in emergencies. Try LegacyShield: ${referral.referralLink}`;

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-50 rounded-lg">
          <Gift className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Invite Friends</h2>
          <p className="text-sm text-gray-500">Get +5 documents for each friend who signs up and uploads. Up to 25 docs free!</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 truncate">
          {referral.referralLink}
        </div>
        <Button variant="secondary" onClick={copyLink} className="flex-shrink-0">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
        >
          WhatsApp
        </a>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(referral.referralLink)}&text=${encodeURIComponent('Keep your important documents safe and accessible — even in emergencies. Try LegacyShield!')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
        >
          Telegram
        </a>
      </div>

      <div className="flex gap-6 text-sm text-gray-600">
        <div><span className="font-semibold text-gray-900">{referral.referralCount}</span> friends invited</div>
        <div><span className="font-semibold text-gray-900">+{referral.bonusDocs}</span> bonus documents</div>
      </div>
    </Card>
  );
}

function AccountSection({ profile, onUpdate }: { profile: UserProfile; onUpdate: () => void }) {
  const [email, setEmail] = useState(profile.email);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwProgress, setPwProgress] = useState<{ done: number; total: number } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const salt = useAuthStore((s) => s.salt);

  const handleEmailUpdate = async () => {
    setEmailLoading(true);
    setEmailMsg('');
    try {
      await usersApi.updateMe({ email });
      setEmailMsg('Email updated successfully');
      onUpdate();
    } catch (err) {
      setEmailMsg(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 12) {
      setPwMsg({ type: 'error', text: 'Password must be at least 12 characters' });
      return;
    }

    const derivationSalt = salt || profile?.keyDerivationSalt;
    if (!derivationSalt) {
      setPwMsg({ type: 'error', text: 'Cannot change password: key derivation salt missing. Please log out and log back in.' });
      return;
    }

    setPwLoading(true);
    setPwMsg(null);
    setPwProgress(null);

    try {
      // Import crypto functions
      const { deriveMasterKey } = await import('@/lib/crypto/keyDerivation');
      const { reencryptFileKey, arrayBufferToBase64 } = await import('@/lib/crypto/fileEncryption');
      const { useCryptoStore } = await import('@/store/cryptoStore');

      // 1. Derive old master key from current password + same salt
      const oldMasterKey = await deriveMasterKey(currentPassword, derivationSalt);

      // 2. Derive new master key from new password + SAME salt (salt never changes)
      const newMasterKey = await deriveMasterKey(newPassword, derivationSalt);

      // 3. Re-encrypt all file keys: oldMasterKey -> newMasterKey
      const BATCH_SIZE = 50;
      let offset = 0;
      const reencryptedKeys: Array<{ fileId: string; ownerEncryptedKey: string; ownerIV: string }> = [];

      while (true) {
        const res = await filesApi.listFiles({ limit: BATCH_SIZE, offset });
        if (res.files.length === 0) break;
        setPwProgress({ done: reencryptedKeys.length, total: res.total });

        for (const file of res.files) {
          try {
            const fileData = await filesApi.getFile(file.id);
            if (!fileData.ownerEncryptedKey || !fileData.ownerIV) continue;

            const result = await reencryptFileKey(
              fileData.ownerEncryptedKey,
              fileData.ownerIV,
              oldMasterKey,
              newMasterKey
            );
            reencryptedKeys.push({
              fileId: file.id,
              ownerEncryptedKey: result.encryptedKey,
              ownerIV: result.iv,
            });
          } catch (err) {
            // If we can't re-encrypt even one file, abort — don't corrupt the vault
            setPwMsg({ type: 'error', text: `Failed to re-encrypt file "${file.filename}". Your current password may be incorrect. No changes were made.` });
            setPwLoading(false);
            setPwProgress(null);
            return;
          }
          setPwProgress({ done: reencryptedKeys.length, total: res.total });
        }

        offset += res.files.length;
        if (res.files.length < BATCH_SIZE) break;
      }

      // 4. Re-encrypt emergency key with new master key (if it exists)
      const fromBase64 = (b64: string): ArrayBuffer => {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
      };

      let newEmergencyKeyEncrypted: string | undefined;
      if (profile.emergencyKeyEncrypted) {
        const encData = profile.emergencyKeyEncrypted;
        const [encB64, ivB64] = encData.split(':');
        if (encB64 && ivB64) {
          // Decrypt emergency key with old master key
          const rawKey = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(fromBase64(ivB64)) },
            oldMasterKey,
            fromBase64(encB64)
          );
          // Re-encrypt with new master key
          const newIV = crypto.getRandomValues(new Uint8Array(12));
          const newEnc = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: newIV },
            newMasterKey,
            rawKey
          );
          newEmergencyKeyEncrypted = arrayBufferToBase64(newEnc) + ':' + arrayBufferToBase64(newIV);
        }
      }

      // 5. Send everything to server atomically
      await authApi.changePassword(currentPassword, newPassword, reencryptedKeys, newEmergencyKeyEncrypted);

      // 6. Update in-memory master key to the new one
      useCryptoStore.getState().setMasterKey(newMasterKey);

      // 7. Recover emergency key with new master key
      if (newEmergencyKeyEncrypted) {
        const [encB64, ivB64] = newEmergencyKeyEncrypted.split(':');
        const rawKey = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(fromBase64(ivB64)) },
          newMasterKey,
          fromBase64(encB64)
        );
        const emergencyKey = await crypto.subtle.importKey(
          'raw', rawKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
        );
        useCryptoStore.getState().setEmergencyKey(emergencyKey);
      }

      setPwMsg({ type: 'success', text: `Password changed successfully. ${reencryptedKeys.length} file(s) re-encrypted.` });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to change password' });
    } finally {
      setPwLoading(false);
      setPwProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral */}
      <ReferralCard />

      {/* Email */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Address</h2>
        <div className="flex gap-3">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
          <Button
            onClick={handleEmailUpdate}
            isLoading={emailLoading}
            disabled={email === profile.email}
          >
            Update
          </Button>
        </div>
        {emailMsg && <p className="text-sm mt-2 text-gray-600">{emailMsg}</p>}
      </Card>

      {/* Change Password */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <Alert variant="info" className="mb-4">
          Changing your password will re-encrypt all your document keys. This may take a moment.
        </Alert>
        {pwMsg && <Alert variant={pwMsg.type} className="mb-4">{pwMsg.text}</Alert>}
        {pwProgress && (
          <div className="mb-4 space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Re-encrypting documents…</span>
              <span>{pwProgress.done} / {pwProgress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: pwProgress.total ? `${(pwProgress.done / pwProgress.total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        )}
        <div className="space-y-3 max-w-md">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            onClick={handlePasswordChange}
            isLoading={pwLoading}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete Account
        </Button>
      </Card>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}

// =============================================================================
// SECURITY SECTION
// =============================================================================

function SecuritySection({ profile }: { profile: UserProfile }) {
  const [setting2FA, setSetting2FA] = useState(false);
  const [qrData, setQrData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const data = await authApi.setup2FA();
      setQrData(data);
      setSetting2FA(true);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to start 2FA setup' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    setLoading(true);
    setMsg(null);
    try {
      await authApi.confirm2FA(code);
      setMsg({ type: 'success', text: '2FA enabled successfully!' });
      setSetting2FA(false);
      setQrData(null);
      setCode('');
      // Update user state
      const user = useAuthStore.getState().user;
      if (user) setUser({ ...user, twoFactorEnabled: true });
    } catch (err) {
      setMsg({ type: 'error', text: 'Invalid code. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    setLoading(true);
    try {
      const { recoveryCodes: codes } = await authApi.generateRecoveryCodes();
      setRecoveryCodes(codes);
    } catch {
      setMsg({ type: 'error', text: 'Failed to generate recovery codes' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2FA */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
          <div className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            profile.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'
          )}>
            {profile.twoFactorEnabled ? (
              <><CheckCircle2 className="h-4 w-4" /> Enabled</>
            ) : (
              <><XCircle className="h-4 w-4" /> Disabled</>
            )}
          </div>
        </div>

        {msg && <Alert variant={msg.type} className="mb-4">{msg.text}</Alert>}

        {!profile.twoFactorEnabled && !setting2FA && (
          <Button onClick={handleSetup2FA} isLoading={loading}>
            Enable 2FA
          </Button>
        )}

        {setting2FA && qrData && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Scan this QR code with your authenticator app, then enter the code below.
            </p>
            <div className="flex justify-center">
              <img src={qrData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
            <p className="text-xs text-gray-500 font-mono text-center break-all">{qrData.secret}</p>
            <div className="flex gap-3 max-w-xs">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
              <Button onClick={handleConfirm2FA} isLoading={loading} disabled={code.length !== 6}>
                Verify
              </Button>
            </div>
          </div>
        )}

        {profile.twoFactorEnabled && (
          <div className="mt-4">
            <Button variant="secondary" onClick={handleGenerateCodes} isLoading={loading}>
              Generate Recovery Codes
            </Button>
          </div>
        )}
      </Card>

      {/* Recovery Codes */}
      {recoveryCodes && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Recovery Codes</h2>
          <Alert variant="warning" className="mb-4">
            Save these codes in a safe place. Each code can only be used once.
          </Alert>
          <div className="grid grid-cols-2 gap-2 max-w-sm">
            {recoveryCodes.map((code) => (
              <code key={code} className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono text-center">
                {code}
              </code>
            ))}
          </div>
        </Card>
      )}

      {/* Active Sessions (stub) */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Active Sessions</h2>
        <p className="text-sm text-gray-500">Session management coming soon.</p>
      </Card>
    </div>
  );
}

// =============================================================================
// SUBSCRIPTION SECTION
// =============================================================================

function SubscriptionSection({ profile }: { profile: UserProfile }) {
  const [portalLoading, setPortalLoading] = useState(false);
  const isPro = profile.tier === 'PRO';
  const isLifetime = profile.subscription.lifetimePurchase;

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { portalUrl } = await subscriptionsApi.getPortalUrl();
      window.location.href = portalUrl;
    } catch {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
          {isPro && (
            <span className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
              isLifetime
                ? 'bg-amber-100 text-amber-800'
                : 'bg-primary-100 text-primary-700'
            )}>
              <Crown className="h-3.5 w-3.5" />
              {isLifetime ? 'Lifetime Member' : 'Pro'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Documents</p>
            <p className="text-2xl font-bold text-gray-900">
              {profile.documentCount}
              <span className="text-sm font-normal text-gray-400">/{profile.documentLimit}</span>
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (profile.documentCount / profile.documentLimit) * 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Emergency Contacts</p>
            <p className="text-2xl font-bold text-gray-900">
              {profile.emergencyContactCount}
              <span className="text-sm font-normal text-gray-400">/{profile.emergencyContactLimit}</span>
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (profile.emergencyContactCount / profile.emergencyContactLimit) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {isPro && !isLifetime && profile.subscription.subscriptionEndsAt && (
          <p className="text-sm text-gray-500 mb-4">
            Renews on {new Date(profile.subscription.subscriptionEndsAt).toLocaleDateString()}
          </p>
        )}

        {isPro && !isLifetime && (
          <Button variant="secondary" onClick={handleManage} isLoading={portalLoading}>
            Manage Subscription
          </Button>
        )}
      </Card>

      {/* Upgrade */}
      {!isPro && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upgrade to Pro</h2>
          <PricingCards />
        </Card>
      )}
    </div>
  );
}
