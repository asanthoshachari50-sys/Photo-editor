import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Sliders,
  Crop,
  Sparkles,
  Undo2,
  Save,
} from 'lucide-react';
import { Photo } from '../types/gallery';

interface PhotoEditorProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  onSaveEditedPhoto: (editedDataUrl: string, saveAsCopy: boolean) => void;
}

type EditorTab = 'filters' | 'adjust' | 'crop';

interface FilterPreset {
  id: string;
  name: string;
  css: string;
  settings: {
    brightness: number;
    contrast: number;
    saturation: number;
    sepia: number;
    blur: number;
  };
}

const FILTER_PRESETS: FilterPreset[] = [
  { id: 'original', name: 'Original', css: 'none', settings: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, blur: 0 } },
  { id: 'noir', name: 'Noir B&W', css: 'grayscale(100%) contrast(125%)', settings: { brightness: 95, contrast: 125, saturation: 0, sepia: 0, blur: 0 } },
  { id: 'vivid', name: 'Vivid', css: 'saturate(140%) contrast(110%)', settings: { brightness: 102, contrast: 112, saturation: 140, sepia: 0, blur: 0 } },
  { id: 'vintage', name: 'Vintage', css: 'sepia(45%) contrast(95%) brightness(105%)', settings: { brightness: 105, contrast: 95, saturation: 85, sepia: 45, blur: 0 } },
  { id: 'warm', name: 'Golden Hour', css: 'sepia(25%) saturate(120%) brightness(105%)', settings: { brightness: 105, contrast: 102, saturation: 125, sepia: 25, blur: 0 } },
  { id: 'cool', name: 'Nordic Cool', css: 'hue-rotate(185deg) saturate(90%)', settings: { brightness: 100, contrast: 105, saturation: 90, sepia: 0, blur: 0 } },
  { id: 'dramatic', name: 'Dramatic', css: 'contrast(135%) brightness(90%) saturate(110%)', settings: { brightness: 90, contrast: 135, saturation: 110, sepia: 0, blur: 0 } },
  { id: 'soft', name: 'Soft Matte', css: 'contrast(88%) brightness(110%)', settings: { brightness: 110, contrast: 88, saturation: 95, sepia: 10, blur: 0 } },
];

