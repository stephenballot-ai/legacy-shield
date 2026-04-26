'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'tertiary' | 'accent' | 'danger' | 'link';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  block?: boolean;
}

// Map legacy variant names to .ls-btn modifiers so callers don't all need to migrate at once.
const variantClass: Record<Variant, string> = {
  primary:   '',
  accent:    'ls-btn--accent',
  secondary: 'ls-btn--secondary',
  outline:   'ls-btn--secondary',
  ghost:     'ls-btn--tertiary',
  tertiary:  'ls-btn--tertiary',
  danger:    'ls-btn--danger',
  link:      'ls-btn--link',
};

const sizeClass: Record<Size, string> = {
  sm: 'ls-btn--sm',
  md: '',
  lg: 'ls-btn--lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, disabled, block, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      className={cn('ls-btn', variantClass[variant], sizeClass[size], block && 'ls-btn--block', className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <span className="ls-spin" style={{ borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} />
      )}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
