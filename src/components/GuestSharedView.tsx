import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Download, ArrowLeft, Shield, Eye, AlertCircle, Info, Image as ImageIcon } from 'lucide-react';
import { Album, Photo } from '../types/gallery';
import { Lightbox } from './Lightbox';
import { formatDate } from '../utils/storage';

interface GuestSharedViewProps {
  album: Album;
  photos: Photo[];
  onExit: () => void;
}

export const GuestSharedView: React.FC<GuestSharedViewProps> = ({
  album,
  photos,
  onExit,
}) => {
  const needsPasscode = album.isPrivate && album.shareSettings.requirePasscode;
  const [isUnlocked, setIsUnlocked] = useState(!needsPasscode);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const albumPhotos = photos.filter((p) => p.albumId === album.id);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (album.passcode && pinInput.trim() === album.passcode.trim()) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPinInput('');
    }
  };

  const handleDownloadAll = () => {
    albumPhotos.forEach((photo, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `${album.title.toLowerCase().replace(/\s+/g, '_')}_${photo.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 250);
    });
  };

  // If locked, show guest PIN gate
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center select-none">
        {/* Back navigation */}
        <div className="fixed top-6 left-6">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lumina Vault</span>
          </button>
        </div>

        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest">
              Private Shared Album
            </span>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight mt-1">
              {album.title}
            </h1>
            <p className="text-xs text-zinc-400 mt-2">
              This collection has been shared privately. Please enter the passcode to access.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              maxLength={8}
              autoFocus
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setError(false);
              }}
              placeholder="Enter PIN"
              className={`w-full bg-zinc-950 border rounded-2xl py-3.5 px-4 text-center font-mono text-xl tracking-[0.4em] text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all ${
                error
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20'
              }`}
            />

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Incorrect passcode. Please check with the owner.</span>
              </div>
            )}

            {album.passcode && (
              <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 bg-zinc-950 py-1.5 px-3 rounded-lg border border-zinc-800">
                <Info className="w-3 h-3 text-amber-400" />
                <span>Demo Passcode:</span>
                <span className="font-mono text-amber-400 font-semibold">{album.passcode}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!pinInput}
              className="w-full py-3 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              Unlock Private Gallery
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Once unlocked: Curated recipient view
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      {/* Top Banner */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Shared Preview</span>
        </button>

        <div className="flex items-center gap-2">
          {album.shareSettings.allowDownload && albumPhotos.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All ({albumPhotos.length})</span>
            </button>
          )}
        </div>
      </header>

      {/* Album Editorial Header */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/80 pb-8">
          <div className="space-y-3 max-w-2xl">
            {/* Zero-pill metadata */}
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <span>{album.isPrivate ? 'Private Shared Album' : 'Curated Gallery'}</span>
              <span aria-hidden="true">·</span>
              <span>{albumPhotos.length} {albumPhotos.length === 1 ? 'Work' : 'Works'}</span>
              <span aria-hidden="true">·</span>
              <span>Updated {formatDate(album.updatedAt)}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {album.title}
            </h1>

            {album.description && (
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                {album.description}
              </p>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        {albumPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {albumPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => {
                  setActivePhoto(photo);
                  setIsLightboxOpen(true);
                }}
                className="group relative flex flex-col bg-zinc-900/60 rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="aspect-4/3 w-full bg-zinc-950 overflow-hidden relative">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs text-zinc-200 font-medium flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Full Resolution</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between gap-1 bg-zinc-900/40">
                  <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                    {photo.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{photo.dimensions.width}×{photo.dimensions.height}</span>
                    {photo.exif?.camera && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{photo.exif.camera}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-950/50 rounded-2xl border border-zinc-900 mt-8">
            <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3 stroke-1" />
            <h3 className="text-base font-semibold text-zinc-300">No photos in this album yet</h3>
            <p className="text-xs text-zinc-500 mt-1">
              The author has not added photos to this collection yet.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox for shared view */}
      <Lightbox
        photos={albumPhotos}
        currentPhoto={activePhoto}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSelectPhoto={(p) => setActivePhoto(p)}
        onToggleFavorite={() => {}}
        allowDownload={album.shareSettings.allowDownload}
      />
    </div>
  );
};
