import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon, Trash2, Check, Folder } from 'lucide-react';
import { Album, Photo } from '../types/gallery';
import { formatBytes } from '../utils/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  albums: Album[];
  defaultAlbumId?: string | null;
  onUploadPhotos: (photos: Photo[]) => void;
}

interface QueuedFile {
  id: string;
  file: File;
  dataUrl: string;
  title: string;
  width: number;
  height: number;
  size: number;
  tags: string[];
  tagInput: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  albums,
  defaultAlbumId,
  onUploadPhotos,
}) => {
  const [targetAlbumId, setTargetAlbumId] = useState<string>(defaultAlbumId || '');
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newQueued: QueuedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const dataUrl = await readFileAsDataUrl(file);
      const dimensions = await getImageDimensions(dataUrl);

      // Clean default title from file name
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();

      newQueued.push({
        id: `upload-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        dataUrl,
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
        tags: [],
        tagInput: '',
      });
    }

    setQueuedFiles((prev) => [...prev, ...newQueued]);
    setIsProcessing(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveQueueItem = (id: string) => {
    setQueuedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddTag = (id: string) => {
    setQueuedFiles((prev) =>
      prev.map((item) => {
        if (item.id === id && item.tagInput.trim()) {
          const newTag = item.tagInput.trim().replace(/^#/, '');
          if (!item.tags.includes(newTag)) {
            return {
              ...item,
              tags: [...item.tags, newTag],
              tagInput: '',
            };
          }
        }
        return item;
      })
    );
  };

  const handleRemoveTag = (itemId: string, tagToRemove: string) => {
    setQueuedFiles((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            tags: item.tags.filter((t) => t !== tagToRemove),
          };
        }
        return item;
      })
    );
  };

  const handleSaveAll = () => {
    if (queuedFiles.length === 0) return;

    const cameras = [
      { camera: 'Leica SL3', lens: 'Vario-Elmarit-SL 24-70mm f/2.8', focalLength: '35mm', aperture: 'f/2.8', iso: 100, shutterSpeed: '1/250s' },
      { camera: 'Sony A7 IV', lens: 'FE 24-70mm f/2.8 GM II', focalLength: '50mm', aperture: 'f/4.0', iso: 200, shutterSpeed: '1/500s' },
      { camera: 'Fujifilm X-T5', lens: 'XF 33mm f/1.4 R LM WR', focalLength: '33mm', aperture: 'f/2.0', iso: 160, shutterSpeed: '1/1000s' },
      { camera: 'Canon EOS R5', lens: 'RF 50mm f/1.2 L USM', focalLength: '50mm', aperture: 'f/1.8', iso: 400, shutterSpeed: '1/800s' },
    ];

    const finalPhotos: Photo[] = queuedFiles.map((item, idx) => {
      const camChoice = cameras[idx % cameras.length];
      return {
        id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        title: item.title || 'Untitled Photo',
        url: item.dataUrl,
        albumId: targetAlbumId || null,
        createdAt: new Date().toISOString(),
        fileSize: item.size,
        dimensions: {
          width: item.width,
          height: item.height,
        },
        tags: item.tags.length > 0 ? item.tags : ['Upload'],
        isFavorite: false,
        exif: {
          ...camChoice,
          capturedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        },
      };
    });

    onUploadPhotos(finalPhotos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-tight">Upload Photos</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add original high-resolution photos to your private vault.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Target Album Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Target Album
            </label>
            <div className="relative">
              <select
                value={targetAlbumId}
                onChange={(e) => setTargetAlbumId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">No Album (Keep in General Vault)</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title} {album.isPrivate ? '(Private)' : '(Public)'}
                  </option>
                ))}
              </select>
              <Folder className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-amber-400 bg-amber-400/5 scale-[1.01]'
                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center text-amber-400 mb-3 border border-zinc-700/60">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-200">
              Drag & drop photos here, or <span className="text-amber-400 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Supports JPEG, PNG, WebP, GIF, SVG. Direct browser storage.
            </p>
          </div>

          {/* Queue List */}
          {queuedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{queuedFiles.length} {queuedFiles.length === 1 ? 'photo' : 'photos'} ready to upload</span>
                <button
                  type="button"
                  onClick={() => setQueuedFiles([])}
                  className="text-rose-400 hover:underline text-[11px]"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {queuedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl"
                  >
                    <img
                      src={item.dataUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-900 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          setQueuedFiles((prev) =>
                            prev.map((q) => (q.id === item.id ? { ...q, title: e.target.value } : q))
                          )
                        }
                        className="w-full bg-transparent text-xs font-semibold text-zinc-200 border-b border-transparent hover:border-zinc-700 focus:border-amber-400 focus:outline-none transition-colors"
                        placeholder="Photo title"
                      />
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                        <span>{item.width}×{item.height}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatBytes(item.size)}</span>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            onClick={() => handleRemoveTag(item.id, t)}
                            className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded cursor-pointer hover:text-rose-400"
                            title="Click to remove"
                          >
                            #{t} ×
                          </span>
                        ))}
                        <input
                          type="text"
                          value={item.tagInput}
                          placeholder="+ add tag (Enter)"
                          onChange={(e) =>
                            setQueuedFiles((prev) =>
                              prev.map((q) => (q.id === item.id ? { ...q, tagInput: e.target.value } : q))
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag(item.id);
                            }
                          }}
                          className="bg-transparent text-[10px] text-zinc-300 placeholder-zinc-600 focus:outline-none w-24"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveQueueItem(item.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-900 transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={queuedFiles.length === 0 || isProcessing}
            onClick={handleSaveAll}
            className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl transition-all ${
              queuedFiles.length > 0 && !isProcessing
                ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-md'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Upload {queuedFiles.length > 0 ? `(${queuedFiles.length})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
