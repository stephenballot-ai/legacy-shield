import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

type Variant = 'default' | 'sunken' | 'inset' | 'ink';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padded?: boolean;
}

const variantClass: Record<Variant, string> = {
  default: 'ls-surface',
  sunken:  'ls-surface ls-surface--sunken',
  inset:   'ls-surface ls-surface--inset',
  ink:     'ls-surface ls-surface--ink',
};

export function Card({
  className,
  variant = 'default',
  padded = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(variantClass[variant], padded && 'p-[var(--s-9)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}
