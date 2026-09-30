import React from 'react';
import { ExternalLink, BookOpen, Layers, Award, Sparkles } from 'lucide-react';
import { CourseCard } from '../types';

interface CoursesHubProps {
  courses: CourseCard[];
}

export const CoursesHub: React.FC<CoursesHubProps> = ({ courses }) => {
  return (
    <div className="px-4 py-2 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-base font-bold text-white">Courses & Platforms</h2>
          <p className="text-xs text-zinc-400">1-Tap Portals to Canvas, Gradescope, DataHub & Course Sites</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
          {courses.length} Hubs
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {courses.map((course) => (
          <div
            key={course.code}
            className="p-4 rounded-2xl bg-[#1C1B1D] border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col gap-3 shadow-md"
            style={{ borderLeft: `3px solid ${course.color}` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white tracking-tight">
                    {course.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-semibold text-[10px]">
                    {course.units}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-zinc-300 mt-0.5">
                  {course.title}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-400 font-medium text-[11px]">
                {course.status}
              </span>
            </div>

            {/* Instructors */}
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="text-zinc-500">Instructor:</span>
              <span className="text-zinc-300 font-medium">{course.professors}</span>
            </p>

            {/* Quick Link Buttons Grid */}
            <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap gap-2">
              {course.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="tap-bounce inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-zinc-800/80 transition-all"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
