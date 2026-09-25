import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Info,
  Download,
  Heart,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Trash2,
  Camera,
  Calendar,
  Layers,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';
import { Photo } from '../types/gallery';
import { formatBytes, formatDate } from '../utils/storage';

interface LightboxProps {
  photos: Photo[];
  currentPhoto: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photo: Photo) => void;
  onToggleFavorite: (photoId: string) => void;
  onDeletePhoto?: (photoId: string) => void;
  onEditPhoto?: (photo: Photo) => void;
  allowDownload?: boolean;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photos,
  currentPhoto,
  isOpen,
  onClose,
  onSelectPhoto,
  onToggleFavorite,
  onDeletePhoto,
  onEditPhoto,
  allowDownload = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);

  const currentIndex = currentPhoto
    ? photos.findIndex((p) => p.id === currentPhoto.id)
    : -1;

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onSelectPhoto(photos[currentIndex + 1]);
    } else {
      onSelectPhoto(photos[0]); // Loop
    }
    setZoomLevel(1);
    setRotation(0);
  }, [currentIndex, photos, onSelectPhoto]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelectPhoto(photos[currentIndex - 1]);
    } else {
      onSelectPhoto(photos[photos.length - 1]);
    }
    setZoomLevel(1);
    setRotation(0);
  }, [currentIndex, photos, onSelectPhoto]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'f') {
        if (currentPhoto) onToggleFavorite(currentPhoto.id);
      } else if (e.key === 'i') {
        setShowInfo((prev) => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlayingSlideshow((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, currentPhoto, onToggleFavorite]);

  // Slideshow timer
  useEffect(() => {
    if (!isPlayingSlideshow || !isOpen) {
      setSlideshowProgress(0);
      return;
    }

    const intervalTime = 4000;
    const stepTime = 100;
    const progressStep = (stepTime / intervalTime) * 100;

    const interval = setInterval(() => {
      setSlideshowProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + progressStep;
      });
    }, stepTime);

    return () => clearInterval(interval);
  }, [isPlayingSlideshow, isOpen, handleNext]);

  // Reset transforms when photo changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
  }, [currentPhoto?.id]);

  if (!isOpen || !currentPhoto) return null;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.35, 3.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.35, 0.7));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentPhoto.url;
    link.download = `${currentPhoto.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Slideshow Progress Bar */}
      {isPlayingSlideshow && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 z-50">
          <div
            className="h-full bg-amber-400 transition-all duration-100 ease-linear"
            style={{ width: `${slideshowProgress}%` }}
          />
        </div>
      )}

      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 px-6 flex items-center justify-between z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="font-display text-sm font-semibold text-zinc-100 truncate max-w-sm">
            {currentPhoto.title}
          </h2>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Slideshow Play/Pause */}
          <button
            onClick={() => setIsPlayingSlideshow(!isPlayingSlideshow)}
            className={`p-2 rounded-lg transition-colors ${
              isPlayingSlideshow
                ? 'bg-amber-400/20 text-amber-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
            title={isPlayingSlideshow ? 'Pause Slideshow (Space)' : 'Start Slideshow (Space)'}
          >
            {isPlayingSlideshow ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Zoom controls */}
          <button
            onClick={handleZoomIn}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(currentPhoto.id)}
            className={`p-2 rounded-lg transition-colors ${
              currentPhoto.isFavorite
                ? 'text-rose-500 hover:text-rose-400'
                : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/80'
            }`}
            title={currentPhoto.isFavorite ? 'Remove Favorite (F)' : 'Add Favorite (F)'}
          >
            <Heart className={`w-4 h-4 ${currentPhoto.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Edit in Studio */}
          {onEditPhoto && (
            <button
              onClick={() => onEditPhoto(currentPhoto)}
              className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80 rounded-lg transition-colors"
              title="Edit photo in Studio"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {/* Download */}
          {allowDownload && (
            <button
              onClick={handleDownload}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
              title="Download photo"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-colors ${
              showInfo
                ? 'bg-zinc-800 text-amber-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
            title="Photo Info & EXIF (I)"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Delete */}
          {onDeletePhoto && (
            <button
              onClick={() => {
                if (confirm('Delete this photo from vault?')) {
                  onDeletePhoto(currentPhoto.id);
                  if (photos.length <= 1) {
                    onClose();
                  } else {
                    handleNext();
                  }
                }
              }}
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/80 rounded-lg transition-colors"
              title="Delete photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="w-[1px] h-5 bg-zinc-800 mx-1" />

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Photo Canvas Area */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-hidden">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-zinc-400 hover:text-white bg-black/40 hover:bg-zinc-900/90 rounded-full border border-zinc-800/80 backdrop-blur-md transition-all z-30 shadow-lg"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* The Photo */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            referrerPolicy="no-referrer"
            className="max-h-[84vh] max-w-[90vw] object-contain rounded-md shadow-2xl pointer-events-auto"
          />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-zinc-400 hover:text-white bg-black/40 hover:bg-zinc-900/90 rounded-full border border-zinc-800/80 backdrop-blur-md transition-all z-30 shadow-lg"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* EXIF / Info Drawer (Side Panel) */}
      {showInfo && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-zinc-950/95 border-l border-zinc-800 p-6 z-40 overflow-y-auto backdrop-blur-xl animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <h3 className="font-display text-sm font-bold text-white tracking-wide">
              Photo Specifications
            </h3>
            <button
              onClick={() => setShowInfo(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-4 text-xs">
            {/* Title & Caption */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Title
              </p>
              <p className="text-zinc-200 font-medium text-sm">{currentPhoto.title}</p>
              {currentPhoto.caption && (
                <p className="text-zinc-400 mt-1 leading-relaxed">{currentPhoto.caption}</p>
              )}
            </div>

            {/* Camera & Lens */}
            {currentPhoto.exif?.camera && (
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">{currentPhoto.exif.camera}</span>
                </div>
                {currentPhoto.exif.lens && (
                  <p className="text-zinc-400 text-[11px] pl-6">{currentPhoto.exif.lens}</p>
                )}

                {/* Exposure details */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 font-mono text-[11px] text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Aperture</span>
                    <span>{currentPhoto.exif.aperture || '—'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Shutter</span>
                    <span>{currentPhoto.exif.shutterSpeed || '—'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">ISO</span>
                    <span>{currentPhoto.exif.iso || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* File Metrics */}
            <div className="space-y-2 text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Resolution</span>
                <span className="text-zinc-200 font-mono">
                  {currentPhoto.dimensions.width} × {currentPhoto.dimensions.height}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>File Size</span>
                <span className="text-zinc-200 font-mono">{formatBytes(currentPhoto.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Date Added</span>
                <span className="text-zinc-200">{formatDate(currentPhoto.createdAt)}</span>
              </div>
              {currentPhoto.exif?.location && (
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>Location</span>
                  </span>
                  <span className="text-zinc-200 text-right truncate max-w-[140px]">
                    {currentPhoto.exif.location}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {currentPhoto.tags.length > 0 && (
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentPhoto.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
