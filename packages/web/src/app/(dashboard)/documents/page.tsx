'use client';

import { useEffect, useState, useCallback } from 'react';
import type { File as LSFile } from '@legacy-shield/shared';
import { Plus } from 'lucide-react';
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

export default function DocumentsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<LSFile | null>(null);
  const [editFile, setEditFile] = useState<LSFile | null>(null);

  const { fetchFiles, updateFile, removeFile } = useFilesStore();
  const masterKey = useCryptoStore((s) => s.masterKey);
  const emergencyKey = useCryptoStore((s) => s.emergencyKey);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleToggleFavorite = useCallback(async (file: LSFile) => {
    try {
      const updated = await filesApi.updateFile(file.id, { isFavorite: !file.isFavorite });
      updateFile(file.id, updated);
    } catch {
      // silent fail
    }
  }, [updateFile]);

  const handleDownload = useCallback(async (file: LSFile) => {
    try {
      const fileData = await filesApi.getFile(file.id);
      const encryptedBlob = await filesApi.downloadFromPresignedUrl(fileData.downloadUrl);

      const key = masterKey || emergencyKey;
      if (!key) return;

      const encKey = masterKey ? fileData.ownerEncryptedKey : fileData.emergencyEncryptedKey;
      const keyIV = masterKey ? fileData.ownerIV : fileData.emergencyIV;
      if (!encKey || !keyIV) return;

      const decrypted = await decryptFile(encryptedBlob, encKey, keyIV, fileData.iv, fileData.authTag, key);

      const blob = new Blob([decrypted], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // TODO: toast error
    }
  }, [masterKey, emergencyKey]);

  const handleDelete = useCallback(async (file: LSFile) => {
    if (!confirm(`Delete "${file.filename}"?`)) return;
    try {
      await filesApi.deleteFile(file.id);
      removeFile(file.id);
    } catch {
      // TODO: toast error
    }
  }, [removeFile]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">Your encrypted document vault</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Upload
        </Button>
      </div>

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
