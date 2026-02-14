import type { FileCategory } from '@legacy-shield/shared';
import {
  Fingerprint,
  Home,
  DollarSign,
  Shield,
  HeartPulse,
  Scale,
  Receipt,
  Plane,
  Users,
  Globe,
  FolderOpen,
} from 'lucide-react';

export const categoryLabel: Record<FileCategory, string> = {
  IDENTITY: 'Identity & Vital Records',
  PROPERTY: 'Property & Assets',
  FINANCIAL: 'Financial',
  INSURANCE: 'Insurance',
  MEDICAL: 'Medical & Health',
  LEGAL: 'Legal',
  TAX: 'Tax',
  TRAVEL: 'Travel',
  FAMILY: 'Family',
  DIGITAL_ASSETS: 'Digital Assets',
  OTHER: 'Other',
};

export const categoryIcon: Record<FileCategory, typeof Fingerprint> = {
  IDENTITY: Fingerprint,
  PROPERTY: Home,
  FINANCIAL: DollarSign,
  INSURANCE: Shield,
  MEDICAL: HeartPulse,
  LEGAL: Scale,
  TAX: Receipt,
  TRAVEL: Plane,
  FAMILY: Users,
  DIGITAL_ASSETS: Globe,
  OTHER: FolderOpen,
};

export const categoryColor: Record<FileCategory, string> = {
  IDENTITY: 'bg-blue-100 text-blue-700',
  PROPERTY: 'bg-emerald-100 text-emerald-700',
  FINANCIAL: 'bg-green-100 text-green-700',
  INSURANCE: 'bg-indigo-100 text-indigo-700',
  MEDICAL: 'bg-red-100 text-red-700',
  LEGAL: 'bg-purple-100 text-purple-700',
  TAX: 'bg-amber-100 text-amber-700',
  TRAVEL: 'bg-sky-100 text-sky-700',
  FAMILY: 'bg-pink-100 text-pink-700',
  DIGITAL_ASSETS: 'bg-cyan-100 text-cyan-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

export const ALL_CATEGORIES: FileCategory[] = [
  'IDENTITY', 'PROPERTY', 'FINANCIAL', 'INSURANCE', 'MEDICAL',
  'LEGAL', 'TAX', 'TRAVEL', 'FAMILY', 'DIGITAL_ASSETS', 'OTHER',
];
