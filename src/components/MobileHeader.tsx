import React from 'react';
import { Camera, ArrowLeft, Plus } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenUpload: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  onOpenUpload,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 max-w-md mx-auto">
      {/* Clean Mobile App Bar (52px) */}
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left Slot: Back button or Logo */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-zinc-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-display text-base font-bold text-white tracking-tight">
                Lumina
              </span>
            </div>
          )}
        </div>

        {/* Center Slot: Page Title when not root */}
        {showBack && (
          <div className="text-center min-w-0 max-w-[180px]">
            <h2 className="text-xs font-bold text-white truncate">{title}</h2>
            {subtitle && <p className="text-[10px] text-zinc-500 truncate">{subtitle}</p>}
          </div>
        )}

        {/* Right Slot: Upload Action Button */}
        <div className="flex items-center">
          <button
            onClick={onOpenUpload}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-amber-400 hover:text-amber-300 transition-colors"
            title="Upload or capture photo"
          >
            <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};


