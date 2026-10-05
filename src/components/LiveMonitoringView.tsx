import React, { useState } from 'react';
import { Patient } from '../types/cardiac';
import { Search } from 'lucide-react';

interface LiveMonitoringViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  isStreaming: boolean;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  patients,
  onSelectPatient,
  isStreaming,
}) => {
  const [filterState, setFilterState] = useState<'all' | 'alert' | 'watch' | 'stable'>('all');
  const [sortBy, setSortBy] = useState<'risk_desc' | 'risk_asc' | 'hr_desc' | 'id'>('risk_desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering
  const filtered = patients.filter((p) => {
    if (filterState !== 'all' && p.state !== filterState) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return p.id.toLowerCase().includes(term) || p.condition.toLowerCase().includes(term);
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'risk_desc') return b.risk - a.risk;
    if (sortBy === 'risk_asc') return a.risk - b.risk;
    if (sortBy === 'hr_desc') return b.hr - a.hr;
    if (sortBy === 'id') return a.id.localeCompare(b.id);
    return 0;
  });

  return (
    <div className="space-y-6 page-transition w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1d2b31] tracking-tight">
            Live Patient Monitoring
          </h2>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#75878d]" />
            <input
              type="text"
              placeholder="Search by ID (e.g. P-001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-8 pr-3 text-xs bg-white border border-[#e7eeea] rounded-xl text-[#1d2b31] placeholder-[#75878d] focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-[#e7eeea] rounded-xl p-0.5">
            <button
              onClick={() => setFilterState('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                filterState === 'all'
                  ? 'bg-[#eaf7f0] text-[#227b5a]'
                  : 'text-[#75878d] hover:text-[#1d2b31]'
              }`}
            >
              All ({patients.length})
            </button>
            <button
              onClick={() => setFilterState('alert')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                filterState === 'alert'
                  ? 'bg-[#fff0f0] text-[#d75a5a]'
                  : 'text-[#75878d] hover:text-[#1d2b31]'
              }`}
            >
              High Risk ({patients.filter((p) => p.state === 'alert').length})
            </button>
            <button
              onClick={() => setFilterState('watch')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                filterState === 'watch'
                  ? 'bg-[#fff6e5] text-[#d79630]'
                  : 'text-[#75878d] hover:text-[#1d2b31]'
              }`}
            >
              Watch ({patients.filter((p) => p.state === 'watch').length})
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-3 text-xs bg-white border border-[#e7eeea] rounded-xl text-[#75878d] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30 cursor-pointer"
          >
            <option value="risk_desc">Sort: Highest Risk</option>
            <option value="risk_asc">Sort: Lowest Risk</option>
            <option value="hr_desc">Sort: Heart Rate</option>
            <option value="id">Sort: Patient ID</option>
          </select>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-live="polite">
        {filtered.map((patient) => {
          const isAlert = patient.state === 'alert';
          const isWatch = patient.state === 'watch';

          const riskBadgeClass = isAlert
            ? 'text-[#bd4b4b] bg-[#fff0f0]'
            : isWatch
            ? 'text-[#a36e1e] bg-[#fff6e5]'
            : 'text-[#227b5a] bg-[#eaf7f0]';

          const riskBarClass = isAlert
            ? 'bg-[#d75a5a]'
            : isWatch
            ? 'bg-[#d79630]'
            : 'bg-[#2e9d73]';

          const secondsAgo = Math.max(0, Math.round((Date.now() - patient.updatedAt) / 1000));
          const topShap = patient.shapExplanation.contributions.slice(0, 3);

          return (
            <article
              key={patient.id}
              tabIndex={0}
              role="button"
              onClick={() => onSelectPatient(patient)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPatient(patient);
                }
              }}
              className="card-clinical p-5 cursor-pointer hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(46,76,63,0.12)] transition-all flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#2e9d73]"
            >
              <div>
                {/* Header (No human names - strictly patient IDs like P-001) */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        isWatch
                          ? 'bg-[#fdf0dc] text-[#9e7040]'
                          : isAlert
                          ? 'bg-[#fff0f0] text-[#c45656]'
                          : 'bg-[#e5f3ed] text-[#477267]'
                      }`}
                    >
                      {patient.id}
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-sm font-bold text-[#1d2b31] truncate font-mono">
                        Patient {patient.id}
                      </strong>
                      <span className="block text-[11px] text-[#75878d] truncate">
                        {patient.age} yrs · {patient.sex} · Condition: <span className="font-semibold text-[#1d2b31]">{patient.condition}</span>
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${riskBadgeClass}`}>
                    {isAlert ? 'High risk' : isWatch ? 'Moderate' : 'Low risk'}
                  </span>
                </div>

                {/* Risk Score & Meter */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-black text-[#1d2b31] tracking-tight tabular-nums">
                      {patient.risk}
                      <small className="text-xs font-medium text-[#75878d]"> / 100</small>
                    </span>
                    <span className="text-[11px] text-[#75878d]">CV risk score (RF)</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#edf1ef] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${riskBarClass}`}
                      style={{ width: `${patient.risk}%` }}
                    />
                  </div>
                </div>

                {/* Cardiac Vitals Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-[#e7eeea] text-left">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#75878d] font-semibold">
                      Heart rate
                    </span>
                    <strong className="text-sm font-bold text-[#1d2b31] tabular-nums">
                      {patient.hr}
                    </strong>{' '}
                    <em className="text-[9px] not-italic text-[#75878d]">bpm</em>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#75878d] font-semibold">
                      Blood pressure
                    </span>
                    <strong className="text-sm font-bold text-[#1d2b31] tabular-nums">
                      {patient.bp[0]}/{patient.bp[1]}
                    </strong>{' '}
                    <em className="text-[9px] not-italic text-[#75878d]">mmHg</em>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#75878d] font-semibold">
                      SpO₂
                    </span>
                    <strong className="text-sm font-bold text-[#1d2b31] tabular-nums">
                      {patient.spo2}
                    </strong>{' '}
                    <em className="text-[9px] not-italic text-[#75878d]">%</em>
                  </div>

                  <div className="pt-1">
                    <span className="block text-[9px] uppercase tracking-wider text-[#75878d] font-semibold">
                      Cholesterol
                    </span>
                    <strong className="text-sm font-bold text-[#1d2b31] tabular-nums">
                      {patient.features.chol}
                    </strong>{' '}
                    <em className="text-[9px] not-italic text-[#75878d]">mg/dL</em>
                  </div>

                  <div className="pt-1">
                    <span className="block text-[9px] uppercase tracking-wider text-[#75878d] font-semibold">
                      ST Depress.
                    </span>
                    <strong className="text-sm font-bold text-[#1d2b31] tabular-nums">
                      {patient.features.oldpeak}
                    </strong>{' '}
                    <em className="text-[9px] not-italic text-[#75878d]">mm</em>
                  </div>

                  <div className="pt-1">
                    <span className="block text-[9px] uppercase tracking-wider text-[#75878d] font-semibold">
                      Vessels (ca)
                    </span>
                    <strong className="text-sm font-bold text-[#1d2b31] tabular-nums">
                      {patient.features.ca}
                    </strong>{' '}
                    <em className="text-[9px] not-italic text-[#75878d]">colored</em>
                  </div>
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#e7eeea]">
                  <span
                    className={`font-bold ${
                      isAlert
                        ? 'text-[#d75a5a]'
                        : isWatch
                        ? 'text-[#d79630]'
                        : 'text-[#2e9d73]'
                    }`}
                  >
                    {isAlert
                      ? 'Alert · review now'
                      : isWatch
                      ? 'Watch closely'
                      : 'Within baseline'}
                  </span>
                  <span className="text-[#75878d]">
                    Kafka stream: {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}
                  </span>
                </div>

                {/* Explainability SHAP Preview */}
                <div className="mt-3 pt-3 border-t border-[#e7eeea]">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#75878d] mb-1.5">
                    <span>Explainability · SHAP + LIME</span>
                    <span className="text-[#2e9d73]">Coherent</span>
                  </div>

                  <div className="space-y-1.5">
                    {topShap.map((contrib) => (
                      <div key={contrib.feature} className="flex items-center gap-2 text-[10px]">
                        <span className="w-24 text-[#75878d] truncate" title={contrib.label}>
                          {contrib.label}
                        </span>
                        <div className="flex-1 h-1.5 bg-[#edf1ef] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              contrib.isPositive ? 'bg-[#e5a5a5]' : 'bg-[#2e9d73]'
                            }`}
                            style={{ width: `${contrib.percentage}%` }}
                          />
                        </div>
                        <span className="w-9 text-right font-mono text-[9px] text-[#75878d]">
                          {contrib.isPositive ? '+' : ''}
                          {contrib.shapValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card-clinical p-12 text-center text-[#75878d]">
          <p className="text-base font-bold text-[#1d2b31] mb-1">No patients found</p>
          <p className="text-xs">Adjust your search term or active filter criteria.</p>
        </div>
      )}
    </div>
  );
};
