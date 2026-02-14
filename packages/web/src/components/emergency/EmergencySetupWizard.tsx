'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmergencyContactForm } from './EmergencyContactForm';
import { EmergencyInstructions } from './EmergencyInstructions';
import { useCryptoStore } from '@/store/cryptoStore';
import { useAuthStore } from '@/store/authStore';
import { deriveEmergencyKey, sha256Hash, generateSalt } from '@/lib/crypto/keyDerivation';
import { emergencyAccessApi } from '@/lib/api/emergencyAccess';
import { filesApi } from '@/lib/api/files';
import { Check, ChevronLeft, ChevronRight, Key, Lock, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Create Phrase', icon: Key },
  { label: 'Generate Key', icon: Lock },
  { label: 'Encrypt Files', icon: Lock },
  { label: 'Add Contact', icon: Users },
  { label: 'Done', icon: CheckCircle2 },
];

export function EmergencySetupWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [phrase, setPhrase] = useState('');
  const [phraseConfirm, setPhraseConfirm] = useState('');
  const [phraseError, setPhraseError] = useState<string | null>(null);

  // Derived key state
  const [emergencyKey, setEmergencyKey] = useState<CryptoKey | null>(null);
  const [_salt, setSalt] = useState('');
  const [_phraseHash, setPhraseHash] = useState('');
  const [deriving, setDeriving] = useState(false);
  const [deriveError, setDeriveError] = useState<string | null>(null);

  // Re-encryption state
  const [reencryptProgress, setReencryptProgress] = useState({ done: 0, total: 0 });
  const [reencrypting, setReencrypting] = useState(false);
  const [reencryptError, setReencryptError] = useState<string | null>(null);

  // Contact state
  const [contactSaving, setContactSaving] = useState(false);

  const [setupError] = useState<string | null>(null);

  const masterKey = useCryptoStore((s) => s.masterKey);
  const user = useAuthStore((s) => s.user);

  // Step 1: Validate phrase
  const handlePhraseNext = () => {
    setPhraseError(null);
    if (phrase.length < 6) {
      setPhraseError('Phrase must be at least 6 characters');
      return;
    }
    if (phrase !== phraseConfirm) {
      setPhraseError('Phrases do not match');
      return;
    }
    setStep(1);
  };

  // Step 2: Derive emergency key
  const handleDeriveKey = async () => {
    setDeriving(true);
    setDeriveError(null);
    try {
      const newSalt = generateSalt();
      const hash = await sha256Hash(phrase);
      const key = await deriveEmergencyKey(phrase, newSalt, true);

      setSalt(newSalt);
      setPhraseHash(hash);
      setEmergencyKey(key);

      // Export emergency key, encrypt with master key for server-side storage
      // Master key is required so the emergency key can be recovered on future logins
      if (!masterKey) {
        setDeriveError('Please sign out and log in again to set up emergency access. Your encryption key needs to be active.');
        setDeriving(false);
        return;
      }
      const encryptionKey = masterKey;

      const rawKey = await crypto.subtle.exportKey('raw', key);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedKeyBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        rawKey
      );

      const toBase64 = (buf: ArrayBuffer | Uint8Array) => {
        const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
      };

      await emergencyAccessApi.setupEmergencyAccess({
        emergencyPhraseHash: hash,
        emergencyKeyEncrypted: toBase64(encryptedKeyBuffer) + ':' + toBase64(iv),
        emergencyKeySalt: newSalt,
      });

      useCryptoStore.getState().setEmergencyKey(key);
      setStep(2);
    } catch (err) {
      setDeriveError(err instanceof Error ? err.message : 'Key derivation failed');
    } finally {
      setDeriving(false);
    }
  };

  // Step 3: Re-encrypt file keys with emergency key
  const handleReencryptFiles = async () => {
    if (!emergencyKey || !masterKey) {
      setReencryptError('Encryption keys not available. Please sign out, log in, and try again.');
      return;
    }
    setReencrypting(true);
    setReencryptError(null);

    try {
      const res = await filesApi.listFiles({ limit: 1000 });
      const files = res.files;
      setReencryptProgress({ done: 0, total: files.length });

      const fromBase64 = (b64: string): ArrayBuffer => {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
      };
      const toBase64 = (buf: ArrayBuffer | Uint8Array) => {
        const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
      };

      for (let i = 0; i < files.length; i++) {
        const fileData = await filesApi.getFile(files[i].id);

        // Decrypt file key with master key
        const encKeyBuf = fromBase64(fileData.ownerEncryptedKey);
        const ownerIVBuf = fromBase64(fileData.ownerIV);
        const fileKeyRaw = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: ownerIVBuf },
          masterKey,
          encKeyBuf
        );

        // Re-encrypt file key with emergency key
        const emergencyIV = crypto.getRandomValues(new Uint8Array(12));
        const emergencyEncKeyBuf = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: emergencyIV },
          emergencyKey,
          fileKeyRaw
        );

        // Update file with emergency-encrypted key via API
        await filesApi.updateFile(files[i].id, {
          // The API should accept these fields for emergency key update
          // Using patch with emergency key fields
        } as never);

        // If updateFile doesn't support emergency keys, use a dedicated endpoint
        // For now, call a generic update — the API route should handle emergencyEncryptedKey/emergencyIV
        await api_updateEmergencyKey(files[i].id, toBase64(emergencyEncKeyBuf), toBase64(emergencyIV));

        setReencryptProgress({ done: i + 1, total: files.length });
      }

      setStep(3);
    } catch (err) {
      setReencryptError(err instanceof Error ? err.message : 'Failed to re-encrypt files');
    } finally {
      setReencrypting(false);
    }
  };

  // Helper to update emergency key on a file
  const api_updateEmergencyKey = async (fileId: string, emergencyEncryptedKey: string, emergencyIV: string) => {
    const { api } = await import('@/lib/api/client');
    await api.patch(`/files/${fileId}/emergency-key`, { emergencyEncryptedKey, emergencyIV });
  };

  // Step 4: Add contact
  const handleAddContact = async (data: { name: string; relationship: string; email?: string; phone?: string; notes?: string }) => {
    setContactSaving(true);
    try {
      await emergencyAccessApi.addContact(data);
      setStep(4);
    } finally {
      setContactSaving(false);
    }
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  done ? 'bg-primary-600 text-white' : active ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600' : 'bg-gray-100 text-gray-400'
                )}>
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={cn('text-xs mt-1 hidden sm:block', active ? 'text-primary-700 font-medium' : 'text-gray-400')}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-primary-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Step 1: Create phrase */}
      {step === 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Create Your Unlock Phrase</h3>
          <p className="text-sm text-gray-600">
            Choose a memorable phrase that your emergency contacts can use to access your vault.
            Make it something meaningful but not easily guessable. You&apos;ll need to share it with them separately — it&apos;s never stored in plain text.
          </p>
          <Alert variant="warning">
            Write this phrase down and store it safely. If lost, you&apos;ll need to set up emergency access again.
          </Alert>
          <Input
            id="phrase"
            label="Unlock Phrase"
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Enter a memorable phrase…"
          />
          <Input
            id="phrase-confirm"
            label="Confirm Phrase"
            type="text"
            value={phraseConfirm}
            onChange={(e) => setPhraseConfirm(e.target.value)}
            placeholder="Re-enter your phrase…"
            error={phraseError || undefined}
          />
          <div className="flex justify-end">
            <Button onClick={handlePhraseNext}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Derive key */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Generate Emergency Key</h3>
          <p className="text-sm text-gray-600">
            We&apos;ll derive a secure encryption key from your phrase. This key will be used to encrypt copies of your file keys for emergency access.
          </p>
          {deriveError && <Alert variant="error">{deriveError}</Alert>}
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(0)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button onClick={handleDeriveKey} isLoading={deriving}>
              Generate Key <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Re-encrypt files */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Encrypt Files for Emergency Access</h3>
          <p className="text-sm text-gray-600">
            Each file&apos;s encryption key will be re-encrypted with your emergency key so it can be decrypted during emergency access.
          </p>
          {reencrypting && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-600">
                  Encrypting… {reencryptProgress.done} / {reencryptProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: reencryptProgress.total ? `${(reencryptProgress.done / reencryptProgress.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )}
          {reencryptError && <Alert variant="error">{reencryptError}</Alert>}
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button onClick={handleReencryptFiles} isLoading={reencrypting}>
              {reencryptProgress.total > 0 ? 'Retry' : 'Encrypt Files'} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Add contact */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Your First Emergency Contact</h3>
          <p className="text-sm text-gray-600">
            Add someone you trust. You can add more contacts later from the emergency access dashboard.
          </p>
          <EmergencyContactForm
            onSubmit={handleAddContact}
            onCancel={() => setStep(4)} // allow skip
            isLoading={contactSaving}
            submitLabel="Add Contact & Continue"
          />
        </div>
      )}

      {/* Step 5: Success */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Emergency Access is Ready!</h3>
            <p className="text-sm text-gray-600 mt-1">
              Print the instructions below and share your unlock phrase separately with your emergency contacts.
            </p>
          </div>

          <Alert variant="warning">
            Remember: share the unlock phrase verbally or in a sealed envelope — never digitally.
          </Alert>

          <EmergencyInstructions ownerEmail={user?.email} />

          <div className="flex justify-center">
            <Button onClick={onComplete}>Go to Emergency Dashboard</Button>
          </div>
        </div>
      )}

      {setupError && <Alert variant="error" className="mt-4">{setupError}</Alert>}
    </Card>
  );
}
