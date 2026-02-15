'use client';

import { useState, useEffect, useCallback } from 'react';
import { EmergencyAuthGuard } from '@/components/emergency/EmergencyAuthGuard';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { useCryptoStore } from '@/store/cryptoStore';
import { filesApi } from '@/lib/api/files';
import { decryptFile } from '@/lib/crypto/fileEncryption';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import { categoryLabel, categoryColor, categoryIcon } from '@/lib/utils/categories';
import type { File as LSFile } from '@legacy-shield/shared';
import { ShieldAlert, Download, FileText, Image, File as FileIcon, Eye, LogOut } from 'lucide-react';

function EmergencyVaultContent() {
  const [files, setFiles] = useState<LSFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<LSFile | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const emergencyKey = useCryptoStore((s) => s.emergencyKey);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      
      const BATCH_SIZE = 50;
      let allFiles: LSFile[] = [];
      let offset = 0;
      
      while (true) {
        const res = await filesApi.listFiles({ limit: BATCH_SIZE, offset });
        if (res.files.length === 0) break;
        
        allFiles = [...allFiles, ...res.files];
        offset += res.files.length;
        
        if (res.files.length < BATCH_SIZE) break;
      }

      // Sort: emergency priority first, then by date
      const sorted = allFiles.sort((a, b) => {
        if (a.isEmergencyPriority && !b.isEmergencyPriority) return -1;
        if (!a.isEmergencyPriority && b.isEmergencyPriority) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setFiles(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleDownload = async (file: LSFile) => {
    if (!emergencyKey) return;
    setDownloadingId(file.id);
    try {
      const fileData = await filesApi.getFile(file.id);
      if (!fileData.emergencyEncryptedKey || !fileData.emergencyIV) {
        throw new Error('This file is not available for emergency access');
      }
      const encryptedBlob = await filesApi.downloadFromPresignedUrl(fileData.downloadUrl, file.id);
      const decrypted = await decryptFile(
        encryptedBlob,
        fileData.emergencyEncryptedKey,
        fileData.emergencyIV,
        fileData.iv,
        fileData.authTag,
        emergencyKey
      );
      const blob = new Blob([decrypted], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExit = () => {
    useCryptoStore.getState().clearKeys();
    window.location.href = '/emergency-portal';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-medium">
              <ShieldAlert className="h-3.5 w-3.5" />
              Emergency Access — Read Only
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleExit}>
            <LogOut className="h-4 w-4 mr-1.5" /> Exit
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Alert variant="info" className="mb-6">
          You have read-only access to this vault. Documents can be viewed and downloaded but not modified.
        </Alert>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && <Alert variant="error">{error}</Alert>}

        {!loading && !error && files.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">No documents available.</p>
          </div>
        )}

        {!loading && files.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 hidden md:table-cell">Size</th>
                  <th className="px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const MimeIcon = file.mimeType.startsWith('image/') ? Image : file.mimeType === 'application/pdf' ? FileText : FileIcon;
                  const CategoryIcon = file.category ? categoryIcon[file.category] : null;
                  return (
                    <tr key={file.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <MimeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium truncate max-w-[200px]">{file.filename}</span>
                        {file.isEmergencyPriority && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">Priority</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {file.category ? (
                          <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', categoryColor[file.category])}>
                            {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                            {categoryLabel[file.category]}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">{formatFileSize(file.fileSizeBytes)}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">{formatDate(file.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setViewingFile(file)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(file)}
                            disabled={downloadingId === file.id}
                            className="p-1.5 text-gray-400 hover:text-primary-600 rounded disabled:opacity-50"
                            title="Download"
                          >
                            {downloadingId === file.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Document viewer overlay */}
      <DocumentViewer file={viewingFile} onClose={() => setViewingFile(null)} />
    </div>
  );
}

export default function EmergencyVaultPage() {
  return (
    <EmergencyAuthGuard>
      <EmergencyVaultContent />
    </EmergencyAuthGuard>
  );
}
