'use client';

import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';
import { useCryptoStore } from '@/store/cryptoStore';
import { useAuthStore } from '@/store/authStore';
import { useFilesStore } from '@/store/filesStore';
import { encryptFile } from '@/lib/crypto/fileEncryption';
import { filesApi } from '@/lib/api/files';
import { DOCUMENT_LIMITS, FILE_SIZE_LIMITS } from '@legacy-shield/shared';
import { ALL_CATEGORIES, categoryLabel } from '@/lib/utils/categories';
import type { FileCategory } from '@legacy-shield/shared';

interface UploadItem {
  file: File;
  status: 'pending' | 'encrypting' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface DocumentUploadProps {
  open: boolean;
  onClose: () => void;
  initialCategory?: FileCategory | null;
}

export function DocumentUpload({ open, onClose, initialCategory }: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [category, setCategory] = useState<FileCategory | null>(initialCategory || null);
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [referralToast, setReferralToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update category when initialCategory changes or modal opens
  useEffect(() => {
    if (open) {
      setCategory(initialCategory || null);
    }
  }, [open, initialCategory]);

  const masterKey = useCryptoStore((s) => s.masterKey);
  const emergencyKey = useCryptoStore((s) => s.emergencyKey);
  const user = useAuthStore((s) => s.user);
  const { total, addFile } = useFilesStore();

  const tier = user?.tier || 'FREE';
  const maxFiles = tier === 'PRO' ? DOCUMENT_LIMITS.PRO_TIER : DOCUMENT_LIMITS.FREE_TIER;
  const maxSize = tier === 'PRO' ? FILE_SIZE_LIMITS.PRO_TIER : FILE_SIZE_LIMITS.FREE_TIER;

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const addFiles = (files: File[]) => {
    const newUploads = files.map((file) => ({ file, status: 'pending' as const }));
    setUploads((prev) => [...prev, ...newUploads]);
  };

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (!masterKey) return;

    // Check document limit
    if (total + uploads.filter((u) => u.status === 'pending').length > maxFiles) {
      setUploads((prev) =>
        prev.map((u) =>
          u.status === 'pending'
            ? { ...u, status: 'error' as const, error: `Document limit reached (${maxFiles}). Upgrade to Pro for more.` }
            : u
        )
      );
      return;
    }

    setIsUploading(true);
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

    for (let i = 0; i < uploads.length; i++) {
      const item = uploads[i];
      if (item.status !== 'pending') continue;

      // Check file size
      if (item.file.size > maxSize) {
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i ? { ...u, status: 'error', error: `File too large. Max: ${formatFileSize(maxSize)}` } : u
          )
        );
        continue;
      }

      // Encrypting
      setUploads((prev) =>
        prev.map((u, idx) => (idx === i ? { ...u, status: 'encrypting' } : u))
      );

      try {
        const encrypted = await encryptFile(item.file, masterKey, emergencyKey || undefined);

        // Uploading
        setUploads((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, status: 'uploading' } : u))
        );

        const { fileId, uploadUrl, referralTriggered, referralCode } = await filesApi.uploadFile({
          filename: item.file.name,
          fileSizeBytes: item.file.size,
          mimeType: item.file.type || 'application/octet-stream',
          category,
          tags: tagList.length ? tagList : undefined,
          ownerEncryptedKey: encrypted.ownerEncryptedKey,
          ownerIV: encrypted.ownerIV,
          emergencyEncryptedKey: encrypted.emergencyEncryptedKey || null,
          emergencyIV: encrypted.emergencyIV || null,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
        });

        await filesApi.uploadToPresignedUrl(uploadUrl, encrypted.encryptedBlob, fileId);

        // Add to store (construct file object)
        addFile({
          id: fileId,
          userId: user?.id || '',
          filename: item.file.name,
          fileSizeBytes: item.file.size,
          mimeType: item.file.type || 'application/octet-stream',
          category,
          tags: tagList,
          isFavorite: false,
          isEmergencyPriority: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        });

        setUploads((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, status: 'done' } : u))
        );

        if (referralTriggered && referralCode) {
          setReferralToast(referralCode);
        }
      } catch (err) {
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? { ...u, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' }
              : u
          )
        );
      }
    }

    setIsUploading(false);
  };

  const handleClose = () => {
    if (!isUploading) {
      setUploads([]);
      setCategory(null);
      setTags('');
      onClose();
    }
  };

  const pendingCount = uploads.filter((u) => u.status === 'pending').length;
  const doneCount = uploads.filter((u) => u.status === 'done').length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Upload Documents</h2>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600" disabled={isUploading}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!masterKey && (
            <Alert variant="error">
              Encryption key not available. Please log in again.
            </Alert>
          )}

          {total >= maxFiles && (
            <Alert variant="warning">
              You&apos;ve reached the {maxFiles}-document limit.{' '}
              {tier !== 'PRO' && <a href="/settings" className="underline font-medium">Upgrade to Pro</a>}
            </Alert>
          )}

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
            )}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Drag & drop files here, or <span className="text-primary-600 font-medium">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Max {formatFileSize(maxSize)} per file</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(Array.from(e.target.files));
              e.target.value = '';
            }}
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <select
                value={category || ''}
                onChange={(e) => setCategory((e.target.value || null) as FileCategory | null)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white appearance-none pr-8"
              >
                <option value="">No category</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{categoryLabel[c]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. passport, 2024"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>

          {/* File list */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              {uploads.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(item.file.size)}</p>
                  </div>
                  {item.status === 'pending' && (
                    <button onClick={() => removeUpload(i)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {item.status === 'encrypting' && <span className="text-xs text-amber-600">Encrypting…</span>}
                  {item.status === 'uploading' && <span className="text-xs text-blue-600">Uploading…</span>}
                  {item.status === 'done' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {item.status === 'error' && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {item.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {referralToast && (
          <div className="mx-4 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">🎉 Nice! You just helped your friend earn bonus storage.</p>
            <p className="text-sm text-green-700 mt-1">
              Want more space too? Share your invite link:
            </p>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs bg-white border border-green-200 rounded-lg px-3 py-2 flex-1 truncate">
                legacyshield.eu/r/{referralToast}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://legacyshield.eu/r/${referralToast}`);
                }}
                className="px-3 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-xl">
          <span className="text-xs text-gray-500">
            {doneCount > 0 && `${doneCount} uploaded`}
            {pendingCount > 0 && ` · ${pendingCount} pending`}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleClose} disabled={isUploading}>
              {doneCount > 0 && pendingCount === 0 ? 'Done' : 'Cancel'}
            </Button>
            {pendingCount > 0 && (
              <Button size="sm" onClick={handleUploadAll} isLoading={isUploading} disabled={!masterKey || total >= maxFiles}>
                Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
