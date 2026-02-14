'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { deleteAccount } from '@/lib/api/users';
import { useAuthStore } from '@/store/authStore';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ open, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const clearAuth = useAuthStore((s) => s.clearAuth);

  if (!open) return null;

  const canSubmit = password.length > 0 && confirmation === 'DELETE MY ACCOUNT';

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteAccount(password, confirmation);
      clearAuth();
      window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
        </div>

        <Alert variant="error" className="mb-4">
          This action is <strong>permanent and irreversible</strong>. All your documents,
          emergency contacts, and account data will be permanently deleted.
        </Alert>

        {error && (
          <Alert variant="error" className="mb-4">{error}</Alert>
        )}

        <div className="space-y-4">
          <Input
            label="Your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your current password"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="font-mono text-red-600">DELETE MY ACCOUNT</span> to confirm
            </label>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={!canSubmit}
              isLoading={loading}
              className="flex-1"
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
