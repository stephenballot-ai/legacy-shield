'use client';

import { useFilesStore } from '@/store/filesStore';
import { Search, LayoutGrid, List, Star, ChevronDown } from 'lucide-react';
import { ALL_CATEGORIES, categoryLabel } from '@/lib/utils/categories';
import type { FileCategory } from '@legacy-shield/shared';
import { cn } from '@/lib/utils';

export function DocumentFilters() {
  const { category, search, favoritesOnly, viewMode, sortBy, setCategory, setSearch, setFavoritesOnly, setViewMode, setSortBy, fetchFiles } = useFilesStore();

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSearchSubmit = () => {
    fetchFiles();
  };

  const handleCategoryChange = (value: string) => {
    setCategory((value || null) as FileCategory | null);
    // Fetch after category change
    setTimeout(() => useFilesStore.getState().fetchFiles(), 0);
  };

  const handleFavoritesToggle = () => {
    setFavoritesOnly(!favoritesOnly);
    setTimeout(() => useFilesStore.getState().fetchFiles(), 0);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          placeholder="Search documents…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
        />
      </div>

      {/* Category filter */}
      <div className="relative">
        <select
          value={category || ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm bg-white"
        >
          <option value="">All categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryLabel[c]}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Favorites toggle */}
      <button
        onClick={handleFavoritesToggle}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors',
          favoritesOnly
            ? 'border-amber-300 bg-amber-50 text-amber-700'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
        )}
      >
        <Star className={cn('h-4 w-4', favoritesOnly && 'fill-amber-400')} />
        Favorites
      </button>

      {/* Sort */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
          className="appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm bg-white"
        >
          <option value="date">Sort: Date</option>
          <option value="name">Sort: Name</option>
          <option value="size">Sort: Size</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* View mode */}
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          onClick={() => setViewMode('grid')}
          className={cn('p-2 transition-colors', viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600')}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={cn('p-2 transition-colors', viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600')}
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
