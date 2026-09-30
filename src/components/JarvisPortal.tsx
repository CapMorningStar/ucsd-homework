import React from 'react';
import { ShieldCheck, RefreshCw, Terminal, CheckCircle2, Smartphone, FolderSync, ArrowUpRight, Share2, PlusSquare } from 'lucide-react';

interface JarvisPortalProps {
  lastSynced: string;
  vaultPath: string;
  isSyncing: boolean;
  onRefresh: () => void;
  onOpenQR: () => void;
}

export const JarvisPortal: React.FC<JarvisPortalProps> = ({
  lastSynced,
  vaultPath,
  isSyncing,
  onRefresh,
  onOpenQR
}) => {
  const pillars = [
    { title: 'Academic Deliverables', status: '100% Synced', desc: 'DSC 10, COGS 9, COGS 14A, SOCI 141, WCWP 100' },
    { title: 'In-Person Class Meetings', status: 'Active Schedule', desc: 'HSS 1330, FAH 1301, Podemos 1A18, Catalyst, WLH' },
    { title: 'Admin & Financial Aid', status: 'Compliant', desc: 'TritonPay $0.00 Balance, VAC DSC petitions, MyChart' },
    { title: 'Extra Credit & Surveys', status: '+1.0% Locked In', desc: 'DSC 10 Qualtrics, COGS 14A Resonance, AI Tutor' },
    { title: 'Announcements & Shells', status: 'Audited', desc: 'Canvas course shells & Gradescope #1403047 verified' }
  ];

  return (
    <div className="px-4 py-2 flex flex-col gap-4">
      {/* Sync Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#1C1B1D] to-[#121113] border border-amber-500/30 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Jarvis Protocol Active</h3>
              <p className="text-xs text-amber-400/80">Bidirectional Obsidian Sync</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="tap-bounce flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Vault</span>
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-zinc-800 text-xs text-zinc-400 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>Last Synced Date:</span>
            <span className="font-semibold text-zinc-200">{lastSynced}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Obsidian Vault:</span>
            <span className="font-mono text-[11px] text-amber-400/90 truncate max-w-[200px]">{vaultPath}</span>
          </div>
        </div>
      </div>

      {/* 5 Pillars Status */}
      <div className="p-4 rounded-2xl bg-[#1C1B1D] border border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
          5 Pillars of Automated Course Checking
        </h4>
        <div className="flex flex-col gap-2.5">
          {pillars.map((p, idx) => (
            <div key={idx} className="flex items-start justify-between text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-zinc-200">{p.title}</span>
                  <p className="text-[11px] text-zinc-400">{p.desc}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile App Installation Guide */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Add to Mobile Home Screen (PWA)
            </h4>
          </div>
          <button
            onClick={onOpenQR}
            className="text-xs text-amber-400 font-semibold hover:underline"
          >
            Show QR Code
          </button>
        </div>

        <div className="flex flex-col gap-2 text-xs text-zinc-300">
          <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 flex items-start gap-2.5">
            <Share2 className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-white">iPhone Safari:</strong> Open the link in Safari, tap the <strong>Share</strong> button at bottom, and select <strong>"Add to Home Screen"</strong>. It launches full-screen like a native iOS app!
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 flex items-start gap-2.5">
            <PlusSquare className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-white">Android Chrome:</strong> Open the link in Chrome, tap the <strong>three dots menu (⋮)</strong>, and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
