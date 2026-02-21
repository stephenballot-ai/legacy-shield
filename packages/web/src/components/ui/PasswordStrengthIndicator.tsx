'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Props {
  password: string;
}

const requirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function getStrength(passed: number): { label: string; color: string } {
  if (passed <= 1) return { label: 'Very weak', color: 'bg-red-500' };
  if (passed === 2) return { label: 'Weak', color: 'bg-orange-500' };
  if (passed === 3) return { label: 'Fair', color: 'bg-amber-500' };
  if (passed === 4) return { label: 'Strong', color: 'bg-trust-500' };
  return { label: 'Very strong', color: 'bg-trust-600' };
}

export function PasswordStrengthIndicator({ password }: Props) {
  if (!password) return null;

  const results = requirements.map((r) => ({ ...r, passed: r.test(password) }));
  const passed = results.filter((r) => r.passed).length;
  const { label, color } = getStrength(passed);
  const pct = (passed / requirements.length) * 100;

  return (
    <div className="mt-2 space-y-2">
      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <ul className="space-y-1">
        {results.map((r) => (
          <li key={r.label} className="flex items-center gap-2 text-xs">
            {r.passed ? (
              <Check className="h-3.5 w-3.5 text-trust-500 flex-shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
            )}
            <span className={r.passed ? 'text-gray-700' : 'text-gray-400'}>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
