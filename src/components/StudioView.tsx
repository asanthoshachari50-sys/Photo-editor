import React, { useRef } from 'react';
import { Sparkles, SlidersHorizontal, Camera, Upload, ArrowRight } from 'lucide-react';
import { Photo } from '../types/gallery';

interface StudioViewProps {
  photos: Photo[];
  onSelectPhotoToEdit: (photo: Photo) => void;
  onUploadAndEdit: (file: File) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  photos,
  onSelectPhotoToEdit,
  onUploadAndEdit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAndEdit(file);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Studio Header Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-3xl border border-zinc-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
            Mobile Studio
          </span>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-white tracking-tight">
            Photo Studio & Editor
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Apply cinema-grade noir, vintage, and warm filters, fine-tune brightness & contrast, crop to Instagram 1:1 or 4:5 ratios, and save back to your private albums.
          </p>
        </div>

        {/* Quick upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-[0.99]"
        >
          <Camera className="w-4 h-4" />
          <span>Upload New Photo to Edit</span>
        </button>
      </div>

      {/* Select Existing Photo Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
          Select From Your Photos ({photos.length})
        </h3>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onSelectPhotoToEdit(photo)}
                className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-amber-400/60 cursor-pointer transition-all shadow-sm"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                  <span className="text-xs font-semibold text-white truncate">
                    {photo.title}
                  </span>
                  <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                    <SlidersHorizontal className="w-2.5 h-2.5" />
                    <span>Tap to edit</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6">
            <SlidersHorizontal className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-zinc-200">No photos in gallery yet</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              Tap the button above to upload an image from your device and start editing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
