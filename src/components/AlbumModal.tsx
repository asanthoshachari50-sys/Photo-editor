import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, Key, Shield, Download, RefreshCw, Check } from 'lucide-react';
import { Album } from '../types/gallery';

interface AlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumToEdit?: Album | null;
  onSaveAlbum: (albumData: Partial<Album>) => void;
}

export const AlbumModal: React.FC<AlbumModalProps> = ({
  isOpen,
  onClose,
  albumToEdit,
  onSaveAlbum,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [requirePasscode, setRequirePasscode] = useState(true);

  useEffect(() => {
    if (albumToEdit) {
      setTitle(albumToEdit.title);
      setDescription(albumToEdit.description);
      setIsPrivate(albumToEdit.isPrivate);
      setPasscode(albumToEdit.passcode || '');
      setAllowDownload(albumToEdit.shareSettings.allowDownload);
      setRequirePasscode(albumToEdit.shareSettings.requirePasscode);
    } else {
      // Defaults for new album
      setTitle('');
      setDescription('');
      setIsPrivate(true);
      setPasscode(generateRandomPin());
      setAllowDownload(true);
      setRequirePasscode(true);
    }
  }, [albumToEdit, isOpen]);

  if (!isOpen) return null;

  function generateRandomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  const handleGeneratePin = () => {
    setPasscode(generateRandomPin());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveAlbum({
      title: title.trim(),
      description: description.trim(),
      isPrivate,
      passcode: isPrivate ? (passcode.trim() || '1234') : undefined,
      shareSettings: {
        allowDownload,
        requirePasscode: isPrivate ? requirePasscode : false,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-tight">
              {albumToEdit ? 'Edit Album Settings' : 'Create New Album'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Organize and protect your photo collection.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Album Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nordic Brutalism, Summer Solstice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Curator Note / Description
            </label>
            <textarea
              rows={2}
              placeholder="A brief aesthetic note or description for this series..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all resize-none"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPrivate ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">
                    {isPrivate ? 'Private Locked Vault' : 'Public Album'}
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    {isPrivate ? 'Requires passcode to view and protect photos' : 'Visible to anyone in the gallery'}
                  </p>
                </div>
              </div>

              {/* Segmented Switch */}
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPrivate ? 'bg-amber-400' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPrivate ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Passcode input when Private */}
            {isPrivate && (
              <div className="pt-2 border-t border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Vault PIN / Passcode</span>
                  <button
                    type="button"
                    onClick={handleGeneratePin}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate PIN</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="e.g. 1984"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-14 py-2 font-mono text-sm tracking-widest text-zinc-100 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 hover:text-zinc-200"
                    >
                      {showPasscode ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Share Permissions */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Share Link Defaults
            </span>

            <label className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl cursor-pointer hover:bg-zinc-950 transition-colors">
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-xs font-medium text-zinc-200">Allow Photo Downloads</p>
                  <p className="text-[11px] text-zinc-500">Recipients can save original files</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 accent-amber-400 bg-zinc-900 border-zinc-700"
              />
            </label>

            {isPrivate && (
              <label className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl cursor-pointer hover:bg-zinc-950 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">Require PIN for Shared Link</p>
                    <p className="text-[11px] text-zinc-500">Shared link asks recipient for this album's PIN</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={requirePasscode}
                  onChange={(e) => setRequirePasscode(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-400 accent-amber-400 bg-zinc-900 border-zinc-700"
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{albumToEdit ? 'Save Changes' : 'Create Album'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
