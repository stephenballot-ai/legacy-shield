'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useFilesStore } from '@/store/filesStore';
import { DOCUMENT_LIMITS } from '@legacy-shield/shared';
import { usersApi } from '@/lib/api/users';
import { emergencyAccessApi } from '@/lib/api/emergencyAccess';
import { FileText, ShieldAlert, Upload, Clock, ArrowRight, Gift, Copy, Check } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { LegacyReadiness } from '@/components/dashboard/LegacyReadiness';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import type { FileCategory } from '@legacy-shield/shared';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { files, total, fetchFiles } = useFilesStore();
  const [docLimit, setDocLimit] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [emergencyCount, setEmergencyCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [uploadOpen, setUploadOpen] = useState(false);
  const [initialCategory, setInitialCategory] = useState<FileCategory | null>(null);

  const tier = user?.tier || 'FREE';
  const fallbackMax = tier === 'PRO' ? DOCUMENT_LIMITS.PRO_TIER : DOCUMENT_LIMITS.FREE_TIER;
  const maxFiles = docLimit ?? fallbackMax;

  const handleUploadClick = (category?: FileCategory) => {
    setInitialCategory(category || null);
    setUploadOpen(true);
  };

  useEffect(() => {
    // Fetch user profile stats
    usersApi.getMe().then((p) => {
      setDocLimit(p.documentLimit);
      if (p.referralCode) setReferralCode(p.referralCode);
    }).catch(() => {});

    // Fetch emergency status
    emergencyAccessApi.getStatus().then((s) => {
      setEmergencyCount(s.contactCount);
    }).catch(() => setEmergencyCount(null));
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const recentFiles = [...files]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: 'Documents', value: `${total} / ${maxFiles}`, icon: FileText, color: 'text-primary-600 bg-primary-50' },
    { 
      label: 'Emergency Contacts', 
      value: emergencyCount !== null ? emergencyCount.toString() : 'Not set up', 
      icon: ShieldAlert, 
      color: 'text-trust-600 bg-trust-50' 
    },
    { label: 'Last Activity', value: recentFiles[0] ? formatDate(recentFiles[0].createdAt) : 'No activity', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your secure document vault</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <LegacyReadiness onUpload={handleUploadClick} />

      {/* Recent documents */}
      {recentFiles.length > 0 ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Documents</h2>
            <Link href="/documents" className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentFiles.map((file) => (
              <Link key={file.id} href="/documents" className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.filename}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.fileSizeBytes)}</p>
                </div>
                <span className="text-xs text-gray-400">{formatDate(file.createdAt)}</span>
              </Link>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center py-12 text-center">
          <div className="p-4 bg-primary-50 rounded-full mb-4">
            <Upload className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Upload your first document</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Your files are encrypted in the browser before upload. We never see your data.
          </p>
          <Link href="/documents">
            <Button onClick={(e) => { e.preventDefault(); handleUploadClick(); }}>Upload document</Button>
          </Link>
        </Card>
      )}

      <DocumentUpload 
        open={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        initialCategory={initialCategory}
      />

      {/* Referral CTA — show when at limit on free tier */}
      {tier !== 'PRO' && referralCode && (
        <Card className="bg-gradient-to-r from-primary-50 to-trust-50 border-primary-200">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white rounded-lg shadow-sm flex-shrink-0">
              <Gift className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">
                {total >= maxFiles ? 'Need more space? Invite a friend!' : 'Share LegacyShield, earn more storage'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Get <strong>+5 documents</strong> for each friend who signs up and uploads a file. You can earn up to 25 docs free!
              </p>
              <div className="flex items-center gap-2 mt-3">
                <code className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 truncate">
                  legacyshield.eu/r/{referralCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://legacyshield.eu/r/${referralCode}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-trust-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Usage bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Storage Usage</span>
          <span className="text-xs text-gray-500">{total} of {maxFiles} documents</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((total / maxFiles) * 100, 100)}%` }}
          />
        </div>
        {total >= maxFiles && tier !== 'PRO' && (
          <p className="text-xs text-amber-600 mt-2">
            Limit reached. Invite a friend for +5 docs, or <Link href="/settings" className="underline font-medium">upgrade to Pro</Link> for {DOCUMENT_LIMITS.PRO_TIER}.
          </p>
        )}
      </Card>
    </div>
  );
}
