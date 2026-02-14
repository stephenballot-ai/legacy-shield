'use client';

import type { File as LSFile } from '@legacy-shield/shared';
import { useFilesStore } from '@/store/filesStore';
import { DocumentCard } from './DocumentCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Upload, Star, ShieldAlert, FileText, Image, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import { categoryLabel, categoryColor, categoryIcon } from '@/lib/utils/categories';

interface DocumentListProps {
  onFileClick: (file: LSFile) => void;
  onFileEdit: (file: LSFile) => void;
  onFileDownload: (file: LSFile) => void;
  onFileDelete: (file: LSFile) => void;
  onToggleFavorite: (file: LSFile) => void;
  onUploadClick: () => void;
}

function getSortedFiles(files: LSFile[], sortBy: 'date' | 'name' | 'size'): LSFile[] {
  return [...files].sort((a, b) => {
    if (sortBy === 'name') return a.filename.localeCompare(b.filename);
    if (sortBy === 'size') return b.fileSizeBytes - a.fileSizeBytes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function DocumentList({ onFileClick, onFileEdit, onFileDownload, onFileDelete, onToggleFavorite, onUploadClick }: DocumentListProps) {
  const { files, loading, error, viewMode, sortBy } = useFilesStore();
  const sorted = getSortedFiles(files, sortBy);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-sm">{error}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => useFilesStore.getState().fetchFiles()}>
          Retry
        </Button>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="p-4 bg-primary-50 rounded-full mb-4">
          <Upload className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          Upload your first document. Everything is encrypted in your browser before it leaves your device.
        </p>
        <Button onClick={onUploadClick}>Upload document</Button>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map((file) => (
          <DocumentCard
            key={file.id}
            file={file}
            onClick={() => onFileClick(file)}
            onToggleFavorite={() => onToggleFavorite(file)}
            onEdit={() => onFileEdit(file)}
            onDownload={() => onFileDownload(file)}
            onDelete={() => onFileDelete(file)}
          />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-2">
      {sorted.map((file) => {
        const MimeIcon = file.mimeType.startsWith('image/') ? Image : file.mimeType === 'application/pdf' ? FileText : FileIcon;
        const CategoryIcon = file.category ? categoryIcon[file.category] : null;
        return (
          <div
            key={file.id}
            onClick={() => onFileClick(file)}
            className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer group"
          >
            <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
              <MimeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">{file.filename}</span>
                {file.isFavorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />}
                {file.isEmergencyPriority && <ShieldAlert className="h-3 w-3 text-red-500 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {file.category && (
                  <span className={cn('inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium', categoryColor[file.category])}>
                    {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                    {categoryLabel[file.category]}
                  </span>
                )}
                <span className="text-xs text-gray-400">{formatFileSize(file.fileSizeBytes)}</span>
                <span className="text-xs text-gray-400 hidden sm:inline">· {formatDate(file.createdAt)}</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onFileEdit(file); }}
              className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 sm:opacity-100 p-1"
            >
              •••
            </button>
          </div>
        );
      })}
    </div>
  );
}
