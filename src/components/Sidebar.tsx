import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Radio, 
  BrainCircuit, 
  Heart
} from 'lucide-react';

export type ViewType = 'overview' | 'monitoring' | 'patients' | 'kafka' | 'explainability';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, alertCount }) => {
  const navItems = [
    {
      id: 'overview' as ViewType,
      label: 'Clinical Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'monitoring' as ViewType,
      label: 'Live Monitoring (Kafka)',
      icon: Activity,
      badge: alertCount > 0 ? alertCount : undefined,
    },
    {
      id: 'patients' as ViewType,
      label: 'Patient List & Reports',
      icon: Users,
    },
    {
      id: 'kafka' as ViewType,
      label: 'Apache Kafka Stream Engine',
      icon: Radio,
    },
    {
      id: 'explainability' as ViewType,
      label: 'AI Explainability',
      icon: BrainCircuit,
    },
  ];

  return (
    <aside 
      className="w-[72px] shrink-0 bg-white border-r border-[#e7eeea] flex flex-col items-center py-6 px-3 gap-6 z-20 min-h-screen"
      aria-label="Primary navigation"
    >
      {/* Brand Icon */}
      <button 
        onClick={() => onSelectView('overview')}
        title="Pulseboard Cardio AI"
        className="w-10 h-10 rounded-xl bg-[#2e9d73] text-white flex items-center justify-center shadow-[0_7px_14px_rgba(46,157,115,0.25)] hover:bg-[#227b5a] transition-all transform hover:scale-105"
      >
        <Heart className="w-5 h-5 fill-current" />
      </button>

      {/* Navigation Links */}
      <nav className="flex flex-col items-center gap-2.5 flex-1 w-full" aria-label="Views">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={item.label}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'text-[#227b5a] bg-[#eaf7f0] font-semibold'
                  : 'text-[#94a4a7] hover:text-[#2e9d73] hover:bg-[#eaf7f0] hover:-translate-y-0.5'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d75a5a] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Clinician Profile Avatar */}
      <div 
        className="w-9 h-9 rounded-full bg-[#dff1e8] text-[#286951] font-bold text-xs flex items-center justify-center cursor-pointer border border-[#cbe4d8] shadow-sm hover:ring-2 hover:ring-[#2e9d73]/30 transition-all"
        title="Logged in as Attending Cardiologist (MD)"
      >
        MD
      </div>
    </aside>
  );
};
