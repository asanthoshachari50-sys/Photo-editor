import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Key, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { Album } from '../types/gallery';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album | null;
  onSuccess: (albumId: string) => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  album,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setErrorMessage('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen || !album) return null;

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!album.passcode) {
      onSuccess(album.id);
      onClose();
      return;
    }

    if (pin.trim() === album.passcode.trim()) {
      setError(false);
      onSuccess(album.id);
      onClose();
    } else {
      setError(true);
      setErrorMessage('Incorrect passcode. Please check and try again.');
      setPin('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pin.length < 8) {
      const nextPin = pin + val;
      setPin(nextPin);
      setError(false);
      if (album.passcode && nextPin === album.passcode) {
        onSuccess(album.id);
        onClose();
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pt-8 flex flex-col items-center">
          {/* Lock Emblem */}
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="font-display text-lg font-bold text-white tracking-tight">
            Unlock Private Album
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-[240px] truncate">
            {album.title}
          </p>

          {/* Form */}
          <form onSubmit={handleVerify} className="w-full mt-6 space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Enter PIN"
                className={`w-full bg-zinc-950 border rounded-xl py-3 px-4 text-center font-mono text-xl tracking-[0.4em] text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all ${
                  error
                    ? 'border-rose-500 ring-2 ring-rose-500/20 animate-shake'
                    : 'border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20'
                }`}
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Demo Hint */}
            {album.passcode && (
              <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 bg-zinc-950/60 py-1.5 px-3 rounded-lg border border-zinc-800/60">
                <Info className="w-3 h-3 text-amber-400/80" />
                <span>Demo Passcode:</span>
                <span className="font-mono text-amber-400 font-semibold">{album.passcode}</span>
              </div>
            )}

            {/* Numeric Keypad for convenience */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') setPin('');
                    else if (k === '⌫') handleBackspace();
                    else handleKeypadPress(k);
                  }}
                  className="py-2.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 text-sm font-semibold text-zinc-200 active:scale-95 transition-all"
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!pin}
                className="w-1/2 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Unlock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
