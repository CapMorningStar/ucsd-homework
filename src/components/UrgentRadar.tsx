import React from 'react';
import { Flame, Clock, CheckCircle2, Circle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Task } from '../types';

interface UrgentRadarProps {
  urgentTasks: Task[];
  onToggleTask: (task: Task) => void;
  onViewAllTasks: () => void;
}

export const UrgentRadar: React.FC<UrgentRadarProps> = ({
  urgentTasks,
  onToggleTask,
  onViewAllTasks
}) => {
  if (urgentTasks.length === 0) {
    return (
      <div className="mx-4 my-2 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">48-Hour Radar Clear</h3>
            <p className="text-xs text-zinc-400">No urgent deadlines in the next 2 days.</p>
          </div>
        </div>
        <button
          onClick={onViewAllTasks}
          className="text-xs text-amber-400 font-semibold flex items-center gap-1 hover:underline"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 my-3">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">48-Hour Urgent Radar</h2>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold">
            {urgentTasks.length} Due in 2 Days
          </span>
        </div>
        <button
          onClick={onViewAllTasks}
          className="text-xs text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-0.5"
        >
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Urgent Task Cards */}
      <div className="flex flex-col gap-2.5">
        {urgentTasks.map((task) => (
          <div
            key={task.id}
            className={`p-3.5 rounded-2xl border transition-all duration-200 ${
              task.isCompleted
                ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                : 'bg-gradient-to-r from-[#1C1B1D] to-[#222126] border-amber-500/30 shadow-lg shadow-amber-950/20'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button
                onClick={() => onToggleTask(task)}
                className="mt-0.5 flex-shrink-0 text-amber-400 hover:text-amber-300 tap-bounce"
              >
                {task.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 fill-amber-500/20 text-amber-400" />
                ) : (
                  <Circle className="w-5 h-5 text-amber-400/80 hover:text-amber-400" />
                )}
              </button>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold text-[11px]">
                    {task.course}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium text-[10px]">
                    {task.platform}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-400 ml-auto">
                    <Clock className="w-3 h-3" />
                    Due in &lt;48h
                  </span>
                </div>

                <h3 className={`text-sm font-semibold leading-snug ${task.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                  {task.title}
                </h3>

                {task.details && (
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {task.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
