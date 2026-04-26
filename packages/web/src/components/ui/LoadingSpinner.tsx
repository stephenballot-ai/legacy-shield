import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeStyle =
    size === 'sm'
      ? { width: 14, height: 14, borderWidth: 1.5 }
      : size === 'lg'
      ? { width: 28, height: 28, borderWidth: 2.5 }
      : { width: 20, height: 20, borderWidth: 2 };

  return <span className={cn('ls-spin', className)} style={sizeStyle as React.CSSProperties} />;
}
