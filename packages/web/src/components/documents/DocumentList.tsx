'use client';

import { useState, useRef, useEffect } from 'react';
import type { File as LSFile } from '@legacy-shield/shared';
import { useFilesStore } from '@/store/filesStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Upload, Star, ShieldAlert, FileText, Image, File as FileIcon, MoreVertical, Download, Trash2, Pencil } from 'lucide-react';
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

function ActionMenu({ file, onEdit, onDownload, onDelete, onToggleFavorite }: { 
  file: LSFile; 
  onEdit: () => void; 
  onDownload: () => void; 
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); setOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Star className={cn("h-4 w-4", file.isFavorite ? "fill-amber-400 text-amber-400" : "text-gray-400")} />
            {file.isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Pencil className="h-4 w-4 text-gray-400" />
            Edit details
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); setOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-gray-400" />
            Download
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function DocumentList({ onFileClick, onFileEdit, onFileDownload, onFileDelete, onToggleFavorite, onUploadClick }: DocumentListProps) {
  const { files, loading, error, sortBy } = useFilesStore();
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

  return (
    <div className="space-y-2">
      {sorted.map((file) => {
        const MimeIcon = file.mimeType.startsWith('image/') ? Image : file.mimeType === 'application/pdf' ? FileText : FileIcon;
        const CategoryIcon = file.category ? categoryIcon[file.category] : null;
        
        return (
          <div
            key={file.id}
            onClick={() => onFileClick(file)}
            className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-4 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer group"
          >
            <div className="p-2.5 bg-gray-100 rounded-lg flex-shrink-0 text-gray-500 group-hover:bg-white group-hover:text-primary-600 transition-colors">
              <MimeIcon className="h-6 w-6" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 truncate">{file.filename}</span>
                {file.isFavorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />}
                {file.isEmergencyPriority && <div title="Emergency Access Enabled"><ShieldAlert className="h-3.5 w-3.5 text-red-500 flex-shrink-0" /></div>}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {file.category && (
                  <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium', categoryColor[file.category])}>
                    {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                    {categoryLabel[file.category]}
                  </span>
                )}
                <span>{formatFileSize(file.fileSizeBytes)}</span>
                <span className="hidden sm:inline">Added {formatDate(file.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex text-gray-400 hover:text-gray-600"
                onClick={() => onFileDownload(file)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <ActionMenu 
                file={file}
                onEdit={() => onFileEdit(file)}
                onDownload={() => onFileDownload(file)}
                onDelete={() => onFileDelete(file)}
                onToggleFavorite={() => onToggleFavorite(file)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
