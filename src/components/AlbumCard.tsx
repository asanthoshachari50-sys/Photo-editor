import React, { useState } from 'react';
import { Lock, Unlock, Share2, MoreVertical, Edit2, Trash2, Folder, Image as ImageIcon } from 'lucide-react';
import { Album, Photo } from '../types/gallery';
import { formatDate } from '../utils/storage';

interface AlbumCardProps {
  album: Album;
  coverPhoto?: Photo | null;
  photoCount: number;
  isUnlocked: boolean;
  onOpenAlbum: (album: Album) => void;
  onShareAlbum: (album: Album) => void;
  onEditAlbum: (album: Album) => void;
  onDeleteAlbum: (album: Album) => void;
  onLockAlbum?: (albumId: string) => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  coverPhoto,
  photoCount,
  isUnlocked,
  onOpenAlbum,
  onShareAlbum,
  onEditAlbum,
  onDeleteAlbum,
  onLockAlbum,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isPrivateAndLocked = album.isPrivate && !isUnlocked;

  return (
    <div className="group relative flex flex-col bg-zinc-900/70 rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 shadow-sm hover:shadow-xl">
      {/* Cover Image Area */}
      <div
        className="relative aspect-16/10 w-full bg-zinc-950 overflow-hidden cursor-pointer"
        onClick={() => onOpenAlbum(album)}
      >
        {coverPhoto && !imageError ? (
          <img
            src={coverPhoto.url}
            alt={album.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isPrivateAndLocked ? 'blur-md brightness-75 scale-105' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-zinc-900/80 text-zinc-500">
            <Folder className="w-10 h-10 mb-2 stroke-1 text-zinc-600" />
            <span className="text-xs text-zinc-400">Empty Album</span>
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Top Badges / Indicators */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {album.isPrivate ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-md transition-colors ${
                isUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span>Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Private</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900/70 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
              <span>Public</span>
            </div>
          )}

          {/* Quick Share Icon Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShareAlbum(album);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/50 text-zinc-300 hover:text-white hover:bg-black/80 backdrop-blur-md transition-all"
            title="Share album"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Locked Center Overlay when Private & Locked */}
        {isPrivateAndLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900/90 border border-amber-500/40 flex items-center justify-center shadow-lg mb-2">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-xs font-semibold text-zinc-100 tracking-wide">Passcode Protected</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Click to unlock and view photos</p>
          </div>
        )}

        {/* Bottom Title on Image */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-left">
          <h3 className="font-display text-base font-bold text-white tracking-tight leading-snug line-clamp-1">
            {album.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-300/90 mt-0.5">
            <span>{photoCount} {photoCount === 1 ? 'photo' : 'photos'}</span>
            <span aria-hidden="true">·</span>
            <span>Updated {formatDate(album.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Album Card Details & Actions */}
      <div className="p-3.5 flex items-center justify-between gap-3 bg-zinc-900/50">
        <p className="text-xs text-zinc-400 line-clamp-1 flex-1">
          {album.description || 'No description provided.'}
        </p>

        {/* Dropdown Menu */}
        <div className="relative shrink-0 flex items-center gap-1">
          {album.isPrivate && isUnlocked && onLockAlbum && (
            <button
              onClick={() => onLockAlbum(album.id)}
              title="Lock album"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Album options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 bottom-full mb-1 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1 z-30 flex flex-col text-xs text-zinc-300">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onShareAlbum(album);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-800 rounded-md text-left transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Share Album</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEditAlbum(album);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-800 rounded-md text-left transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Edit Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteAlbum(album);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-rose-500/10 text-rose-400 rounded-md text-left transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
