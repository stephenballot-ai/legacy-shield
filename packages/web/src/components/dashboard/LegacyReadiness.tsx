'use client';

import { useFilesStore } from '@/store/filesStore';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, ShieldCheck, Scale, HeartPulse, DollarSign, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileCategory } from '@legacy-shield/shared';

const ESSENTIAL_DOCS: Array<{ id: string; label: string; categories: FileCategory[]; icon: any }> = [
  { id: 'IDENTITY', label: 'Passport / ID', categories: ['IDENTITY'], icon: Fingerprint },
  { id: 'WILL', label: 'Will & Trust', categories: ['LEGAL'], icon: Scale },
  { id: 'INSURANCE', label: 'Life Insurance', categories: ['INSURANCE'], icon: ShieldCheck },
  { id: 'DIGITAL', label: 'Online Accounts Summary', categories: ['DIGITAL_ASSETS'], icon: HeartPulse },
  { id: 'FINANCIAL', label: 'Financial Overview', categories: ['FINANCIAL', 'PROPERTY'], icon: DollarSign },
];

export function LegacyReadiness({ onUpload, onBuildAccounts }: { onUpload: (category: FileCategory) => void; onBuildAccounts?: () => void }) {
  const { files } = useFilesStore();

  const completed = ESSENTIAL_DOCS.map((doc) => {
    return {
      ...doc,
      isDone: files.some((f) => f.category && doc.categories.includes(f.category)),
    };
  });

  const doneCount = completed.filter((d) => d.isDone).length;
  const score = (doneCount / ESSENTIAL_DOCS.length) * 100;

  let status = 'Unprotected';
  let color = 'text-gray-400';
  let barColor = 'bg-gray-200';

  if (score >= 80) {
    status = 'Legacy Shielded';
    color = 'text-trust-600';
    barColor = 'bg-trust-500';
  } else if (score >= 40) {
    status = 'Basic Coverage';
    color = 'text-amber-600';
    barColor = 'bg-amber-500';
  } else if (score > 0) {
    status = 'Getting Started';
    color = 'text-primary-600';
    barColor = 'bg-primary-500';
  }

  return (
    <Card className="overflow-hidden border-trust-100 bg-gradient-to-br from-white to-trust-50/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Legacy Readiness
            {score === 100 && <ShieldCheck className="h-5 w-5 text-trust-500" />}
          </h2>
          <p className="text-sm text-gray-500">Essential documents for your loved ones</p>
        </div>
        <div className="text-right">
          <span className={cn('text-2xl font-black italic tracking-tighter uppercase', color)}>
            {status}
          </span>
          <p className="text-xs font-medium text-gray-400 mt-0.5">{doneCount} of 5 essentials secured</p>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3 mb-8 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-1000 ease-out', barColor)}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {completed.map((doc) => {
          const Icon = doc.icon;
          return (
            <div
              key={doc.id}
              className={cn(
                'flex items-center md:flex-col md:text-center gap-3 p-3 rounded-xl border transition-all',
                doc.isDone 
                  ? 'bg-white border-trust-200 shadow-sm' 
                  : 'bg-gray-50/50 border-gray-100 opacity-60'
              )}
            >
              <div className={cn(
                'p-2 rounded-lg',
                doc.isDone ? 'bg-trust-50 text-trust-600' : 'bg-gray-100 text-gray-400'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={cn(
                  'text-xs font-bold leading-tight',
                  doc.isDone ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {doc.label}
                </p>
                <div className="flex items-center md:justify-center mt-1">
                  {doc.isDone ? (
                    <span className="text-[10px] font-bold text-trust-600 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Secured
                    </span>
                  ) : doc.id === 'DIGITAL' && onBuildAccounts ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={onBuildAccounts}
                        className="text-[10px] font-bold text-accent-600 hover:text-accent-700 uppercase tracking-wider underline"
                      >
                        Build it
                      </button>
                      <span className="text-[10px] text-gray-300">|</span>
                      <button 
                        onClick={() => onUpload(doc.categories[0])}
                        className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider underline"
                      >
                        Upload
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onUpload(doc.categories[0])}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider underline"
                    >
                      Upload
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
