import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { crest: 'h-[22px] w-[19px] text-[11px]', word: 'text-base' },
  md: { crest: 'h-[26px] w-[22px] text-[13px]', word: 'text-lg' },
  lg: { crest: 'h-[34px] w-[28px] text-[16px]', word: 'text-2xl' },
};

export function Logo({ size = 'md', variant = 'light', showWordmark = true, className }: LogoProps) {
  const s = sizeMap[size];
  const isDark = variant === 'dark';

  return (
    <span className={cn('inline-flex items-center gap-[10px]', className)} aria-label="LegacyShield">
      <span
        aria-hidden="true"
        className={cn(
          'grid place-items-center font-display leading-none tracking-[-0.02em]',
          'rounded-t-[2px] rounded-b-[11px]',
          s.crest,
          isDark
            ? 'bg-bone-soft text-ink-deep ring-1 ring-inset ring-seal/40'
            : 'bg-ink-deep text-bone-soft ring-1 ring-inset ring-seal-soft'
        )}
      >
        L
      </span>
      {showWordmark && (
        <span
          className={cn(
            'font-display font-medium tracking-[-0.01em]',
            s.word,
            isDark ? 'text-bone-soft' : 'text-ink-deep'
          )}
        >
          LegacyShield
        </span>
      )}
    </span>
  );
}
