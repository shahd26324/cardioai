import React from 'react';
import { Calendar, UserPlus, Radio, Activity, Users } from 'lucide-react';
import { ViewType } from './Sidebar';

interface TopbarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  onOpenAddPatient: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  alertCount: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  onSelectView,
  onOpenAddPatient,
  isStreaming,
  onToggleStreaming,
  alertCount,
}) => {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const shortDate = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const hour = today.getHours();
  let greetingTime = 'Good morning';
  if (hour >= 12 && hour < 17) greetingTime = 'Good afternoon';
  else if (hour >= 17) greetingTime = 'Good evening';

  const viewTitles: Record<ViewType, { title: string; subtitle: string }> = {
    overview: {
      title: `${greetingTime}`,
      subtitle: 'Here’s your cardiac care overview and predictive telemetry.',
    },
    monitoring: {
      title: 'Live Patient Monitoring',
      subtitle: 'Apache Kafka streaming real-time vitals and Random Forest risk assessment.',
    },
    patients: {
      title: 'Patient List',
      subtitle: 'Verified UCI Cleveland cohort dataset records and interpretable clinical reports.',
    },
    kafka: {
      title: 'IoT Patient Vital Stream',
      subtitle: 'Real-time vital updates and streaming events from monitored patients.',
    },
    explainability: {
      title: 'AI Explainability',
      subtitle: 'SHAP Shapley values and LIME surrogate rules on holdout records.',
    },
  };

  const currentMeta = viewTitles[currentView];

  return (
    <header className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#2e9d73] mb-1">
            {dateFormatted}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d2b31] leading-tight">
            {currentMeta.title}
          </h1>
          <p className="text-sm text-[#75878d] mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Kafka Streaming Live Toggle */}
          <button
            onClick={onToggleStreaming}
            title={isStreaming ? 'Kafka Stream Active · Click to Pause' : 'Kafka Stream Paused · Click to Resume'}
            className={`inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-xs font-semibold transition-all ${
              isStreaming
                ? 'bg-[#eaf7f0] border-[#c4e6d4] text-[#227b5a] shadow-xs'
                : 'bg-white border-[#e7eeea] text-[#75878d] hover:bg-[#f5f9f6]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-[#2e9d73] animate-pulse-ring' : 'bg-neutral-400'
              }`}
            />
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kafka Stream:</span>
            <span>{isStreaming ? 'Live' : 'Paused'}</span>
          </button>

          {/* Add Patient Button */}
          <button
            onClick={onOpenAddPatient}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-[#2e9d73] hover:bg-[#227b5a] text-white text-xs font-bold shadow-xs transition-all transform active:scale-95"
            aria-label="Add patient with clinical features"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Patient</span>
          </button>

          {/* Date Indicator */}
          <div className="hidden lg:inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-[#e7eeea] bg-white text-xs font-semibold text-[#75878d]">
            <Calendar className="w-3.5 h-3.5 text-[#2e9d73]" />
            <span>Today, {shortDate}</span>
          </div>

          {/* Clinician Profile */}
          <div
            className="w-9 h-9 rounded-xl bg-[#3b5961] text-white font-bold text-xs flex items-center justify-center shadow-xs"
            title="Attending Physician (MD)"
          >
            MD
          </div>
        </div>
      </div>

      {/* Primary Tab View Switcher */}
      <div 
        className="inline-flex flex-wrap p-1 bg-white border border-[#e7eeea] rounded-xl shadow-xs gap-1"
        role="tablist"
        aria-label="Dashboard views"
      >
        <button
          role="tab"
          aria-selected={currentView === 'overview'}
          onClick={() => onSelectView('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'overview'
              ? 'text-[#227b5a] bg-[#eaf7f0] shadow-xs'
              : 'text-[#75878d] hover:text-[#1d2b31] hover:bg-[#f5f9f6]'
          }`}
        >
          Overview
        </button>

        <button
          role="tab"
          aria-selected={currentView === 'monitoring'}
          onClick={() => onSelectView('monitoring')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'monitoring'
              ? 'text-[#227b5a] bg-[#eaf7f0] shadow-xs'
              : 'text-[#75878d] hover:text-[#1d2b31] hover:bg-[#f5f9f6]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live Monitoring</span>
          {alertCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-[#d75a5a] text-white text-[10px] rounded-full">
              {alertCount}
            </span>
          )}
        </button>

        <button
          role="tab"
          aria-selected={currentView === 'patients'}
          onClick={() => onSelectView('patients')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'patients'
              ? 'text-[#227b5a] bg-[#eaf7f0] shadow-xs'
              : 'text-[#75878d] hover:text-[#1d2b31] hover:bg-[#f5f9f6]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Patient List</span>
        </button>

        <button
          role="tab"
          aria-selected={currentView === 'kafka'}
          onClick={() => onSelectView('kafka')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'kafka'
              ? 'text-[#227b5a] bg-[#eaf7f0] shadow-xs'
              : 'text-[#75878d] hover:text-[#1d2b31] hover:bg-[#f5f9f6]'
          }`}
        >
          <Radio className="w-3 h-3 text-[#5b88c8]" />
          <span>Kafka Stream Engine</span>
        </button>

        <button
          role="tab"
          aria-selected={currentView === 'explainability'}
          onClick={() => onSelectView('explainability')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'explainability'
              ? 'text-[#227b5a] bg-[#eaf7f0] shadow-xs'
              : 'text-[#75878d] hover:text-[#1d2b31] hover:bg-[#f5f9f6]'
          }`}
        >
          AI Explainability
        </button>
      </div>
    </header>
  );
};
