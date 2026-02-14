'use client';

import { useState, useEffect } from 'react';
import type { File as LSFile, FileCategory } from '@legacy-shield/shared';
import { X, Star, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { filesApi } from '@/lib/api/files';
import { useFilesStore } from '@/store/filesStore';
import { ALL_CATEGORIES, categoryLabel } from '@/lib/utils/categories';

interface DocumentEditProps {
  file: LSFile | null;
  onClose: () => void;
}

export function DocumentEdit({ file, onClose }: DocumentEditProps) {
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState<FileCategory | null>(null);
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEmergencyPriority, setIsEmergencyPriority] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFileInStore = useFilesStore((s) => s.updateFile);

  useEffect(() => {
    if (file) {
      setFilename(file.filename);
      setCategory(file.category);
      setTags(file.tags.join(', '));
      setIsFavorite(file.isFavorite);
      setIsEmergencyPriority(file.isEmergencyPriority);
      setExpiresAt(file.expiresAt ? new Date(file.expiresAt).toISOString().split('T')[0] : '');
      setError(null);
    }
  }, [file]);

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    setError(null);

    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const updated = await filesApi.updateFile(file.id, {
        filename,
        category,
        tags: tagList,
        isFavorite,
        isEmergencyPriority,
        expiresAt: expiresAt || null,
      });
      updateFileInStore(file.id, updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Document</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category || ''}
              onChange={(e) => setCategory((e.target.value || null) as FileCategory | null)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white"
            >
              <option value="">No category</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{categoryLabel[c]}</option>
              ))}
            </select>
          </div>

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

          <div className="flex gap-4">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
                isFavorite ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-300 text-gray-600'
              )}
            >
              <Star className={cn('h-4 w-4', isFavorite && 'fill-amber-400')} />
              Favorite
            </button>
            <button
              onClick={() => setIsEmergencyPriority(!isEmergencyPriority)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
                isEmergencyPriority ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-300 text-gray-600'
              )}
            >
              <ShieldAlert className={cn('h-4 w-4', isEmergencyPriority && 'text-red-500')} />
              Emergency
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} isLoading={saving}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
