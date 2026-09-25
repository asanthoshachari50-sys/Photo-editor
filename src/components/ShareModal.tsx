import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Shield, Download, Lock, QrCode as QrIcon } from 'lucide-react';
import { Album } from '../types/gallery';
import { QRCode } from './QRCode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album | null;
  onUpdateShareSettings: (albumId: string, settings: Album['shareSettings']) => void;
  onPreviewGuestView: (album: Album) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  album,
  onUpdateShareSettings,
  onPreviewGuestView,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !album) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const shareUrl = `${origin}${pathname}?sharedAlbum=${album.id}&key=${album.shareKey}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyPin = async () => {
    if (!album.passcode) return;
    try {
      await navigator.clipboard.writeText(album.passcode);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleToggleDownload = (allow: boolean) => {
    onUpdateShareSettings(album.id, {
      ...album.shareSettings,
      allowDownload: allow,
    });
  };

  const handleToggleRequirePasscode = (require: boolean) => {
    onUpdateShareSettings(album.id, {
      ...album.shareSettings,
      requirePasscode: require,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-tight">
              Share Album
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Generate a private, secure link to share &ldquo;{album.title}&rdquo;.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Share Link Box */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Secret Share Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-zinc-300 truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold rounded-xl shadow-md transition-all shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Passcode Protection Details */}
          {album.isPrivate && (
            <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Vault Access PIN</p>
                  <p className="text-[11px] text-zinc-500">Recipients will need this to unlock photos</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-sm tracking-widest text-amber-400 font-bold bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  {album.passcode || 'None'}
                </span>
                <button
                  onClick={handleCopyPin}
                  title="Copy PIN"
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Share Settings Controls */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Recipient Permissions
            </span>

            <label className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl cursor-pointer hover:bg-zinc-950 transition-colors">
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-xs font-medium text-zinc-200">Allow Photo Downloads</p>
                  <p className="text-[11px] text-zinc-500">Guests can download full-res originals</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={album.shareSettings.allowDownload}
                onChange={(e) => handleToggleDownload(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 accent-amber-400 bg-zinc-900 border-zinc-700"
              />
            </label>

            {album.isPrivate && (
              <label className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl cursor-pointer hover:bg-zinc-950 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">Require PIN to Open Link</p>
                    <p className="text-[11px] text-zinc-500">Recipients must enter PIN before seeing photos</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={album.shareSettings.requirePasscode}
                  onChange={(e) => handleToggleRequirePasscode(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-400 accent-amber-400 bg-zinc-900 border-zinc-700"
                />
              </label>
            )}
          </div>

          {/* QR Code Collapsible */}
          <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950/40">
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="w-full flex items-center justify-between p-3 text-xs font-medium text-zinc-300 hover:bg-zinc-950 transition-colors"
            >
              <div className="flex items-center gap-2">
                <QrIcon className="w-4 h-4 text-amber-400" />
                <span>Show QR Code for Mobile Scanning</span>
              </div>
              <span className="text-[11px] text-zinc-500">{showQr ? 'Hide' : 'Show'}</span>
            </button>

            {showQr && (
              <div className="p-4 pt-1 flex flex-col items-center justify-center border-t border-zinc-800/60 bg-zinc-950">
                <QRCode value={shareUrl} size={160} />
                <p className="text-[11px] text-zinc-500 mt-2 text-center">
                  Scan with iPhone or Android camera to open private album.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/40">
          <button
            onClick={() => {
              onClose();
              onPreviewGuestView(album);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test Guest View</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
