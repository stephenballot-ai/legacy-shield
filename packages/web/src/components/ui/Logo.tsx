import { Shield } from 'lucide-react';
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
      <Shield className={cn(s.icon, isDark ? 'text-white/80' : 'text-primary-600')} />
      <span className={cn(s.text, 'font-bold', isDark ? 'text-white/70' : 'text-gray-900')}>
        Legacy<span className={isDark ? 'text-white' : 'text-primary-600'}>Shield</span>
      </span>
    </div>
  );
}
