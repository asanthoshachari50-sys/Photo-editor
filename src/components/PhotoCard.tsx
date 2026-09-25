import React, { useState } from 'react';
import { Heart, Check, Image as ImageIcon, MoreVertical, FolderInput, Trash2, Eye, SlidersHorizontal } from 'lucide-react';
import { Photo } from '../types/gallery';
import { formatBytes, formatDate } from '../utils/storage';

interface PhotoCardProps {
  photo: Photo;
  isSelected: boolean;
  onToggleSelect: (photoId: string) => void;
  onOpenLightbox: (photo: Photo) => void;
  onToggleFavorite: (photoId: string) => void;
  onDeletePhoto?: (photoId: string) => void;
  onMoveToAlbum?: (photoId: string) => void;
  onEditPhoto?: (photo: Photo) => void;
  albumName?: string;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  onToggleFavorite,
  onDeletePhoto,
  onMoveToAlbum,
  onEditPhoto,
  albumName,
}) => {
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`group relative flex flex-col bg-zinc-900/60 rounded-xl overflow-hidden border transition-all duration-200 ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
          : 'border-zinc-800/80 hover:border-zinc-700/80'
      }`}
    >
      {/* Media container */}
      <div
        className="relative aspect-4/3 w-full bg-zinc-950 overflow-hidden cursor-pointer"
        onClick={() => onOpenLightbox(photo)}
      >
        {!imageError ? (
          <img
            src={photo.url}
            alt={photo.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-900 text-zinc-500">
            <ImageIcon className="w-8 h-8 mb-2 stroke-1 text-zinc-600" />
            <span className="text-xs text-zinc-400 font-medium text-center line-clamp-1">
              {photo.title}
            </span>
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Top Floating Controls */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Select Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(photo.id);
            }}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all pointer-events-auto ${
              isSelected
                ? 'bg-amber-400 text-zinc-950 shadow-md scale-100'
                : 'bg-black/50 text-white border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-black/70'
            }`}
            title={isSelected ? 'Deselect photo' : 'Select photo'}
          >
            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* Quick Favorite Heart */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(photo.id);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all pointer-events-auto ${
              photo.isFavorite
                ? 'bg-rose-500/90 text-white shadow-sm scale-100'
                : 'bg-black/50 text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-black/80'
            }`}
            title={photo.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom hover details */}
        <div className="absolute bottom-2.5 left-3 right-3 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {photo.exif?.camera && (
            <p className="text-[11px] text-zinc-300 font-mono tracking-tight line-clamp-1">
              {photo.exif.camera} {photo.exif.focalLength && `· ${photo.exif.focalLength}`} {photo.exif.aperture && `· ${photo.exif.aperture}`}
            </p>
          )}
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3 flex flex-col justify-between gap-1.5 border-t border-zinc-800/40 bg-zinc-900/40">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              onClick={() => onOpenLightbox(photo)}
              className="text-xs font-semibold text-zinc-200 hover:text-white truncate cursor-pointer transition-colors"
              title={photo.title}
            >
              {photo.title}
            </h3>

            {/* Zero-pill metadata text with bullet separators */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
              <span>{photo.dimensions.width}×{photo.dimensions.height}</span>
              <span aria-hidden="true">·</span>
              <span>{formatBytes(photo.fileSize)}</span>
              {albumName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-400 truncate max-w-[90px]">{albumName}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Context Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
              title="More options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 bottom-full mb-1 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1 z-30 flex flex-col text-xs text-zinc-300">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenLightbox(photo);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-800 rounded-md text-left transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>View Large</span>
                  </button>
                  {onEditPhoto && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEditPhoto(photo);
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-800 rounded-md text-left transition-colors text-amber-400"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Edit in Studio</span>
                    </button>
                  )}
                  {onMoveToAlbum && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onMoveToAlbum(photo.id);
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-800 rounded-md text-left transition-colors"
                    >
                      <FolderInput className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Move Album</span>
                    </button>
                  )}
                  {onDeletePhoto && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDeletePhoto(photo.id);
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-rose-500/10 text-rose-400 rounded-md text-left transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {photo.tags.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 overflow-hidden whitespace-nowrap text-ellipsis pt-0.5">
            {photo.tags.slice(0, 3).map((tag, idx) => (
              <React.Fragment key={tag}>
                {idx > 0 && <span className="text-zinc-600">·</span>}
                <span className="hover:text-zinc-200 transition-colors">#{tag}</span>
              </React.Fragment>
            ))}
            {photo.tags.length > 3 && (
              <span className="text-zinc-600">+{photo.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
