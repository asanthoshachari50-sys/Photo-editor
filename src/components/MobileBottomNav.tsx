import React from 'react';
import { Image as ImageIcon, Folder, SlidersHorizontal } from 'lucide-react';

export type MobileTab = 'photos' | 'albums' | 'editor';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  photosCount: number;
  albumsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  photosCount,
  albumsCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 max-w-md mx-auto">
      <div className="grid grid-cols-3 items-center h-16 px-3">
        {/* Tab 1: Photos */}
        <button
          onClick={() => onTabChange('photos')}
          className="min-h-[48px] flex flex-col items-center justify-center relative py-1 focus:outline-none transition-colors"
        >
          <div className="relative">
            <ImageIcon
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'photos'
                  ? 'text-amber-400 scale-110'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            />
            {photosCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono px-1 rounded-full bg-zinc-800 text-zinc-300">
                {photosCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
              activeTab === 'photos' ? 'text-amber-400 font-semibold' : 'text-zinc-500'
            }`}
          >
            Photos
          </span>
          {activeTab === 'photos' && (
            <div className="absolute top-0 w-12 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        {/* Tab 2: Albums */}
        <button
          onClick={() => onTabChange('albums')}
          className="min-h-[48px] flex flex-col items-center justify-center relative py-1 focus:outline-none transition-colors"
        >
          <div className="relative">
            <Folder
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'albums'
                  ? 'text-amber-400 scale-110'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            />
            {albumsCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono px-1 rounded-full bg-zinc-800 text-zinc-300">
                {albumsCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
              activeTab === 'albums' ? 'text-amber-400 font-semibold' : 'text-zinc-500'
            }`}
          >
            Albums
          </span>
          {activeTab === 'albums' && (
            <div className="absolute top-0 w-12 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        {/* Tab 3: Studio / Editor */}
        <button
          onClick={() => onTabChange('editor')}
          className="min-h-[48px] flex flex-col items-center justify-center relative py-1 focus:outline-none transition-colors"
        >
          <SlidersHorizontal
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'editor'
                ? 'text-amber-400 scale-110'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
              activeTab === 'editor' ? 'text-amber-400 font-semibold' : 'text-zinc-500'
            }`}
          >
            Studio
          </span>
          {activeTab === 'editor' && (
            <div className="absolute top-0 w-12 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
};

