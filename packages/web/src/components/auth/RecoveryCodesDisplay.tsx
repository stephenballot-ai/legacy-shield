'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Download, CheckCircle2 } from 'lucide-react';

interface RecoveryCodesDisplayProps {
  codes: string[];
  onConfirm: () => void;
}

export function RecoveryCodesDisplay({ codes, onConfirm }: RecoveryCodesDisplayProps) {
  const [confirmed, setConfirmed] = useState(false);

  const downloadCodes = () => {
    const text = [
      'LegacyShield Recovery Codes',
      `Generated: ${new Date().toISOString()}`,
      '',
      'Store these codes in a safe place. Each code can only be used once.',
      '',
      ...codes.map((c, i) => `${i + 1}. ${c}`),
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legacyshield-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-center">Recovery codes</h3>

      <Alert variant="warning">
        Save these codes somewhere safe. If you lose access to your authenticator app, you can use these to sign in. Each code can only be used once.
      </Alert>

      <Card className="!p-4">
        <div className="grid grid-cols-2 gap-2">
          {codes.map((code) => (
            <code key={code} className="text-sm font-mono text-center py-1.5 bg-gray-50 rounded">
              {code}
            </code>
          ))}
        </div>
      </Card>

      <Button variant="secondary" onClick={downloadCodes} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Download codes
      </Button>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700">I have saved my recovery codes</span>
      </label>

      <Button onClick={onConfirm} disabled={!confirmed} className="w-full">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Continue
      </Button>
    </div>
  );
}
