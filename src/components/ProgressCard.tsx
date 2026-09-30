import React from 'react';
import { Flame, CheckCircle, Target, Award } from 'lucide-react';
import { DashboardStats } from '../types';

interface ProgressCardProps {
  stats: DashboardStats;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ stats }) => {
  const { total, completed, percentage } = stats;

  return (
    <div className="mx-4 my-3 p-4 rounded-2xl bg-gradient-to-br from-[#1C1B1D] via-[#201F25] to-[#18171B] border border-zinc-800/80 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500/90">
            Weekly Commitment
          </span>
          <h3 className="text-base font-bold text-white">Study & Deliverables Progress</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>12 Day Streak</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Progress Ring / Percent Circle */}
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-zinc-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-amber-500"
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-extrabold text-white leading-none">{percentage}%</span>
            <span className="text-[9px] text-zinc-400 font-medium">Done</span>
          </div>
        </div>

        {/* Deliverables Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-400 block mb-0.5">Completed</span>
            <span className="text-base font-bold text-emerald-400">
              {completed} <span className="text-xs text-zinc-500 font-normal">/ {total}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-400 block mb-0.5">Time Logged</span>
            <span className="text-base font-bold text-amber-400">
              18.5 <span className="text-xs text-zinc-500 font-normal">/ 25h</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
