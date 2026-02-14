'use client';

import type { File as LSFile } from '@legacy-shield/shared';
import { Star, ShieldAlert, FileText, Image, File as FileIcon, MoreVertical } from 'lucide-react';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import { categoryLabel, categoryColor, categoryIcon } from '@/lib/utils/categories';
import { useState, useRef, useEffect } from 'react';

interface DocumentCardProps {
  file: LSFile;
  onClick: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType === 'application/pdf') return FileText;
  return FileIcon;
}

export function DocumentCard({ file, onClick, onToggleFavorite, onEdit, onDownload, onDelete }: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const MimeIcon = getMimeIcon(file.mimeType);
  const CategoryIcon = file.category ? categoryIcon[file.category] : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Icon area */}
      <div className="h-32 flex items-center justify-center bg-gray-50 rounded-t-xl">
        <MimeIcon className="h-12 w-12 text-gray-300" />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {file.category && (
            <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', categoryColor[file.category])}>
              {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
              {categoryLabel[file.category]}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatFileSize(file.fileSizeBytes)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>

      {/* Favorite star */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        className="absolute top-2 left-2 p-1 rounded-full hover:bg-white/80 transition-colors"
      >
        <Star className={cn('h-4 w-4', file.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300 group-hover:text-gray-400')} />
      </button>

      {/* Emergency badge */}
      {file.isEmergencyPriority && (
        <div className="absolute top-2 right-10 p-1">
          <ShieldAlert className="h-4 w-4 text-red-500" />
        </div>
      )}

      {/* Menu */}
      <div className="absolute top-2 right-2" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-1 rounded-full hover:bg-white/80 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[120px]">
            <button onClick={(e) => { e.stopPropagation(); onDownload(); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">Download</button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">Edit</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
