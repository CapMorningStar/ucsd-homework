import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Smartphone,
  RefreshCw,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Check,
  Cloud,
  AlertCircle
} from 'lucide-react';
import { QRCodeModal } from './components/QRCodeModal';
import {
  getGitHubToken,
  saveGitHubToken,
  fetchFileFromGitHub,
  toggleTaskOnGitHub
} from './utils/github';

interface HomeworkItem {
  id: string;
  lineIndex: number;
  rawTitle: string;
  title: string;
  details: string;
  course: string;
  platform: string;
  dueFormatted: string;
  isCompleted: boolean;
  isUrgent48h: boolean;
  section: string;
}

interface GitInfo {
  repo: string;
  branch: string;
  lastCommit: string;
  isClean: boolean;
}

interface HomeworkData {
  success: boolean;
  user: {
    name: string;
    courses: string[];
    term: string;
  };
  activeTasks: HomeworkItem[];
  completedTasks: HomeworkItem[];
  stats: {
    active: number;
    completed: number;
    urgent: number;
  };
  gitInfo: GitInfo;
  lastSynced: string;
  vaultPath?: string;
  isCloudMode: boolean;
}

export const App: React.FC = () => {
  const [data, setData] = useState<HomeworkData | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch homework data: either via GitHub Cloud or Local Bridge
  const fetchHomework = async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const token = getGitHubToken();

      // Mode 1: 24/7 Direct GitHub Cloud API (Works when laptop is shut down!)
      if (token) {
        try {
          const ghResult = await fetchFileFromGitHub(token);
          setData({
            success: true,
            user: {
              name: 'Kyaw Soe Lwin',
              courses: ['DSC 10', 'COGS 9', 'COGS 14A', 'SOCI 141', 'WCWP 100'],
              term: 'Fall 2026'
            },
            ...ghResult.parsed,
            gitInfo: {
              repo: 'CapMorningStar/ucsd-fall-2026',
              branch: 'main',
              lastCommit: 'Live GitHub Cloud',
              isClean: true
            },
            isCloudMode: true
          });
          setErrorMessage(null);
          return;
        } catch (err: any) {
          console.warn('GitHub Cloud fetch error, attempting local fallback:', err.message);
        }
      }

      // Mode 2: Local Mac Sync Bridge
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData({
          ...json,
          isCloudMode: false
        });
        setErrorMessage(null);
      } else {
        throw new Error(`Failed to load data (HTTP ${res.status})`);
      }
    } catch (err: any) {
      console.warn('Sync error:', err);
      if (!data) {
        setErrorMessage(
          'Connecting to homework stream... If your laptop is off, make sure your phone is authenticated with GitHub Cloud.'
        );
      }
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  // Fetch network IP for phone scanning
  const fetchNetworkInfo = async () => {
    try {
      const res = await fetch('/api/network-info');
      if (res.ok) {
        const json: NetworkInfo = await res.json();
        setNetworkInfo(json);
      }
    } catch (err) {
      console.warn('Network info error:', err);
    }
  };

  useEffect(() => {
    fetchHomework();
    fetchNetworkInfo();

    // Auto-poll every 3s so when laptop Obsidian updates, phone updates automatically!
    const interval = setInterval(() => {
      fetchHomework(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Complete a homework task
  const handleToggle = async (item: HomeworkItem) => {
    if (!data) return;

    // Trigger smooth fade-out
    setCompletingId(item.id);

    setTimeout(async () => {
      // Optimistic removal: remove immediately from activeTasks
      const updatedActive = data.activeTasks.filter((t) => t.id !== item.id);
      const updatedCompleted = [{ ...item, isCompleted: true }, ...data.completedTasks];

      setData({
        ...data,
        activeTasks: updatedActive,
        completedTasks: updatedCompleted,
        stats: {
          active: updatedActive.length,
          completed: updatedCompleted.length,
          urgent: updatedActive.filter((t) => t.isUrgent48h).length
        }
      });
      setCompletingId(null);

      const token = getGitHubToken();

      try {
        if (data.isCloudMode && token) {
          // Direct 24/7 update to GitHub
          await toggleTaskOnGitHub(token, item.title, true);
        } else {
          // Local bridge update
          await fetch('/api/tasks/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: item.title,
              completed: true
            })
          });
        }
      } catch (err) {
        console.error('Error toggling task:', err);
        fetchHomework();
      }
    }, 280);
  };

  // Reopen a completed task
  const handleReopen = async (item: HomeworkItem) => {
    if (!data) return;

    const updatedCompleted = data.completedTasks.filter((t) => t.id !== item.id);
    const updatedActive = [{ ...item, isCompleted: false }, ...data.activeTasks];

    setData({
      ...data,
      activeTasks: updatedActive,
      completedTasks: updatedCompleted,
      stats: {
        active: updatedActive.length,
        completed: updatedCompleted.length,
        urgent: updatedActive.filter((t) => t.isUrgent48h).length
      }
    });

    const token = getGitHubToken();

    try {
      if (data.isCloudMode && token) {
        await toggleTaskOnGitHub(token, item.title, false);
      } else {
        await fetch('/api/tasks/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title,
            completed: false
          })
        });
      }
    } catch (err) {
      console.error('Error reopening task:', err);
      fetchHomework();
    }
  };

  const courses = ['All', 'DSC 10', 'COGS 9', 'COGS 14A', 'SOCI 141', 'WCWP 100'];

  const getCourseStyle = (course: string) => {
    if (course.includes('DSC 10')) {
      return {
        badge: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
        border: '#38BDF8'
      };
    }
    if (course.includes('COGS 9')) {
      return {
        badge: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
        border: '#A855F7'
      };
    }
    if (course.includes('COGS 14A')) {
      return {
        badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
        border: '#34D399'
      };
    }
    if (course.includes('SOCI 141')) {
      return {
        badge: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
        border: '#FB923C'
      };
    }
    if (course.includes('WCWP 100')) {
      return {
        badge: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
        border: '#F59E0B'
      };
    }
    return {
      badge: 'text-zinc-400 bg-zinc-800/80 border-zinc-700',
      border: '#71717A'
    };
  };

  const filteredTasks = (data?.activeTasks || []).filter((task) => {
    if (selectedCourse !== 'All' && !task.course.includes(selectedCourse)) {
      return false;
    }
    if (urgentOnly && !task.isUrgent48h) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-zinc-100 flex flex-col max-w-md mx-auto pb-12 antialiased selection:bg-amber-500/30">
      {/* Sleek Minimalist Header */}
      <header className="pt-6 px-5 pb-4 sticky top-0 z-30 bg-[#0A0A0C]/90 backdrop-blur-xl border-b border-zinc-900/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Fall 2026 • Week 1
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{data?.isCloudMode ? '24/7 Cloud Sync' : 'Live Vault Sync'}</span>
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Homework & Labs
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="tap-bounce flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141417] border border-zinc-800 text-amber-400 text-xs font-semibold hover:border-amber-500/40 transition-all shadow-sm"
              title="Open on Phone"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone</span>
            </button>

            <button
              onClick={() => fetchHomework(false)}
              disabled={isSyncing}
              className="tap-bounce p-2 rounded-xl bg-[#141417] border border-zinc-800 text-zinc-400 hover:text-white"
              title="Sync Now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Cloud / GitHub Info Pill */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#121215] border border-zinc-900 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            {data?.isCloudMode ? (
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span className="text-zinc-300 font-mono text-[10px]">
              CapMorningStar/ucsd-fall-2026
            </span>
          </div>
          <span className="text-zinc-400 text-[10px] font-medium">
            {data?.isCloudMode ? '⚡ 24/7 Online' : '🏠 Local Bridge'}
          </span>
        </div>

        {/* Clean Course Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {courses.map((course) => {
            const count =
              course === 'All'
                ? data?.activeTasks.length || 0
                : data?.activeTasks.filter((t) => t.course.includes(course)).length || 0;

            const isSelected = selectedCourse === course;

            return (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`tap-bounce flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'bg-[#141417] border border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{course}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 48-Hour Urgent Filter Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Assignment' : 'Assignments'} Pending
            </span>
          </div>

          <button
            onClick={() => setUrgentOnly(!urgentOnly)}
            className={`tap-bounce px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              urgentOnly
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <span>🔥 2-Day Radar</span>
            {data?.stats.urgent ? (
              <span className="px-1.5 rounded-full bg-orange-500/30 text-orange-400 text-[10px]">
                {data.stats.urgent}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      {/* Main Active Homework Feed */}
      <main className="flex-1 px-5 py-3 flex flex-col gap-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((item) => {
            const courseStyle = getCourseStyle(item.course);
            const isFading = completingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl bg-[#141417] border border-zinc-800/80 transition-all duration-300 relative flex flex-col gap-2.5 shadow-sm hover:border-zinc-700 ${
                  isFading ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100'
                }`}
                style={{ borderLeft: `3px solid ${courseStyle.border}` }}
              >
                {/* Card Top: Badges & Due Date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${courseStyle.badge}`}
                    >
                      {item.course}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-medium">
                      {item.platform}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300">
                    <Clock
                      className={`w-3 h-3 ${item.isUrgent48h ? 'text-orange-400' : 'text-zinc-500'}`}
                    />
                    <span className={item.isUrgent48h ? 'text-orange-400 font-bold' : ''}>
                      {item.dueFormatted}
                    </span>
                  </div>
                </div>

                {/* Card Middle: Title & Details */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(item)}
                    className="mt-0.5 flex-shrink-0 text-zinc-500 hover:text-amber-400 tap-bounce transition-colors"
                    title="Mark Done"
                  >
                    <Circle className="w-5 h-5 hover:stroke-amber-400 stroke-zinc-500" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
                      {item.title}
                    </h3>
                    {item.details && (
                      <p className="mt-1 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {item.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : !data && isSyncing ? (
          /* Loading State */
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
            <p className="text-xs text-zinc-400 font-medium">Syncing homework with Obsidian...</p>
          </div>
        ) : !data ? (
          /* Connect / Token Setup State */
          <div className="py-12 flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Cloud className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-white">Connect to Obsidian Vault</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
              Scan the 24/7 Cloud QR code from your laptop or enter your GitHub Personal Access Token to connect.
            </p>
            <div className="mt-4 w-full flex flex-col gap-2">
              <input
                type="password"
                placeholder="Paste GitHub Token (gho_...)"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                id="tokenInput"
              />
              <button
                onClick={() => {
                  const val = (document.getElementById('tokenInput') as HTMLInputElement)?.value;
                  if (val) {
                    saveGitHubToken(val);
                    fetchHomework(false);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold tap-bounce hover:bg-amber-300 transition-colors"
              >
                Connect 24/7 Cloud
              </button>
            </div>
          </div>
        ) : (
          /* Empty / All Caught Up State */
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-white">All Caught Up!</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
              {selectedCourse === 'All'
                ? 'No active homework or pending labs. Any update in Obsidian automatically reflects here!'
                : `No pending assignments for ${selectedCourse}.`}
            </p>
          </div>
        )}

        {/* Collapsible Completed Archive (Keeps main screen clean!) */}
        {data && data.completedTasks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-900">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="tap-bounce w-full flex items-center justify-between py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
            >
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completed Archive ({data.completedTasks.length})</span>
              </div>
              {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCompleted && (
              <div className="flex flex-col gap-2 mt-2">
                {data.completedTasks.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/40 opacity-60 flex items-start gap-3"
                  >
                    <button
                      onClick={() => handleReopen(item)}
                      className="mt-0.5 text-emerald-400 hover:text-zinc-400 tap-bounce"
                      title="Reopen"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-emerald-500/20 text-emerald-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-zinc-400 font-semibold block">
                        {item.course}
                      </span>
                      <h4 className="text-xs text-zinc-400 line-through truncate">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* QR Code Modal for Phone Connection */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        networkInfo={networkInfo}
      />
    </div>
  );
};

export default App;
