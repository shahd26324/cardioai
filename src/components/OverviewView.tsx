import React from 'react';
import { Patient } from '../types/cardiac';
import { ViewType } from './Sidebar';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface OverviewViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNavigate: (view: ViewType) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  patients,
  onSelectPatient,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 page-transition">
      {/* 4 KPI Boxes Displaying the Test Data from the PDF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box 1: Holdout Test Dataset Count */}
        <article className="card-clinical p-5 min-h-[130px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#75878d]">
            <span>Holdout Test Dataset</span>
            <div className="w-7 h-7 rounded-lg bg-[#edf4fc] text-[#5b88c8] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-[#1d2b31] tabular-nums">
              184 <small className="text-xs font-medium text-[#75878d]">test records</small>
            </div>
            <div className="text-xs text-[#75878d] mt-1 flex items-center gap-1">
              <span className="text-[#2e9d73] font-bold">20% test split</span>
              <span>(heart_disease_holdout_184.csv)</span>
            </div>
          </div>
        </article>

        {/* Box 2: Positive Cases in Test Data */}
        <article className="card-clinical p-5 min-h-[130px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#75878d]">
            <span>Positive Cases (Target: 1)</span>
            <div className="w-7 h-7 rounded-lg bg-[#fff0f0] text-[#d75a5a] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-[#1d2b31] tabular-nums">
              102
            </div>
            <div className="text-xs text-[#75878d] mt-1 flex items-center gap-1">
              <span className="text-[#d75a5a] font-bold">55.43%</span>
              <span>confirmed heart disease cases</span>
            </div>
          </div>
        </article>

        {/* Box 3: Negative Cases in Test Data */}
        <article className="card-clinical p-5 min-h-[130px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#75878d]">
            <span>Negative Cases (Target: 0)</span>
            <div className="w-7 h-7 rounded-lg bg-[#eaf7f0] text-[#2e9d73] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-[#1d2b31] tabular-nums">
              82
            </div>
            <div className="text-xs text-[#75878d] mt-1 flex items-center gap-1">
              <span className="text-[#2e9d73] font-bold">44.57%</span>
              <span>no heart disease cases</span>
            </div>
          </div>
        </article>

        {/* Box 4: Test Holdout Accuracy & ROC-AUC */}
        <article className="card-clinical p-5 min-h-[130px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#75878d]">
            <span>Test Holdout Evaluation</span>
            <div className="w-7 h-7 rounded-lg bg-[#eaf7f0] text-[#227b5a] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-[#1d2b31] tabular-nums">
              86.96%
            </div>
            <div className="text-xs text-[#75878d] mt-1 flex items-center gap-1">
              <span className="text-[#2e9d73] font-bold">ROC-AUC 0.9221</span>
              <span>(Sensitivity: 91.18%)</span>
            </div>
          </div>
        </article>
      </div>

      {/* Main 2-column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Care Schedule (7 cols) - Clean, holdout IDs (e.g. P-001, P-003, P-005, P-006) */}
        <section className="card-clinical p-6 lg:col-span-7" aria-labelledby="schedule-title">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 id="schedule-title" className="text-base font-bold text-[#1d2b31]">
                Today’s care schedule
              </h2>
              <p className="text-xs text-[#75878d]">Holdout test cohort review check-ins</p>
            </div>
            <button
              onClick={() => onNavigate('monitoring')}
              className="text-xs font-bold text-[#2e9d73] hover:text-[#227b5a] flex items-center gap-1 transition-colors"
            >
              <span>View live streams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#e7eeea]">
            {/* 09:00 P-001 */}
            <div className="py-3.5 flex items-center gap-4">
              <div className="w-14 text-xs font-semibold text-[#75878d] tabular-nums">09:00</div>
              <div 
                onClick={() => {
                  const p = patients.find((x) => x.id === 'P-001') || patients[0];
                  if (p) onSelectPatient(p);
                }}
                className="flex items-center gap-3 flex-1 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#e5f3ed] text-[#477267] font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  P-001
                </div>
                <div>
                  <strong className="block text-xs font-bold text-[#1d2b31] group-hover:text-[#2e9d73] transition-colors">
                    Patient P-001
                  </strong>
                  <span className="text-[11px] text-[#75878d]">Cardiology follow-up · Condition: Heart Disease</span>
                </div>
              </div>
            </div>

            {/* 10:30 P-003 */}
            <div className="py-3.5 flex items-center gap-4">
              <div className="w-14 text-xs font-semibold text-[#75878d] tabular-nums">10:30</div>
              <div 
                onClick={() => {
                  const p = patients.find((x) => x.id === 'P-003') || patients[2];
                  if (p) onSelectPatient(p);
                }}
                className="flex items-center gap-3 flex-1 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#fdf0dc] text-[#9e7040] font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  P-003
                </div>
                <div>
                  <strong className="block text-xs font-bold text-[#1d2b31] group-hover:text-[#2e9d73] transition-colors">
                    Patient P-003
                  </strong>
                  <span className="text-[11px] text-[#75878d]">Remote telemetry review · Condition: Heart Disease</span>
                </div>
              </div>
            </div>

            {/* 13:00 P-005 */}
            <div className="py-3.5 flex items-center gap-4">
              <div className="w-14 text-xs font-semibold text-[#75878d] tabular-nums">13:00</div>
              <div 
                onClick={() => {
                  const p = patients.find((x) => x.id === 'P-005') || patients[4];
                  if (p) onSelectPatient(p);
                }}
                className="flex items-center gap-3 flex-1 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#e5f3ed] text-[#477267] font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  P-005
                </div>
                <div>
                  <strong className="block text-xs font-bold text-[#1d2b31] group-hover:text-[#2e9d73] transition-colors">
                    Patient P-005
                  </strong>
                  <span className="text-[11px] text-[#75878d]">Medication check-in · Condition: No Heart Disease</span>
                </div>
              </div>
            </div>

            {/* 15:30 P-006 */}
            <div className="py-3.5 flex items-center gap-4">
              <div className="w-14 text-xs font-semibold text-[#75878d] tabular-nums">15:30</div>
              <div 
                onClick={() => {
                  const p = patients.find((x) => x.id === 'P-006') || patients[5];
                  if (p) onSelectPatient(p);
                }}
                className="flex items-center gap-3 flex-1 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#e5f3ed] text-[#477267] font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  P-006
                </div>
                <div>
                  <strong className="block text-xs font-bold text-[#1d2b31] group-hover:text-[#2e9d73] transition-colors">
                    Patient P-006
                  </strong>
                  <span className="text-[11px] text-[#75878d]">Post-discharge follow-up · Condition: No Heart Disease</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Needs Attention Panel (5 cols) */}
        <section className="card-clinical p-6 lg:col-span-5" aria-labelledby="attention-title">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 id="attention-title" className="text-base font-bold text-[#1d2b31]">
                Needs your attention
              </h2>
              <p className="text-xs text-[#75878d]">Prioritized by clinical ML risk &amp; anomaly detection</p>
            </div>
            <button
              onClick={() => onNavigate('monitoring')}
              className="text-xs font-bold text-[#2e9d73] hover:text-[#227b5a]"
            >
              See all
            </button>
          </div>

          <div className="divide-y divide-[#e7eeea]">
            {patients.slice(0, 4).map((p) => {
              const isAlert = p.state === 'alert';
              const isWatch = p.state === 'watch';

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPatient(p)}
                  className="py-3 flex items-center gap-3 cursor-pointer hover:bg-[#fafdfb] px-2 -mx-2 rounded-lg transition-colors"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isAlert
                        ? 'bg-[#d75a5a] shadow-[0_0_0_4px_rgba(215,90,90,0.18)]'
                        : isWatch
                        ? 'bg-[#d79630] shadow-[0_0_0_4px_rgba(215,150,48,0.18)]'
                        : 'bg-[#2e9d73] shadow-[0_0_0_4px_rgba(46,157,115,0.18)]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-[#1d2b31]">{p.id}</strong>
                      <span className="text-[10px] text-[#75878d]">Risk: {p.risk}%</span>
                    </div>
                    <span className="block text-[11px] text-[#75878d] truncate">
                      HR {p.hr} bpm · BP {p.bp[0]}/{p.bp[1]} · Condition: {p.condition}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
