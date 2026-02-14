'use client';

import { create } from 'zustand';
import type { File as LSFile, FileCategory } from '@legacy-shield/shared';
import { filesApi } from '@/lib/api/files';

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'name' | 'size';

interface FilesState {
  files: LSFile[];
  total: number;
  loading: boolean;
  error: string | null;

  // Filters
  category: FileCategory | null;
  search: string;
  favoritesOnly: boolean;
  viewMode: ViewMode;
  sortBy: SortBy;

  // Actions
  fetchFiles: () => Promise<void>;
  addFile: (file: LSFile) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<LSFile>) => void;
  setCategory: (category: FileCategory | null) => void;
  setSearch: (search: string) => void;
  setFavoritesOnly: (favoritesOnly: boolean) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setSortBy: (sortBy: SortBy) => void;
}

export const useFilesStore = create<FilesState>((set, get) => ({
  files: [],
  total: 0,
  loading: false,
  error: null,
  category: null,
  search: '',
  favoritesOnly: false,
  viewMode: 'list',
  sortBy: 'date',

  fetchFiles: async () => {
    const { category, search, favoritesOnly } = get();
    set({ loading: true, error: null });
    try {
      const res = await filesApi.listFiles({
        category: category || undefined,
        search: search || undefined,
        favorites: favoritesOnly || undefined,
        limit: 100,
      });
      set({ files: res.files, total: res.total, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load files', loading: false });
    }
  },

  addFile: (file) => set((s) => ({ files: [file, ...s.files], total: s.total + 1 })),

  removeFile: (id) => set((s) => ({
    files: s.files.filter((f) => f.id !== id),
    total: s.total - 1,
  })),

  updateFile: (id, updates) => set((s) => ({
    files: s.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
  })),

  setCategory: (category) => set({ category }),
  setSearch: (search) => set({ search }),
  setFavoritesOnly: (favoritesOnly) => set({ favoritesOnly }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSortBy: (sortBy) => set({ sortBy }),
}));
