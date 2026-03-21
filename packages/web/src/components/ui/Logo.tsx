import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  className?: string;
}

const sizeMap = {
  sm: { icon: 'h-5 w-5', text: 'text-lg' },
  md: { icon: 'h-7 w-7', text: 'text-xl' },
  lg: { icon: 'h-9 w-9', text: 'text-2xl' },
};

export function Logo({ size = 'md', variant = 'light', className }: LogoProps) {
  const s = sizeMap[size];
  const isDark = variant === 'dark';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn(
        "material-symbols-outlined",
        s.text === 'text-lg' ? 'text-xl' : s.text === 'text-xl' ? 'text-2xl' : 'text-3xl',
        isDark ? 'text-white/80' : 'text-primary-900'
      )}>
        security
      </span>
      <span className={cn(s.text, 'font-bold tracking-tight', isDark ? 'text-white' : 'text-primary-900')}>
        LegacyShield
      </span>
    </div>
  );
}
