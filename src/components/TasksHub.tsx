import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle2, Circle, Clock, Check, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { Task } from '../types';

interface TasksHubProps {
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  defaultFilter?: string;
}

export const TasksHub: React.FC<TasksHubProps> = ({ tasks, onToggleTask, defaultFilter = 'all' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    archive: true // default collapse completed archive
  });

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All', count: tasks.length },
    { id: 'urgent', label: '🔥 Urgent 48h', count: tasks.filter(t => t.isUrgent48h && !t.isCompleted).length },
    { id: 'gradescope', label: 'Gradescope', count: tasks.filter(t => t.platform.includes('Gradescope')).length },
    { id: 'datahub', label: 'DataHub', count: tasks.filter(t => t.platform.includes('DataHub')).length },
    { id: 'canvas', label: 'Canvas', count: tasks.filter(t => t.platform.includes('Canvas')).length },
    { id: 'internship', label: 'Internships', count: tasks.filter(t => t.course.includes('Arcell') || t.course.includes('Triton') || t.course.includes('PACE')).length },
    { id: 'completed', label: 'Completed', count: tasks.filter(t => t.isCompleted).length }
  ];

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search query
      const matchesSearch =
        searchTerm === '' ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.platform.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filter tag
      if (selectedFilter === 'urgent') return task.isUrgent48h && !task.isCompleted;
      if (selectedFilter === 'gradescope') return task.platform.includes('Gradescope');
      if (selectedFilter === 'datahub') return task.platform.includes('DataHub');
      if (selectedFilter === 'canvas') return task.platform.includes('Canvas');
      if (selectedFilter === 'internship') return task.course.includes('Arcell') || task.course.includes('Triton') || task.course.includes('PACE');
      if (selectedFilter === 'completed') return task.isCompleted;

      return true;
    });
  }, [tasks, searchTerm, selectedFilter]);

  // Group filtered tasks into sections
  const urgentTasks = filteredTasks.filter(t => t.isUrgent48h && !t.isCompleted);
  const week1Tasks = filteredTasks.filter(t => t.group === 'week1' && !t.isUrgent48h && !t.isCompleted);
  const week2Tasks = filteredTasks.filter(t => t.group === 'week2' && !t.isCompleted);
  const completedTasks = filteredTasks.filter(t => t.isCompleted);

  const getCourseBadgeColor = (course: string) => {
    if (course.includes('DSC 10')) return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    if (course.includes('COGS 9')) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    if (course.includes('COGS 14A')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (course.includes('SOCI 141')) return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    if (course.includes('WCWP 100')) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (course.includes('Arcell')) return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    if (course.includes('Triton') || course.includes('PACE')) return 'bg-pink-500/15 text-pink-400 border-pink-500/30';
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  const renderTaskItem = (task: Task) => (
    <div
      key={task.id}
      className={`p-3.5 rounded-2xl border transition-all duration-200 ${
        task.isCompleted
          ? 'bg-zinc-900/30 border-zinc-800/40 opacity-50'
          : 'bg-[#1C1B1D] border-zinc-800/80 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle Checkbox */}
        <button
          onClick={() => onToggleTask(task)}
          className="mt-0.5 flex-shrink-0 text-amber-400 hover:text-amber-300 tap-bounce"
        >
          {task.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 fill-amber-500/20 text-amber-400" />
          ) : (
            <Circle className="w-5 h-5 text-zinc-500 hover:text-amber-400" />
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${getCourseBadgeColor(task.course)}`}>
              {task.course}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium text-[10px]">
              {task.platform}
            </span>
            {task.isUrgent48h && !task.isCompleted && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 ml-auto px-1.5 py-0.5 rounded bg-orange-500/10">
                <Clock className="w-3 h-3" />
                Due in &lt;48h
              </span>
            )}
          </div>

          <h4 className={`text-sm font-semibold leading-snug ${task.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
            {task.title}
          </h4>

          {task.details && (
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              {task.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-2 flex flex-col gap-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks, labs, courses..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1C1B1D] border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 transition-all"
        />
      </div>

      {/* Filter Tabs / Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSelectedFilter(opt.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedFilter === opt.id
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-[#1C1B1D] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{opt.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedFilter === opt.id ? 'bg-black/30 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              {opt.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grouped Task List */}
      <div className="flex flex-col gap-4 mt-2">
        {/* Urgent 48h Section */}
        {urgentTasks.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Due in Next 48 Hours ({urgentTasks.length})</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {urgentTasks.map(renderTaskItem)}
            </div>
          </section>
        )}

        {/* Week 1 Active Section */}
        {week1Tasks.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider">
              <span>Week 1 Active Action Items ({week1Tasks.length})</span>
            </div>
            <div className="flex flex-col gap-2">
              {week1Tasks.map(renderTaskItem)}
            </div>
          </section>
        )}

        {/* Week 2 Lookahead Section */}
        {week2Tasks.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <span>Week 2 Lookahead ({week2Tasks.length})</span>
            </div>
            <div className="flex flex-col gap-2">
              {week2Tasks.map(renderTaskItem)}
            </div>
          </section>
        )}

        {/* Completed Archive Section */}
        {completedTasks.length > 0 && (
          <section className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
            <button
              onClick={() => toggleSection('archive')}
              className="flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-zinc-200"
            >
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completed & Verified Archive ({completedTasks.length})</span>
              </div>
              {collapsedSections['archive'] ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {!collapsedSections['archive'] && (
              <div className="flex flex-col gap-2 mt-1">
                {completedTasks.map(renderTaskItem)}
              </div>
            )}
          </section>
        )}

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-zinc-500">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No tasks found matching your filter</p>
          </div>
        )}
      </div>
    </div>
  );
};
