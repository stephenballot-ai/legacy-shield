'use client';

import { useEffect, useState, useCallback } from 'react';
import type { File as LSFile } from '@legacy-shield/shared';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useFilesStore } from '@/store/filesStore';
import { useCryptoStore } from '@/store/cryptoStore';
import { filesApi } from '@/lib/api/files';
import { decryptFile } from '@/lib/crypto/fileEncryption';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { DocumentEdit } from '@/components/documents/DocumentEdit';
import { PasswordPrompt } from '@/components/auth/PasswordPrompt';

export default function DocumentsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<LSFile | null>(null);
  const [editFile, setEditFile] = useState<LSFile | null>(null);

  const { fetchFiles, updateFile, removeFile } = useFilesStore();
  const masterKey = useCryptoStore((s) => s.masterKey);
  const emergencyKey = useCryptoStore((s) => s.emergencyKey);
  const [unlocked, setUnlocked] = useState(!!masterKey);

  useEffect(() => {
    if (masterKey) setUnlocked(true);
  }, [masterKey]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleToggleFavorite = useCallback(async (file: LSFile) => {
    try {
      const updated = await filesApi.updateFile(file.id, { isFavorite: !file.isFavorite });
      updateFile(file.id, updated);
    } catch (err) {
      console.error('Toggle favorite failed:', err);
    }
  }, [updateFile]);

  const handleDownload = useCallback(async (file: LSFile) => {
    try {
      const fileData = await filesApi.getFile(file.id);
      // Route through the API proxy (passing file.id) so we don't depend on
      // the presigned-URL TTL or storage CORS — same path the viewer uses.
      const encryptedBlob = await filesApi.downloadFromPresignedUrl(fileData.downloadUrl, file.id);

      const key = masterKey || emergencyKey;
      if (!key) {
        toast.error('Vault is locked. Re-enter your password and try again.');
        return;
      }

      const encKey = masterKey ? fileData.ownerEncryptedKey : fileData.emergencyEncryptedKey;
      const keyIV = masterKey ? fileData.ownerIV : fileData.emergencyIV;
      if (!encKey || !keyIV) {
        toast.error('This file is missing decryption metadata.');
        return;
      }

      const decrypted = await decryptFile(encryptedBlob, encKey, keyIV, fileData.iv, fileData.authTag, key);

      const blob = new Blob([decrypted], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to download file';
      toast.error(message);
    }
  }, [masterKey, emergencyKey]);

  const handleDelete = useCallback(async (file: LSFile) => {
    if (!confirm(`Delete "${file.filename}"?`)) return;
    try {
      await filesApi.deleteFile(file.id);
      removeFile(file.id);
      toast.success('Document deleted.');
    } catch (err) {
      console.error('Delete failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      toast.error(message);
    }
  }, [removeFile]);

  if (!unlocked && !masterKey) {
    return (
      <div className="mx-auto mt-[var(--s-12)] max-w-md">
        <PasswordPrompt onUnlocked={() => setUnlocked(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-[var(--s-9)]">
      <header className="flex items-end justify-between gap-[var(--s-5)]">
        <div>
          <span className="t-eyebrow text-fg-subtle">§ Vault</span>
          <h1
            className="mt-[var(--s-3)] font-display text-fg"
            style={{
              fontSize: 'var(--t-3xl)',
              letterSpacing: 'var(--tracking-snug)',
              lineHeight: 'var(--lh-snug)',
              margin: 0,
            }}
          >
            Documents in custody
          </h1>
          <p className="mt-[var(--s-3)] text-[13px] text-fg-muted">
            Encrypted in your browser before they ever leave it.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} variant="accent">
          <Plus className="h-4 w-4" strokeWidth={1.8} /> Upload
        </Button>
      </header>

      <DocumentFilters />

      <DocumentList
        onFileClick={setViewerFile}
        onFileEdit={setEditFile}
        onFileDownload={handleDownload}
        onFileDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onUploadClick={() => setUploadOpen(true)}
      />

      <DocumentUpload open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <DocumentViewer file={viewerFile} onClose={() => setViewerFile(null)} />
      <DocumentEdit file={editFile} onClose={() => setEditFile(null)} />
    </div>
  );
}
