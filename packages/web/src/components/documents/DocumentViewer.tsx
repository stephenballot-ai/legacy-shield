'use client';

import { useState, useEffect } from 'react';
import type { File as LSFile } from '@legacy-shield/shared';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { useCryptoStore } from '@/store/cryptoStore';
import { filesApi } from '@/lib/api/files';
import { decryptFile } from '@/lib/crypto/fileEncryption';

interface DocumentViewerProps {
  file: LSFile | null;
  onClose: () => void;
}

export function DocumentViewer({ file, onClose }: DocumentViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const masterKey = useCryptoStore((s) => s.masterKey);
  const emergencyKey = useCryptoStore((s) => s.emergencyKey);

  useEffect(() => {
    if (!file) return;

    let url: string | null = null;

    const load = async () => {
      setLoading(true);
      setError(null);
      setBlobUrl(null);

      try {
        const fileData = await filesApi.getFile(file.id);
        const encryptedBlob = await filesApi.downloadFromPresignedUrl(fileData.downloadUrl, file.id);

        // Try owner key first, then emergency key
        const key = masterKey || emergencyKey;
        if (!key) throw new Error('No decryption key available');

        const encKey = masterKey ? fileData.ownerEncryptedKey : fileData.emergencyEncryptedKey;
        const keyIV = masterKey ? fileData.ownerIV : fileData.emergencyIV;

        if (!encKey || !keyIV) throw new Error('Encrypted key not available for this session type');

        const decrypted = await decryptFile(encryptedBlob, encKey, keyIV, fileData.iv, fileData.authTag, key);

        const blob = new Blob([decrypted], { type: file.mimeType });
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to decrypt file');
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file, masterKey, emergencyKey]);

  const handleDownload = () => {
    if (!blobUrl || !file) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.filename;
    a.click();
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between p-4 bg-black/30" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-white font-medium truncate">{file.filename}</h3>
        <div className="flex items-center gap-2">
          {blobUrl && (
            <Button variant="ghost" size="sm" onClick={handleDownload} className="text-white hover:bg-white/10">
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          )}
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
        {loading && (
          <div className="text-center">
            <LoadingSpinner size="lg" className="text-white" />
            <p className="text-white/70 text-sm mt-3">Decrypting…</p>
          </div>
        )}

        {error && (
          <div className="max-w-sm">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {blobUrl && file.mimeType.startsWith('image/') && (
          <img src={blobUrl} alt={file.filename} className="max-w-full max-h-full object-contain rounded-lg" />
        )}

        {blobUrl && file.mimeType === 'application/pdf' && (
          <iframe src={blobUrl} className="w-full h-full rounded-lg bg-white" title={file.filename} />
        )}

        {blobUrl && !file.mimeType.startsWith('image/') && file.mimeType !== 'application/pdf' && (
          <div className="text-center">
            <p className="text-white/70 text-sm mb-4">Preview not available for this file type</p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
