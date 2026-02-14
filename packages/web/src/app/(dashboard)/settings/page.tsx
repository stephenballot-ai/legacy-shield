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
import {
  User,
  Shield,
  CreditCard,
  Crown,
  CheckCircle2,
  XCircle,
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

  // Switch to subscription tab if coming from checkout
  useEffect(() => {
    if (checkoutResult) setActiveTab('subscription');
  }, [checkoutResult]);

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

function AccountSection({ profile, onUpdate }: { profile: UserProfile; onUpdate: () => void }) {
  const [email, setEmail] = useState(profile.email);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

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
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPwMsg({ type: 'success', text: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to change password' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
        {pwMsg && <Alert variant={pwMsg.type} className="mb-4">{pwMsg.text}</Alert>}
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
