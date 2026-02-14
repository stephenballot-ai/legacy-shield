'use client';

import { cn } from '@/lib/utils';

interface Props {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Very weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Strong', color: 'bg-trust-500' },
    { label: 'Very strong', color: 'bg-trust-600' },
  ];

  const idx = Math.min(score, 4);
  return { score, ...levels[idx] };
}

export function PasswordStrengthIndicator({ password }: Props) {
  if (!password) return null;

  const { score, label, color } = getStrength(password);
  const pct = ((score + 1) / 5) * 100;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
