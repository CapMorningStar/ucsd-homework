import React from 'react';
import { Home, CheckSquare, BookOpen, ShieldCheck } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'tasks' | 'courses' | 'sync';
  onSelectTab: (tab: 'home' | 'tasks' | 'courses' | 'sync') => void;
  urgentCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  urgentCount
}) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare, badge: urgentCount > 0 ? urgentCount : undefined },
    { id: 'courses' as const, label: 'Courses', icon: BookOpen },
    { id: 'sync' as const, label: 'Sync', icon: ShieldCheck }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121113]/95 backdrop-blur-lg border-t border-zinc-800/80 px-4 py-2 flex items-center justify-around max-w-lg mx-auto pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`tap-bounce flex flex-col items-center gap-1 py-1 px-3 rounded-2xl relative transition-all duration-200 ${
              isActive
                ? 'text-amber-400 font-bold scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-orange-500 text-black font-extrabold text-[9px] shadow-sm">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">{tab.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
