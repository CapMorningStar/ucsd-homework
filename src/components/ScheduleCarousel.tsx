import React, { useState } from 'react';
import { Calendar, MapPin, Clock, ExternalLink, ChevronRight, Navigation } from 'lucide-react';
import { DaySchedule } from '../types';

interface ScheduleCarouselProps {
  schedule: DaySchedule[];
}

export const ScheduleCarousel: React.FC<ScheduleCarouselProps> = ({ schedule }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!schedule || schedule.length === 0) return null;

  const currentDay = schedule[selectedDayIndex] || schedule[0];

  return (
    <div className="mx-4 my-3">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400">
            <Calendar className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Class Schedule</h2>
          <span className="text-xs text-zinc-400 font-medium">({currentDay.classes.length} classes)</span>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1 bg-[#1A191C] p-1 rounded-xl border border-zinc-800">
          {schedule.map((dayItem, idx) => (
            <button
              key={dayItem.day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDayIndex === idx
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {dayItem.day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Carousel */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
        {currentDay.classes.map((cls) => (
          <div
            key={cls.id}
            className="flex-shrink-0 w-[260px] snap-center p-3.5 rounded-2xl bg-[#1C1B1D] border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between"
            style={{ borderLeft: `3px solid ${cls.color}` }}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  {cls.code}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium text-[10px]">
                  {cls.type}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1 mb-2">
                {cls.topic}
              </h4>

              <div className="flex flex-col gap-1.5 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-zinc-200 font-medium">{cls.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-zinc-300 font-semibold">{cls.room}</span>
                  <span className="text-[11px] text-zinc-500">• {cls.instructor}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between">
              <a
                href={cls.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
              >
                <Navigation className="w-3 h-3" />
                Campus Map & Route
              </a>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
