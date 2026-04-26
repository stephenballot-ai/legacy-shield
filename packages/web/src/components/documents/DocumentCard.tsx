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
      className="bg-white rounded-xl border border-line shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Content */}
      <div className="p-3 flex items-start gap-3">
        <div className="p-2 bg-bg-sunken rounded-lg flex-shrink-0">
          <MimeIcon className="h-6 w-6 text-fg-subtle" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-fg truncate">{file.filename}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {file.category && (
              <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', categoryColor[file.category])}>
                {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                {categoryLabel[file.category]}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-fg-subtle">
            <span>{formatFileSize(file.fileSizeBytes)}</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Favorite star */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        className="absolute top-2.5 right-8 p-1 rounded-full hover:bg-bg-sunken transition-colors"
      >
        <Star className={cn('h-3.5 w-3.5', file.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-fg-subtle group-hover:text-fg-subtle')} />
      </button>

      {/* Emergency badge */}
      {file.isEmergencyPriority && (
        <div className="absolute top-2.5 right-16 p-1">
          <ShieldAlert className="h-3.5 w-3.5 text-danger" />
        </div>
      )}

      {/* Menu */}
      <div className="absolute top-2.5 right-1" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-1 rounded-full hover:bg-bg-sunken transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4 text-fg-subtle" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[120px]">
            <button onClick={(e) => { e.stopPropagation(); onDownload(); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-bg-sunken">Download</button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-bg-sunken">Edit</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm text-danger hover:bg-danger-bg">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
