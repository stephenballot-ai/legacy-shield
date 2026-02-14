'use client';

import { useRef, useState, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface TwoFactorInputProps {
  onSubmit: (code: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function TwoFactorInput({ onSubmit, isLoading, error }: TwoFactorInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[idx] = value.slice(-1);
    setDigits(next);

    if (value && idx < 5) {
      refs.current[idx + 1]?.focus();
    }

    // Auto-submit
    if (value && idx === 5 && next.every(Boolean)) {
      onSubmit(next.join(''));
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((ch, i) => (next[i] = ch));
    setDigits(next);
    if (pasted.length === 6) onSubmit(next.join(''));
    else refs.current[pasted.length]?.focus();
  };

  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
            disabled={isLoading}
          />
        ))}
      </div>

      <Button
        type="button"
        onClick={() => onSubmit(digits.join(''))}
        isLoading={isLoading}
        disabled={!digits.every(Boolean)}
        className="w-full"
      >
        Verify
      </Button>
    </div>
  );
}
