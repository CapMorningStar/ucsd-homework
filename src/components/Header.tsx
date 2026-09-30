import React from 'react';
import { QrCode, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  lastSynced: string;
  isSyncing: boolean;
  onRefresh: () => void;
  onOpenQR: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  lastSynced,
  isSyncing,
  onRefresh,
  onOpenQR
}) => {
  return (
    <header className="pt-4 px-4 pb-3 flex flex-col gap-3 sticky top-0 z-30 bg-[#121113]/90 backdrop-blur-md border-b border-zinc-800/60">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 p-[2px] shadow-lg shadow-amber-500/10">
              <div className="w-full h-full rounded-full bg-[#1C1B1D] flex items-center justify-center text-amber-400 font-bold text-base">
                KL
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#121113]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-white">Good evening, Kyaw</h1>
              <span className="text-xs text-zinc-400 font-normal">({user.pid})</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Vault Synced
              </span>
              <span>•</span>
              <span>{user.week}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Phone QR Connect & Refresh */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenQR}
            className="tap-bounce flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20"
            title="Connect Phone via QR Code"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>
          
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="tap-bounce p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800"
            title="Refresh Vault Data"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
