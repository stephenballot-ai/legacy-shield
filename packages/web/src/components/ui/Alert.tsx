import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const variantStyle: Record<AlertVariant, React.CSSProperties> = {
  success: { background: 'var(--ok-bg)',     color: 'var(--ok)',     borderColor: 'color-mix(in oklab, var(--ok) 25%, transparent)' },
  error:   { background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'color-mix(in oklab, var(--danger) 25%, transparent)' },
  warning: { background: 'var(--warn-bg)',   color: 'var(--warn)',   borderColor: 'color-mix(in oklab, var(--warn) 25%, transparent)' },
  info:    { background: 'var(--info-bg)',   color: 'var(--info)',   borderColor: 'color-mix(in oklab, var(--info) 25%, transparent)' },
};

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant, children, className }: AlertProps) {
  return (
    <div
      role="status"
      className={cn('flex items-start gap-[var(--s-5)] border p-[var(--s-6)] rounded-[var(--r-md)]', className)}
      style={variantStyle[variant]}
    >
      <span
        aria-hidden="true"
        className="mt-[6px] inline-block h-[8px] w-[8px] flex-shrink-0 rounded-full"
        style={{ background: 'currentColor' }}
      />
      <div className="text-[13px] leading-[var(--lh-base)]" style={{ color: 'var(--fg)' }}>
        {children}
      </div>
    </div>
  );
}
