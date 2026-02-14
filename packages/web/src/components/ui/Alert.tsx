import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { ReactNode } from 'react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const styles: Record<AlertVariant, string> = {
  success: 'bg-trust-50 border-trust-200 text-trust-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const icons: Record<AlertVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-trust-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant, children, className }: AlertProps) {
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-4', styles[variant], className)}>
      <div className="flex-shrink-0 mt-0.5">{icons[variant]}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
