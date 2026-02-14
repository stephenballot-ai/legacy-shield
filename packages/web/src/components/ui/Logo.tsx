import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { icon: 'h-5 w-5', text: 'text-lg' },
  md: { icon: 'h-7 w-7', text: 'text-xl' },
  lg: { icon: 'h-9 w-9', text: 'text-2xl' },
};

export function Logo({ size = 'md', className }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Shield className={cn(s.icon, 'text-primary-600')} />
      <span className={cn(s.text, 'font-bold text-gray-900')}>
        Legacy<span className="text-primary-600">Shield</span>
      </span>
    </div>
  );
}
