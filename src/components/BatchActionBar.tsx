import React, { useState } from 'react';
import { X, FolderInput, Tag, Download, Trash2, Check } from 'lucide-react';
import { Album } from '../types/gallery';

interface BatchActionBarProps {
  selectedCount: number;
  albums: Album[];
  onDeselectAll: () => void;
  onBatchMove: (targetAlbumId: string | null) => void;
  onBatchDelete: () => void;
  onBatchDownload: () => void;
  onBatchAddTag: (tag: string) => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  albums,
  onDeselectAll,
  onBatchMove,
  onBatchDelete,
  onBatchDownload,
  onBatchAddTag,
}) => {
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagText, setTagText] = useState('');

  if (selectedCount === 0) return null;

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagText.trim()) {
      onBatchAddTag(tagText.trim().replace(/^#/, ''));
      setTagText('');
      setShowTagInput(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto bg-zinc-900/95 border border-zinc-700/80 rounded-2xl shadow-2xl p-2 px-4 flex items-center justify-between gap-3 sm:gap-6 backdrop-blur-xl animate-in slide-in-from-bottom duration-200">
      {/* Selection count */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="w-5 h-5 rounded-md bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-zinc-200 hidden sm:inline">
          {selectedCount === 1 ? 'photo selected' : 'photos selected'}
        </span>
        <button
          onClick={onDeselectAll}
          className="text-zinc-400 hover:text-zinc-200 text-xs p-1"
          title="Deselect all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-zinc-800 hidden sm:block" />

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Move to Album */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMoveDropdown(!showMoveDropdown);
              setShowTagInput(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
          >
            <FolderInput className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Move</span>
          </button>

          {showMoveDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMoveDropdown(false)} />
              <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1 z-30 space-y-0.5 text-xs">
                <div className="px-2 py-1 text-[11px] font-semibold text-zinc-500 uppercase">
                  Move to Album
                </div>
                <button
                  onClick={() => {
                    onBatchMove(null);
                    setShowMoveDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300"
                >
                  General Vault (No Album)
                </button>
                {albums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => {
                      onBatchMove(album.id);
                      setShowMoveDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-800 rounded-lg text-zinc-200 truncate"
                  >
                    {album.title} {album.isPrivate ? '🔒' : ''}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Add Tag */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTagInput(!showTagInput);
              setShowMoveDropdown(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Tag</span>
          </button>

          {showTagInput && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowTagInput(false)} />
              <form
                onSubmit={handleTagSubmit}
                className="absolute left-0 bottom-full mb-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-30 flex items-center gap-1"
              >
                <input
                  type="text"
                  placeholder="New tag..."
                  value={tagText}
                  autoFocus
                  onChange={(e) => setTagText(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200 w-full focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-amber-400 text-zinc-950 font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>

        {/* Download Selected */}
        <button
          onClick={onBatchDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
          title="Download selected"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Delete */}
        <button
          onClick={onBatchDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 transition-colors"
          title="Delete selected"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
};
