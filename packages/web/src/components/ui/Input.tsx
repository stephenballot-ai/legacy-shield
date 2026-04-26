'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="t-label mb-[6px] block text-fg-muted"
          style={{ fontSize: 'var(--t-xs)', letterSpacing: 'var(--tracking-wide)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-subtle">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'block w-full bg-bg-raised text-fg placeholder:text-fg-subtle outline-none transition-colors',
            'border border-line-strong px-3 py-[10px]',
            'rounded-[var(--r-sm)] font-sans text-[14px] leading-[1.4]',
            'focus:border-ink-deep focus:shadow-[var(--ring-focus)]',
            error && 'border-danger focus:border-danger',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-[6px] text-[12px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-[6px] text-[12px] text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  )
);

Input.displayName = 'Input';
