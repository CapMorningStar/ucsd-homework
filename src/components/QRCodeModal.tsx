import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Copy, Check, Cloud, Wifi } from 'lucide-react';
import { NetworkInfo } from '../types';
import { getGitHubToken } from '../utils/github';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkInfo: NetworkInfo | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  networkInfo
}) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'cloud' | 'local'>('cloud');
  const [qrUri, setQrUri] = useState<string>('');

  const token = getGitHubToken() || networkInfo?.ghToken || '';
  const cloudUrl = networkInfo?.cloudUrl || `https://capmorningstar.github.io/ucsd-homework/#token=${token}`;
  const localUrl = networkInfo?.mobileUrl || `http://localhost:5173`;
  const currentUrl = mode === 'cloud' ? cloudUrl : localUrl;

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(currentUrl, {
      margin: 2,
      width: 280,
      color: {
        dark: '#F59E0B',
        light: '#0A0A0C'
      }
    })
      .then((uri) => setQrUri(uri))
      .catch((err) => console.warn('QR code generation error:', err));
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#141417] border border-amber-500/30 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-3">
          <Smartphone className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-white">Open on Your Phone</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-[260px]">
          Point your iPhone or Android camera at the QR code to connect.
        </p>

        {/* Mode Selector: 24/7 Cloud vs Local Wi-Fi */}
        <div className="mt-3 flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-full">
          <button
            onClick={() => setMode('cloud')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'cloud'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>24/7 Cloud (5G)</span>
          </button>

          <button
            onClick={() => setMode('local')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'local'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Local Wi-Fi</span>
          </button>
        </div>

        {/* Mode explanation */}
        <p className="text-[11px] text-zinc-400 mt-2 px-1">
          {mode === 'cloud'
            ? '⚡ Works 24/7 anywhere on campus even when your laptop is shut down!'
            : '🏠 Works when your laptop is turned on and on the same Wi-Fi.'}
        </p>

        {/* QR Code */}
        {qrUri && (
          <div className="my-3 p-3 rounded-2xl bg-[#0A0A0C] border-2 border-amber-500/40 shadow-inner">
            <img
              src={qrUri}
              alt="Mobile QR Code"
              className="w-44 h-44 rounded-xl"
            />
          </div>
        )}

        {/* Copyable Link */}
        <div className="w-full flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <span className="flex-1 font-mono text-amber-400 truncate text-left text-[11px]">
            {currentUrl}
          </span>
          <button
            onClick={handleCopy}
            className="tap-bounce p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="mt-3 text-[11px] text-zinc-400">
          💡 In Safari, tap <strong>"Share" → "Add to Home Screen"</strong> to run it full-screen!
        </div>
      </div>
    </div>
  );
};
