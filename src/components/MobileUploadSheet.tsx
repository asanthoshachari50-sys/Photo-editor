import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Folder, Sparkles, Check } from 'lucide-react';
import { Album, Photo } from '../types/gallery';

interface MobileUploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  albums: Album[];
  defaultAlbumId?: string | null;
  onUploadPhotos: (photos: Photo[], openInEditor?: boolean) => void;
}

export const MobileUploadSheet: React.FC<MobileUploadSheetProps> = ({
  isOpen,
  onClose,
  albums,
  defaultAlbumId,
  onUploadPhotos,
}) => {
  const [targetAlbumId, setTargetAlbumId] = useState<string>(defaultAlbumId || '');
  const [openInEditor, setOpenInEditor] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newPhotos: Photo[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const dataUrl = await readFileAsDataUrl(file);
      const dimensions = await getImageDimensions(dataUrl);

      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();

      newPhotos.push({
        id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        title: cleanTitle ? (cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)) : `Photo ${new Date().toLocaleTimeString()}`,
        url: dataUrl,
        albumId: targetAlbumId || null,
        createdAt: new Date().toISOString(),
        fileSize: file.size,
        dimensions,
        tags: ['Mobile'],
        isFavorite: false,
        exif: {
          camera: 'Smartphone Camera',
          capturedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        },
      });
    }

    setIsProcessing(false);
    onUploadPhotos(newPhotos, openInEditor);
    onClose();
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || 1920,
          height: img.naturalHeight || 1080,
        });
      };
      img.onerror = () => resolve({ width: 1920, height: 1080 });
      img.src = src;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md mx-auto bg-zinc-900 border-t border-zinc-800 rounded-t-3xl shadow-2xl p-5 pb-8 space-y-4 animate-in slide-in-from-bottom duration-200 z-10">
        {/* Grab Handle */}
        <div className="w-10 h-1.5 bg-zinc-700 rounded-full mx-auto" />

        {/* Title */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h3 className="font-display text-base font-bold text-white tracking-tight">
              Add to Gallery
            </h3>
            <p className="text-xs text-zinc-400">
              Upload from your phone or capture with camera.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Album selector */}
        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 space-y-1">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Save to Album
          </label>
          <div className="relative">
            <select
              value={targetAlbumId}
              onChange={(e) => setTargetAlbumId(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-200 font-medium py-1 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-zinc-300">
                General Photos (No Album)
              </option>
              {albums.map((album) => (
                <option key={album.id} value={album.id} className="bg-zinc-900 text-zinc-200">
                  {album.title} {album.isPrivate ? '🔒' : ''}
                </option>
              ))}
            </select>
            <Folder className="w-3.5 h-3.5 text-zinc-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <input
            ref={libraryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* 1. Take Photo button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full min-h-[52px] flex items-center gap-3.5 p-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-zinc-950 font-bold text-sm shadow-lg transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-950/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-zinc-950" />
            </div>
            <div className="text-left">
              <span>Take Photo</span>
              <p className="text-[11px] font-normal text-zinc-900/80">
                Use camera to take a new picture
              </p>
            </div>
          </button>

          {/* 2. Photo Library button */}
          <button
            onClick={() => libraryInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full min-h-[52px] flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-semibold text-sm active:scale-[0.99] transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span>Choose from Library</span>
              <p className="text-[11px] font-normal text-zinc-400">
                Upload one or multiple photos
              </p>
            </div>
          </button>
        </div>

        {/* Quick toggle: Open in editor immediately */}
        <label className="flex items-center gap-2.5 p-2 text-xs text-zinc-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={openInEditor}
            onChange={(e) => setOpenInEditor(e.target.checked)}
            className="w-4 h-4 rounded text-amber-400 accent-amber-400 bg-zinc-950 border-zinc-700"
          />
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Open in Photo Studio editor after upload</span>
          </span>
        </label>
      </div>
    </div>
  );
};
