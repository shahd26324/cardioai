import React, { useState } from 'react';
import { Patient } from '../types/cardiac';
import { 
  X, 
  BrainCircuit, 
  FileText 
} from 'lucide-react';

interface PatientDetailDrawerProps {
  patient: Patient | null;
  onClose: () => void;
  onGenerateReport: (patient: Patient) => void;
}

export const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({
  patient,
  onClose,
  onGenerateReport,
}) => {
  const [activeExplainTab, setActiveExplainTab] = useState<'both' | 'shap' | 'lime'>('both');

  if (!patient) return null;

  const isAlert = patient.state === 'alert';
  const isWatch = patient.state === 'watch';
  const isDisease = patient.condition === 'Heart Disease';

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-xs transition-opacity duration-300"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[620px] h-full bg-[#fbfdfb] border-l border-[#e7eeea] shadow-2xl overflow-y-auto p-6 sm:p-8 flex flex-col justify-between space-y-6 animate-in slide-in-from-right duration-300"
      >
        <div>
          {/* Drawer Header (Strictly Patient ID, no names) */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#e7eeea]">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 ${
                  isWatch
                    ? 'bg-[#fdf0dc] text-[#9e7040]'
                    : isAlert
                    ? 'bg-[#fff0f0] text-[#c45656]'
                    : 'bg-[#e5f3ed] text-[#477267]'
                }`}
              >
                {patient.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="drawer-title" className="text-xl font-extrabold text-[#1d2b31] tracking-tight font-mono">
                    Patient {patient.id}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isDisease ? 'bg-[#fff0f0] text-[#d75a5a]' : 'bg-[#eaf7f0] text-[#227b5a]'
                    }`}
                  >
                    {patient.condition}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      patient.concordance.startsWith('True') ? 'bg-[#eaf7f0] text-[#227b5a]' : 'bg-[#fff0f0] text-[#d75a5a]'
                    }`}
                  >
                    ✓ {patient.concordance}
                  </span>
                </div>
                <p className="text-xs text-[#75878d]">
                  {patient.age} years · {patient.sex} · Holdout Dataset Record
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#e7eeea] text-[#75878d] hover:text-[#d75a5a] hover:bg-[#fff0f0] flex items-center justify-center transition-colors text-lg"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Hero Risk & State */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="card-clinical p-4 bg-white">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#75878d] mb-1">
                Cardiovascular Risk
              </span>
              {patient.missingFeatures && patient.missingFeatures.length > 0 ? (
                <div className="text-xs font-bold text-[#d75a5a] py-2">
                  Unable to predict due to missing clinical features
                </div>
              ) : (
                <div className="text-3xl font-extrabold text-[#1d2b31] tracking-tight tabular-nums">
                  {patient.risk}
                  <small className="text-xs font-normal text-[#75878d]"> / 100</small>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-[#2e9d73]">Model confidence 92%</span>
                <div className="flex-1 h-1.5 bg-[#edf1ef] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2e9d73] rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>

            <div className="card-clinical p-4 bg-white">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#75878d] mb-1">
                Clinical State
              </span>
              <div
                className={`text-xl font-extrabold tracking-tight mt-1 ${
                  isAlert
                    ? 'text-[#d75a5a]'
                    : isWatch
                    ? 'text-[#d79630]'
                    : 'text-[#2e9d73]'
                }`}
              >
                {isAlert ? 'Review now' : isWatch ? 'Watch closely' : 'Stable'}
              </div>
              <span className="block text-[11px] text-[#75878d] mt-2">
                Kafka packet: {new Date(patient.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Core Cardiac Vitals */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
            <div className="card-clinical p-3 bg-white">
              <span className="block text-[10px] text-[#75878d] uppercase font-bold">Heart rate</span>
              <strong className="text-base font-bold text-[#1d2b31] tabular-nums">{patient.hr}</strong>{' '}
              <span className="text-[10px] text-[#75878d]">bpm</span>
            </div>
            <div className="card-clinical p-3 bg-white">
              <span className="block text-[10px] text-[#75878d] uppercase font-bold">Resp. rate</span>
              <strong className="text-base font-bold text-[#227b5a] tabular-nums">{patient.rr}</strong>{' '}
              <span className="text-[10px] text-[#75878d]">/min</span>
            </div>
            <div className="card-clinical p-3 bg-white">
              <span className="block text-[10px] text-[#75878d] uppercase font-bold">Blood pressure</span>
              <strong className="text-base font-bold text-[#1d2b31] tabular-nums">{patient.bp[0]}/{patient.bp[1]}</strong>{' '}
              <span className="text-[10px] text-[#75878d]">mmHg</span>
            </div>
            <div className="card-clinical p-3 bg-white">
              <span className="block text-[10px] text-[#75878d] uppercase font-bold">SpO₂</span>
              <strong className="text-base font-bold text-[#1d2b31] tabular-nums">{patient.spo2}</strong>{' '}
              <span className="text-[10px] text-[#75878d]">%</span>
            </div>
          </div>

          {/* Cleveland 13 Features Grid */}
          <div className="card-clinical p-4 mt-4 bg-gradient-to-br from-[#fdfcff] to-[#f7f5fc] border-[#e5e1f1]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-[#1d2b31]">13 Cleveland Clinical Predictors</h3>
                <p className="text-[10px] text-[#75878d]">Features recorded in holdout test evaluation</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#efebfb] text-[#6857a8]">
                Auditable Record
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-[#ebe8f4]">
                <span className="block text-[9px] text-[#75878d]">Chest Pain (cp)</span>
                <strong className="block text-xs font-bold text-[#1d2b31] truncate" title={patient.features.cp}>
                  {patient.features.cp}
                </strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ebe8f4]">
                <span className="block text-[9px] text-[#75878d]">Resting BP (trestbps)</span>
                <strong className="block text-xs font-bold text-[#1d2b31]">
                  {patient.features.trestbps} mmHg
                </strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ebe8f4]">
                <span className="block text-[9px] text-[#75878d]">Cholesterol (chol)</span>
                <strong className="block text-xs font-bold text-[#1d2b31]">
                  {patient.features.chol} mg/dl
                </strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ebe8f4]">
                <span className="block text-[9px] text-[#75878d]">Max HR (thalch)</span>
                <strong className="block text-xs font-bold text-[#1d2b31]">
                  {patient.features.thalch} bpm
                </strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ebe8f4]">
                <span className="block text-[9px] text-[#75878d]">ST Depress. (oldpeak)</span>
                <strong className="block text-xs font-bold text-[#1d2b31]">
                  {patient.features.oldpeak} mm
                </strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ebe8f4]">
                <span className="block text-[9px] text-[#75878d]">Vessels (ca)</span>
                <strong className="block text-xs font-bold text-[#1d2b31]">
                  {patient.features.ca} colored
                </strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ebe8f4]">
                <span className="block text-[9px] text-[#75878d]">Exercise Angina</span>
                <strong className="block text-xs font-bold text-[#1d2b31]">
                  {patient.features.exang === 'True' ? 'Yes' : 'No'}
                </strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ebe8f4]">
                <span className="block text-[9px] text-[#75878d]">ST Slope</span>
                <strong className="block text-xs font-bold text-[#1d2b31] capitalize">
                  {patient.features.slope}
                </strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ebe8f4]">
                <span className="block text-[9px] text-[#75878d]">Thalassemia</span>
                <strong className="block text-xs font-bold text-[#1d2b31] truncate" title={patient.features.thal}>
                  {patient.features.thal}
                </strong>
              </div>
            </div>
          </div>

          {/* Prominent SHAP and LIME Explanation */}
          <div className="card-clinical p-5 mt-4 bg-white border border-[#d6ecdf]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#227b5a]">
                  Individual Patient Explainability
                </span>
                <h3 className="text-sm font-extrabold text-[#1d2b31]">
                  SHAP (Additive Shapley) &amp; LIME (Local Surrogate)
                </h3>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-[#f5f9f6] p-0.5 rounded-lg border border-[#e7eeea]">
                <button
                  type="button"
                  onClick={() => setActiveExplainTab('both')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    activeExplainTab === 'both' ? 'bg-white text-[#227b5a] shadow-xs' : 'text-[#75878d]'
                  }`}
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => setActiveExplainTab('shap')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    activeExplainTab === 'shap' ? 'bg-white text-[#227b5a] shadow-xs' : 'text-[#75878d]'
                  }`}
                >
                  SHAP
                </button>
                <button
                  type="button"
                  onClick={() => setActiveExplainTab('lime')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    activeExplainTab === 'lime' ? 'bg-white text-[#227b5a] shadow-xs' : 'text-[#75878d]'
                  }`}
                >
                  LIME
                </button>
              </div>
            </div>

            {/* SHAP Section */}
            {(activeExplainTab === 'both' || activeExplainTab === 'shap') && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#1d2b31] mb-2 pb-1 border-b border-[#e7eeea]">
                  <span>SHAP Feature Attribution</span>
                </div>
                <div className="space-y-2">
                  {patient.shapExplanation.contributions.slice(0, 6).map((c) => (
                    <div key={c.feature} className="grid grid-cols-12 items-center gap-2 text-xs">
                      <span className="col-span-4 text-[#75878d] truncate" title={c.label}>
                        {c.label} ({c.value})
                      </span>
                      <div className="col-span-6 h-2 bg-[#edf2ef] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            c.isPositive ? 'bg-[#e5a5a5]' : 'bg-[#2e9d73]'
                          }`}
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                      <span
                        className={`col-span-2 text-right font-mono text-[11px] font-semibold ${
                          c.isPositive ? 'text-[#d75a5a]' : 'text-[#2e9d73]'
                        }`}
                      >
                        {c.isPositive ? '+' : ''}
                        {c.shapValue.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LIME Section */}
            {(activeExplainTab === 'both' || activeExplainTab === 'lime') && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#1d2b31] mb-2 pb-1 border-b border-[#e7eeea]">
                  <span>LIME Decision Rules &amp; Probabilities</span>
                </div>

                {/* Probability Bar */}
                <div className="mb-3 p-2 bg-[#f5f9f6] rounded-lg border border-[#e7eeea]">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-[#2e9d73]">
                      No Heart Disease: {(patient.limeExplanation.probabilityNoDisease * 100).toFixed(1)}%
                    </span>
                    <span className="text-[#d75a5a]">
                      Heart Disease: {(patient.limeExplanation.probabilityHeartDisease * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#edf1ef] rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-[#2e9d73]"
                      style={{ width: `${patient.limeExplanation.probabilityNoDisease * 100}%` }}
                    />
                    <div
                      className="h-full bg-[#d75a5a]"
                      style={{ width: `${patient.limeExplanation.probabilityHeartDisease * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {patient.limeExplanation.rules.slice(0, 5).map((rule, idx) => {
                    const isDis = rule.direction === 'Heart Disease';
                    return (
                      <div
                        key={idx}
                        className="p-2 bg-[#fbfdfb] rounded-lg border border-[#e7eeea] flex items-center justify-between"
                      >
                        <span className="font-mono text-[11px] text-[#1d2b31] truncate mr-2" title={rule.rule}>
                          {rule.rule}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-bold shrink-0 ${
                            isDis ? 'text-[#d75a5a]' : 'text-[#2e9d73]'
                          }`}
                        >
                          {isDis ? '+' : '-'}
                          {rule.weight.toFixed(2)} ({isDis ? 'supports disease' : 'protective'})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer with Generate Report Button */}
        <div className="pt-4 border-t border-[#e7eeea] flex items-center justify-between gap-3">
          <button
            onClick={() => onGenerateReport(patient)}
            className="flex-1 py-2.5 px-4 bg-[#2e9d73] hover:bg-[#227b5a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Interpretable Clinical Report</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-[#e7eeea] rounded-xl text-xs font-bold text-[#75878d] hover:bg-[#f5f9f6] transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
};
