import React from 'react';
import { Camera, Lock, Plus, Upload, Search, Unlock } from 'lucide-react';
import { ActiveTab, GalleryViewMode } from '../types/gallery';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  onOpenNewAlbum: () => void;
  viewMode: GalleryViewMode;
  onViewModeChange: (mode: GalleryViewMode) => void;
  hasUnlockedPrivateAlbums: boolean;
  onLockAll: () => void;
  totalPhotosCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onOpenNewAlbum,
  viewMode,
  onViewModeChange,
  hasUnlockedPrivateAlbums,
  onLockAll,
  totalPhotosCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('all')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700/60 group-hover:border-amber-500/50 transition-colors">
              <Camera className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              Lumina
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links / Segmented Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            All Photos <span className="text-zinc-500 ml-1">({totalPhotosCount})</span>
          </button>
          <button
            onClick={() => onTabChange('albums')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'albums'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Private Albums
          </button>
          <button
            onClick={() => onTabChange('favorites')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Favorites
          </button>
        </nav>

        {/* Zone 3: Actions + Search */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative hidden sm:block w-44 lg:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search photos, tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>

          {/* Lock All Albums Button (if any private album unlocked in session) */}
          {hasUnlockedPrivateAlbums && (
            <button
              onClick={onLockAll}
              title="Lock all private albums in this session"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Vault</span>
            </button>
          )}

          {/* New Album button */}
          <button
            onClick={onOpenNewAlbum}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-100 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">New Album</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-950" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex md:hidden items-center justify-between pt-3 mt-2 border-t border-zinc-800/60 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => onTabChange('albums')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'albums' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            Albums
          </button>
          <button
            onClick={() => onTabChange('favorites')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'favorites' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            Favorites
          </button>
        </div>

        <div className="relative flex-1 max-w-[170px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-7 pr-2 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>
    </header>
  );
};
