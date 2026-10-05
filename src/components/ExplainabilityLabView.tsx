import React, { useState } from 'react';
import { Patient } from '../types/cardiac';
import { 
  BrainCircuit, 
  BarChart3, 
  CheckCircle2, 
  Info, 
  TrendingUp, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ExplainabilityLabViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const ExplainabilityLabView: React.FC<ExplainabilityLabViewProps> = ({
  patients,
  onSelectPatient,
}) => {
  const [activePatientId, setActivePatientId] = useState<string>(patients[0]?.id || 'OW');
  const [explainMode, setExplainMode] = useState<'both' | 'shap' | 'lime'>('both');

  const selectedPatient = patients.find((p) => p.id === activePatientId) || patients[0];

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1d2b31] tracking-tight">
            AI Explainability
          </h2>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#75878d]">Select Patient:</span>
          <select
            value={activePatientId}
            onChange={(e) => setActivePatientId(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-[#e7eeea] rounded-xl text-[#1d2b31] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30 cursor-pointer shadow-xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                Patient {p.id} ({p.risk}% · {p.condition})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Benchmark Grid from Notebook 1 (Cell 39) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <article className="card-clinical p-4 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#75878d] mb-1">
            ROC-AUC
          </span>
          <strong className="text-2xl font-black text-[#2e9d73] tracking-tight tabular-nums">
            0.9221
          </strong>
          <span className="block text-[10px] text-[#75878d] mt-0.5">Holdout 184</span>
        </article>

        <article className="card-clinical p-4 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#75878d] mb-1">
            Sensitivity (Recall)
          </span>
          <strong className="text-2xl font-black text-[#227b5a] tracking-tight tabular-nums">
            91.18%
          </strong>
          <span className="block text-[10px] text-[#75878d] mt-0.5">Catches 93/102</span>
        </article>

        <article className="card-clinical p-4 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#75878d] mb-1">
            Specificity
          </span>
          <strong className="text-2xl font-black text-[#1d2b31] tracking-tight tabular-nums">
            81.71%
          </strong>
          <span className="block text-[10px] text-[#75878d] mt-0.5">True Negative</span>
        </article>

        <article className="card-clinical p-4 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#75878d] mb-1">
            Precision
          </span>
          <strong className="text-2xl font-black text-[#1d2b31] tracking-tight tabular-nums">
            86.11%
          </strong>
          <span className="block text-[10px] text-[#75878d] mt-0.5">PPV</span>
        </article>

        <article className="card-clinical p-4 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#75878d] mb-1">
            Accuracy
          </span>
          <strong className="text-2xl font-black text-[#1d2b31] tracking-tight tabular-nums">
            86.96%
          </strong>
          <span className="block text-[10px] text-[#75878d] mt-0.5">Overall</span>
        </article>

        <article className="card-clinical p-4 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#75878d] mb-1">
            F1-Score
          </span>
          <strong className="text-2xl font-black text-[#5b88c8] tracking-tight tabular-nums">
            0.8857
          </strong>
          <span className="block text-[10px] text-[#75878d] mt-0.5">Harmonic Mean</span>
        </article>
      </div>

      {/* Deep-Dive: Selected Patient Explainability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SHAP Breakdown Panel (6 cols) */}
        <section className="card-clinical p-6 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1d2b31]">
                SHAP Waterfall: Patient {selectedPatient.id}
              </h3>
            </div>

            <p className="text-xs text-[#75878d] mb-4">
              Red bars push risk <strong>towards Heart Disease</strong>; green bars lower risk towards health.
            </p>

            <div className="space-y-2.5">
              {selectedPatient.shapExplanation.contributions.map((c) => (
                <div key={c.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1d2b31]">
                      {c.label} <small className="text-[#75878d]">({c.value})</small>
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        c.isPositive ? 'text-[#d75a5a]' : 'text-[#2e9d73]'
                      }`}
                    >
                      {c.isPositive ? '+' : ''}
                      {c.shapValue.toFixed(3)}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#edf1ef] rounded-full overflow-hidden flex">
                    {c.isPositive ? (
                      <div
                        className="h-full bg-[#e5a5a5] rounded-full transition-all duration-500"
                        style={{ width: `${c.percentage}%` }}
                      />
                    ) : (
                      <div
                        className="h-full bg-[#2e9d73] rounded-full transition-all duration-500"
                        style={{ width: `${c.percentage}%` }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e7eeea] flex items-center justify-end">
            <button
              onClick={() => onSelectPatient(selectedPatient)}
              className="text-xs font-bold text-[#2e9d73] hover:text-[#227b5a] flex items-center gap-1"
            >
              <span>Open patient drawer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* LIME Breakdown Panel (6 cols) */}
        <section className="card-clinical p-6 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1d2b31]">
                LIME Decision Rules: Patient {selectedPatient.id}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase ${
                  selectedPatient.risk >= 50
                    ? 'bg-[#fff0f0] text-[#d75a5a]'
                    : 'bg-[#eaf7f0] text-[#227b5a]'
                }`}
              >
                Class: {selectedPatient.limeExplanation.predictedClass}
              </span>
            </div>

            {/* Probability Breakdown Bar */}
            <div className="mb-5 p-3 rounded-xl bg-[#f5f9f6] border border-[#e7eeea]">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#2e9d73]">
                  No Heart Disease: {(selectedPatient.limeExplanation.probabilityNoDisease * 100).toFixed(1)}%
                </span>
                <span className="text-[#d75a5a]">
                  Heart Disease: {(selectedPatient.limeExplanation.probabilityHeartDisease * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#edf1ef] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#2e9d73]"
                  style={{
                    width: `${selectedPatient.limeExplanation.probabilityNoDisease * 100}%`,
                  }}
                />
                <div
                  className="h-full bg-[#d75a5a]"
                  style={{
                    width: `${selectedPatient.limeExplanation.probabilityHeartDisease * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* LIME Rules List */}
            <div className="space-y-2.5">
              {selectedPatient.limeExplanation.rules.map((rule, idx) => {
                const isDisease = rule.direction === 'Heart Disease';
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-[#e7eeea] bg-white flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <strong className="block font-mono text-[11px] text-[#1d2b31] truncate">
                        {rule.rule}
                      </strong>
                      <span className="text-[10px] text-[#75878d]">
                        Current value: {String(rule.actualValue)}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono text-xs font-bold block ${
                          isDisease ? 'text-[#d75a5a]' : 'text-[#2e9d73]'
                        }`}
                      >
                        {isDisease ? '+' : '-'}
                        {rule.weight.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-[#75878d]">
                        {isDisease ? 'supports disease' : 'protective'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e7eeea] flex items-center justify-end">
            <span className="text-xs font-bold text-[#2e9d73]">
              High Agreement with SHAP (&gt;90%)
            </span>
          </div>
        </section>
      </div>

      {/* Global Cleveland Feature Beeswarm & Dataset Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix (5 cols) */}
        <section className="card-clinical p-6 lg:col-span-5">
          <h3 className="text-base font-bold text-[#1d2b31] mb-4">
            Confusion Matrix on the 184 records
          </h3>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-4 bg-[#eaf7f0] rounded-xl border border-[#cbe4d8]">
              <span className="text-[10px] uppercase font-bold text-[#477267] block">
                True Negatives
              </span>
              <strong className="text-2xl font-black text-[#2e9d73]">67</strong>
              <span className="text-[10px] text-[#75878d] block mt-0.5">Healthy correctly identified</span>
            </div>

            <div className="p-4 bg-[#fff0f0] rounded-xl border border-[#f0caca]">
              <span className="text-[10px] uppercase font-bold text-[#bd4b4b] block">
                False Positives
              </span>
              <strong className="text-2xl font-black text-[#d75a5a]">15</strong>
              <span className="text-[10px] text-[#75878d] block mt-0.5">Type I error</span>
            </div>

            <div className="p-4 bg-[#fff0f0] rounded-xl border border-[#f0caca]">
              <span className="text-[10px] uppercase font-bold text-[#bd4b4b] block">
                False Negatives
              </span>
              <strong className="text-2xl font-black text-[#d75a5a]">9</strong>
              <span className="text-[10px] text-[#75878d] block mt-0.5">Type II error (clinical risk)</span>
            </div>

            <div className="p-4 bg-[#eaf7f0] rounded-xl border border-[#cbe4d8]">
              <span className="text-[10px] uppercase font-bold text-[#477267] block">
                True Positives
              </span>
              <strong className="text-2xl font-black text-[#2e9d73]">93</strong>
              <span className="text-[10px] text-[#75878d] block mt-0.5">Disease correctly flagged</span>
            </div>
          </div>
        </section>

        {/* Global SHAP Summary beeswarm (7 cols) */}
        <section className="card-clinical p-6 lg:col-span-7">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#1d2b31]">
              Global SHAP Feature Importance Ranking
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { name: 'ST Depression (oldpeak)', meanShap: '+0.09', width: 95 },
              { name: 'Max Heart Rate (thalch)', meanShap: '+0.06', width: 72 },
              { name: 'Chest Pain Type (cp)', meanShap: '+0.06', width: 70 },
              { name: 'Number of Vessels (ca)', meanShap: '+0.05', width: 62 },
              { name: 'Thalassemia Defect (thal)', meanShap: '+0.05', width: 58 },
              { name: 'Resting Blood Pressure (trestbps)', meanShap: '+0.04', width: 48 },
              { name: 'Exercise Angina (exang)', meanShap: '+0.04', width: 44 },
              { name: 'Age & Cholesterol', meanShap: '+0.03', width: 36 },
            ].map((f) => (
              <div key={f.name} className="flex items-center gap-3">
                <span className="w-48 text-[#1d2b31] font-semibold truncate">{f.name}</span>
                <div className="flex-1 h-3 bg-[#edf1ef] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#e5a5a5] to-[#d75a5a] rounded-full"
                    style={{ width: `${f.width}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-xs font-bold text-[#d75a5a]">
                  {f.meanShap}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