const ASPECT_RATIOS = [
  { id: 'original', label: 'Original', ratio: null },
  { id: '1:1', label: '1:1 Square', ratio: 1 },
  { id: '4:5', label: '4:5 Portrait', ratio: 4 / 5 },
  { id: '16:9', label: '16:9 Wide', ratio: 16 / 9 },
  { id: '9:16', label: '9:16 Story', ratio: 9 / 16 },
];

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  photo,
  isOpen,
  onClose,
  onSaveEditedPhoto,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('filters');
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>('original');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      handleReset();
    }
  }, [isOpen, photo]);

  const handleReset = () => {
    setSelectedFilter('original');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setBlur(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectRatio('original');
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    setSelectedFilter(preset.id);
    setBrightness(preset.settings.brightness);
    setContrast(preset.settings.contrast);
    setSaturation(preset.settings.saturation);
    setSepia(preset.settings.sepia);
    setBlur(preset.settings.blur);
  };

  const computeFilterStyle = () => {
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%)`;
    if (blur > 0) filterString += ` blur(${blur}px)`;
    if (selectedFilter === 'noir') filterString = `grayscale(100%) ${filterString}`;
    if (selectedFilter === 'cool') filterString = `hue-rotate(185deg) ${filterString}`;
    return filterString;
  };

  const computeTransformStyle = () => {
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    return `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;
  };

  // Render to canvas to create true edited image data URL
  const generateEditedImageDataUrl = (): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(photo.url);
          return;
        }

        let srcW = img.naturalWidth;
        let srcH = img.naturalHeight;

        // Calculate aspect ratio crop bounds if specified
        let cropX = 0;
        let cropY = 0;
        let cropW = srcW;
        let cropH = srcH;

        const targetRatioObj = ASPECT_RATIOS.find((r) => r.id === aspectRatio);
        if (targetRatioObj && targetRatioObj.ratio) {
          const targetRatio = targetRatioObj.ratio;
          const currentRatio = srcW / srcH;
          if (currentRatio > targetRatio) {
            // Cut sides
            cropW = srcH * targetRatio;
            cropX = (srcW - cropW) / 2;
          } else {
            // Cut top/bottom
            cropH = srcW / targetRatio;
            cropY = (srcH - cropH) / 2;
          }
        }

        // Account for 90 or 270 deg rotation
        const isSwapped = rotation % 180 !== 0;
        canvas.width = isSwapped ? cropH : cropW;
        canvas.height = isSwapped ? cropW : cropH;

        // Apply filters in canvas context
        ctx.filter = computeFilterStyle();

        // Translate and rotate around center
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        // Draw cropped source slice
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropW,
          cropH,
          -cropW / 2,
          -cropH / 2,
          cropW,
          cropH
        );

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(photo.url);
      img.src = photo.url;
    });
  };

  const handleSave = async (saveAsCopy: boolean) => {
    setIsExporting(true);
    const dataUrl = await generateEditedImageDataUrl();
    setIsExporting(false);
    onSaveEditedPhoto(dataUrl, saveAsCopy);
    onClose();
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const dataUrl = await generateEditedImageDataUrl();
    setIsExporting(false);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `lumina_edit_${photo.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-zinc-100 select-none animate-in fade-in duration-200">
      {/* Top Mobile Bar */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md shrink-0">
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="font-display text-sm font-bold text-white tracking-tight">
            Photo Studio
          </span>
          <p className="text-[10px] text-zinc-400 truncate max-w-[160px] mx-auto">
            {photo.title}
          </p>
        </div>

        <button
          onClick={handleReset}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-xs text-zinc-400 hover:text-amber-400 transition-colors"
          title="Reset all edits"
        >
          <Undo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Preview Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-black/60">
        <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden rounded-xl shadow-2xl transition-all duration-200">
          <img
            src={photo.url}
            alt={photo.title}
            className="max-h-[48vh] sm:max-h-[55vh] max-w-[90vw] object-contain transition-all duration-150"
            style={{
              filter: computeFilterStyle(),
              transform: computeTransformStyle(),
            }}
          />
        </div>
      </div>

      {/* Editing Controls Bottom Section */}
      <div className="bg-zinc-900 border-t border-zinc-800 flex flex-col shrink-0">
        {/* Sub-panels depending on activeTab */}
        <div className="p-4 min-h-[140px] max-h-[190px] overflow-y-auto">
          {/* TAB 1: FILTERS */}
          {activeTab === 'filters' && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {FILTER_PRESETS.map((preset) => {
                const isSelected = selectedFilter === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none group"
                  >
                    <div
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/20 scale-105'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        style={{
                          filter: preset.css !== 'none' ? preset.css : undefined,
                        }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium transition-colors ${
                        isSelected ? 'text-amber-400 font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    >
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: ADJUSTMENTS */}
          {activeTab === 'adjust' && (
            <div className="space-y-3.5 max-w-md mx-auto">
              {/* Brightness */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-zinc-400 w-20">Brightness</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="flex-1 accent-amber-400 bg-zinc-950 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-zinc-300 font-mono w-10 text-right">{brightness}%</span>
              </div>

              {/* Contrast */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-zinc-400 w-20">Contrast</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="flex-1 accent-amber-400 bg-zinc-950 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-zinc-300 font-mono w-10 text-right">{contrast}%</span>
              </div>

              {/* Saturation */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-zinc-400 w-20">Saturation</span>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="flex-1 accent-amber-400 bg-zinc-950 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-zinc-300 font-mono w-10 text-right">{saturation}%</span>
              </div>

              {/* Warmth / Sepia */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-zinc-400 w-20">Warmth</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sepia}
                  onChange={(e) => setSepia(Number(e.target.value))}
                  className="flex-1 accent-amber-400 bg-zinc-950 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-zinc-300 font-mono w-10 text-right">{sepia}%</span>
              </div>
            </div>
          )}

          {/* TAB 3: CROP & TRANSFORM */}
          {activeTab === 'crop' && (
            <div className="space-y-4 max-w-md mx-auto">
              {/* Aspect Ratio Buttons */}
              <div>
                <span className="block text-[10px] uppercase font-semibold text-zinc-500 mb-1.5">
                  Aspect Ratio
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {ASPECT_RATIOS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAspectRatio(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        aspectRatio === item.id
                          ? 'bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation Buttons */}
              <div>
                <span className="block text-[10px] uppercase font-semibold text-zinc-500 mb-1.5">
                  Transform & Rotate
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs transition-colors ${
                      flipH ? 'bg-amber-400/20 border-amber-400/50 text-amber-300' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Flip H</span>
                  </button>

                  <button
                    onClick={() => setFlipV(!flipV)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs transition-colors ${
                      flipV ? 'bg-amber-400/20 border-amber-400/50 text-amber-300' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                    <span>Flip V</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selector Bar */}
        <div className="grid grid-cols-3 border-t border-zinc-800/80 bg-zinc-950">
          <button
            onClick={() => setActiveTab('filters')}
            className={`min-h-[48px] flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
              activeTab === 'filters' ? 'text-amber-400 border-t-2 border-amber-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setActiveTab('adjust')}
            className={`min-h-[48px] flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
              activeTab === 'adjust' ? 'text-amber-400 border-t-2 border-amber-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Adjust</span>
          </button>

          <button
            onClick={() => setActiveTab('crop')}
            className={`min-h-[48px] flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
              activeTab === 'crop' ? 'text-amber-400 border-t-2 border-amber-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Crop className="w-4 h-4" />
            <span>Crop & Rotate</span>
          </button>
        </div>

        {/* Sticky Mobile Action Buttons */}
        <div className="p-3.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between gap-2.5">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="min-h-[44px] px-3.5 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            title="Download edited version"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(true)}
              disabled={isExporting}
              className="min-h-[44px] px-4 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-100 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Copy</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isExporting}
              className="min-h-[44px] px-5 flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-zinc-950 shadow-md transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
