import React, { useState } from 'react';
import { Patient, ClevelandFeatures } from '../types/cardiac';
import { predictPatientCardiacRisk, checkMissingClinicalFeatures } from '../services/cardioModel';
import { 
  UserPlus, 
  Search, 
  FileText, 
  Eye, 
  Sparkles, 
  X, 
  Check,
  AlertCircle
} from 'lucide-react';

interface PatientListViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onGenerateReport: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  patients,
  onSelectPatient,
  onGenerateReport,
  onAddPatient,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'disease' | 'no_disease'>('all');
  const [formError, setFormError] = useState<string | null>(null);

  // Form State for Adding New Patient (Strictly Holdout ID, no names)
  const [formData, setFormData] = useState<{
    id: string;
    age: number | string;
    sex: 'Male' | 'Female';
    condition: 'Heart Disease' | 'No Heart Disease';
    hr: number | string;
    rr: number | string;
    spo2: number | string;
    bpSystolic: number | string;
    bpDiastolic: number | string;
    cp: ClevelandFeatures['cp'];
    trestbps: number | string;
    chol: number | string;
    fbs: ClevelandFeatures['fbs'];
    restecg: ClevelandFeatures['restecg'];
    thalch: number | string;
    exang: ClevelandFeatures['exang'];
    oldpeak: number | string;
    slope: ClevelandFeatures['slope'];
    ca: number | string;
    thal: ClevelandFeatures['thal'];
  }>({
    id: `P-${String(patients.length + 1).padStart(3, '0')}`,
    age: 63,
    sex: 'Female',
    condition: 'Heart Disease',
    hr: 88,
    rr: 20,
    spo2: 95,
    bpSystolic: 145,
    bpDiastolic: 88,
    cp: 'asymptomatic',
    trestbps: 145,
    chol: 260,
    fbs: 'False',
    restecg: 'normal',
    thalch: 132,
    exang: 'True',
    oldpeak: 2.1,
    slope: 'flat',
    ca: 1,
    thal: 'reversable defect',
  });

  const isFieldMissing = (val: any) =>
    val === '' || val === undefined || val === null || (typeof val === 'number' && isNaN(val));

  const missingCheck = checkMissingClinicalFeatures(
    {
      chol: formData.chol,
      trestbps: formData.trestbps,
      thalch: formData.thalch,
      oldpeak: formData.oldpeak,
      age: formData.age,
      cp: formData.cp,
    },
    {
      hr: formData.hr,
      rr: formData.rr,
    }
  );

  const previewFeatures: ClevelandFeatures = {
    age: Number(formData.age) || 0,
    sex: formData.sex,
    cp: formData.cp,
    trestbps: Number(formData.trestbps) || 0,
    chol: Number(formData.chol) || 0,
    fbs: formData.fbs,
    restecg: formData.restecg,
    thalch: Number(formData.thalch) || 0,
    exang: formData.exang,
    oldpeak: Number(formData.oldpeak) || 0,
    slope: formData.slope,
    ca: Number(formData.ca) || 0,
    thal: formData.thal,
  };

  const previewPrediction = !missingCheck.isMissing
    ? predictPatientCardiacRisk(previewFeatures)
    : null;

  const applyPreset = (preset: 'high' | 'moderate' | 'low') => {
    if (preset === 'high') {
      setFormData({
        id: `P-${String(patients.length + 1).padStart(3, '0')}`,
        age: 68,
        sex: 'Male',
        condition: 'Heart Disease',
        hr: 114,
        rr: 24,
        spo2: 93,
        bpSystolic: 165,
        bpDiastolic: 98,
        cp: 'asymptomatic',
        trestbps: 165,
        chol: 295,
        fbs: 'True',
        restecg: 'st-t abnormality',
        thalch: 112,
        exang: 'True',
        oldpeak: 3.4,
        slope: 'downsloping',
        ca: 2,
        thal: 'reversable defect',
      });
    } else if (preset === 'moderate') {
      setFormData({
        id: `P-${String(patients.length + 1).padStart(3, '0')}`,
        age: 56,
        sex: 'Female',
        condition: 'Heart Disease',
        hr: 82,
        rr: 18,
        spo2: 96,
        bpSystolic: 138,
        bpDiastolic: 86,
        cp: 'atypical angina',
        trestbps: 138,
        chol: 242,
        fbs: 'False',
        restecg: 'normal',
        thalch: 144,
        exang: 'False',
        oldpeak: 1.4,
        slope: 'flat',
        ca: 1,
        thal: 'fixed defect',
      });
    } else {
      setFormData({
        id: `P-${String(patients.length + 1).padStart(3, '0')}`,
        age: 44,
        sex: 'Male',
        condition: 'No Heart Disease',
        hr: 68,
        rr: 14,
        spo2: 99,
        bpSystolic: 118,
        bpDiastolic: 76,
        cp: 'non-anginal',
        trestbps: 118,
        chol: 190,
        fbs: 'False',
        restecg: 'normal',
        thalch: 172,
        exang: 'False',
        oldpeak: 0.2,
        slope: 'upsloping',
        ca: 0,
        thal: 'normal',
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (missingCheck.isMissing) {
      setFormError(
        `Unable to predict due to missing clinical features: Please provide ${missingCheck.missingFields.join(', ')} (e.g., Cholesterol).`
      );
      return;
    }

    setFormError(null);
    const patientId = formData.id.trim() || `P-${String(patients.length + 1).padStart(3, '0')}`;
    const prediction = predictPatientCardiacRisk(previewFeatures);

    const isGroundTruthPositive = formData.condition === 'Heart Disease';
    const isModelPositive = prediction.riskScore >= 50;
    let concordance: Patient['concordance'] = 'True Positive';
    if (isGroundTruthPositive && isModelPositive) concordance = 'True Positive';
    else if (!isGroundTruthPositive && !isModelPositive) concordance = 'True Negative';
    else if (!isGroundTruthPositive && isModelPositive) concordance = 'False Positive';
    else concordance = 'False Negative';

    const newPatient: Patient = {
      id: patientId,
      name: patientId,
      age: Number(formData.age),
      sex: formData.sex,
      condition: formData.condition,
      target: formData.condition === 'Heart Disease' ? 1 : 0,
      hr: Number(formData.hr),
      rr: Number(formData.rr),
      spo2: Number(formData.spo2),
      bp: [Number(formData.bpSystolic), Number(formData.bpDiastolic)],
      risk: prediction.riskScore,
      state: prediction.state,
      concordance,
      seed: Math.floor(Math.random() * 50),
      updatedAt: Date.now(),
      features: previewFeatures,
      shapExplanation: prediction.shapExplanation,
      limeExplanation: prediction.limeExplanation,
    };

    onAddPatient(newPatient);
    setIsAddModalOpen(false);
    onSelectPatient(newPatient);
  };

  // Filter list
  const filteredPatients = patients.filter((p) => {
    if (selectedFilter === 'disease' && p.condition !== 'Heart Disease') return false;
    if (selectedFilter === 'no_disease' && p.condition !== 'No Heart Disease') return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return p.id.toLowerCase().includes(term) || p.condition.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6 page-transition w-full">
      {/* Title strictly simplified: Patient List */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1d2b31] tracking-tight">
            Patient List
          </h2>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2e9d73] hover:bg-[#227b5a] text-white text-xs font-bold rounded-xl shadow-xs transition-all transform active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-[#e7eeea] rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#75878d]" />
          <input
            type="text"
            placeholder="Search by patient ID (e.g. P-001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#f5f9f6] border border-transparent focus:border-[#2e9d73] rounded-lg text-[#1d2b31] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[#75878d] font-semibold text-[11px] mr-1 hidden md:inline">Filter Condition:</span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
              selectedFilter === 'all'
                ? 'bg-[#2e9d73] text-white'
                : 'bg-[#f5f9f6] text-[#75878d] hover:text-[#1d2b31]'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setSelectedFilter('disease')}
            className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
              selectedFilter === 'disease'
                ? 'bg-[#d75a5a] text-white'
                : 'bg-[#f5f9f6] text-[#75878d] hover:text-[#1d2b31]'
            }`}
          >
            Heart Disease ({patients.filter((p) => p.condition === 'Heart Disease').length})
          </button>
          <button
            onClick={() => setSelectedFilter('no_disease')}
            className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
              selectedFilter === 'no_disease'
                ? 'bg-[#227b5a] text-white'
                : 'bg-[#f5f9f6] text-[#75878d] hover:text-[#1d2b31]'
            }`}
          >
            No Heart Disease ({patients.filter((p) => p.condition === 'No Heart Disease').length})
          </button>
        </div>
      </div>

      {/* Patient Table (No names, strictly IDs) */}
      <div className="card-clinical overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f5f9f6] text-[#75878d] border-b border-[#e7eeea] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4">Diagnostic Concordance</th>
                <th className="py-3 px-4">Vitals (HR &amp; RR)</th>
                <th className="py-3 px-4">Primary SHAP Driver</th>
                <th className="py-3 px-4">Top LIME Rule</th>
                <th className="py-3 px-4 text-right">Interpretable Clinical Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7eeea] text-[#1d2b31]">
              {filteredPatients.map((patient) => {
                const isDisease = patient.condition === 'Heart Disease';
                const topShap = patient.shapExplanation.contributions[0];
                const topLime = patient.limeExplanation.rules[0];
                const isConcordant = patient.concordance.startsWith('True');

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-[#f9fcf9] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            isDisease
                              ? 'bg-[#fff0f0] text-[#c45656]'
                              : 'bg-[#e5f3ed] text-[#477267]'
                          }`}
                        >
                          {patient.id}
                        </div>
                        <div>
                          <strong className="block font-bold text-xs text-[#1d2b31] font-mono">
                            {patient.id}
                          </strong>
                          <span className="text-[11px] text-[#75878d]">
                            {patient.age} yrs · {patient.sex}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                          isDisease
                            ? 'bg-[#fff0f0] text-[#d75a5a] border border-[#f0caca]'
                            : 'bg-[#eaf7f0] text-[#227b5a] border border-[#c4e6d4]'
                        }`}
                      >
                        {patient.condition}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                          isConcordant
                            ? 'bg-[#eaf7f0] text-[#227b5a] border border-[#c4e6d4]'
                            : 'bg-[#fff0f0] text-[#d75a5a] border border-[#f0caca]'
                        }`}
                        title="Proves that the Random Forest model and explainability scores match the ground truth clinical diagnosis"
                      >
                        {isConcordant ? '✓' : '⚠'} {patient.concordance}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>
                        <span className="font-semibold text-[#1d2b31]">{patient.hr}</span> bpm ·{' '}
                        <span className="font-semibold text-[#227b5a]">{patient.rr}/min RR</span>
                      </div>
                      <div className="text-[10px] text-[#75878d]">
                        <span>{patient.bp[0]}/{patient.bp[1]} mmHg</span> ·{' '}
                        <span>{patient.spo2}% SpO₂</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {topShap ? (
                        <div className="text-[11px]">
                          <span className="font-semibold text-[#1d2b31]">{topShap.label}</span>
                          <span
                            className={`ml-1.5 font-mono text-[10px] font-bold ${
                              topShap.isPositive ? 'text-[#d75a5a]' : 'text-[#2e9d73]'
                            }`}
                          >
                            {topShap.isPositive ? '+' : ''}
                            {topShap.shapValue}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#75878d]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {topLime ? (
                        <span className="text-[11px] text-[#75878d] truncate max-w-[200px] block" title={topLime.rule}>
                          {topLime.rule}
                        </span>
                      ) : (
                        <span className="text-[#75878d]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onGenerateReport(patient)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#2e9d73] hover:bg-[#227b5a] rounded-lg transition-colors shadow-xs"
                          title="Generate comprehensive interpretable clinical report"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Generate Clinical Report</span>
                        </button>

                        <button
                          onClick={() => onSelectPatient(patient)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#75878d] hover:text-[#1d2b31] hover:bg-[#f5f9f6] border border-[#e7eeea] rounded-lg transition-colors"
                          title="View SHAP & LIME deep dive"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Explain</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal (Strictly Patient ID, no names) */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-[#e7eeea] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#e7eeea] mb-6">
              <div>
                <h3 className="text-lg font-black text-[#1d2b31]">
                  Add Patient &amp; Record 13 Features
                </h3>
                <p className="text-xs text-[#75878d]">
                  Record clinical predictors and immediately generate individual SHAP and LIME scores.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-[#e7eeea] text-[#75878d] hover:text-[#d75a5a] hover:bg-[#fff0f0] flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mb-6 p-3 bg-[#f5f9f6] rounded-xl border border-[#e7eeea] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#1d2b31] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2e9d73]" />
                <span>Fill with clinical scenario preset:</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    applyPreset('high');
                    setFormError(null);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#f0caca] text-[#bd4b4b] hover:bg-[#fff0f0] rounded-lg transition-colors"
                >
                  High Risk Case
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applyPreset('moderate');
                    setFormError(null);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#eadfcb] text-[#a36e1e] hover:bg-[#fff6e5] rounded-lg transition-colors"
                >
                  Moderate Case
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applyPreset('low');
                    setFormError(null);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#c4e6d4] text-[#227b5a] hover:bg-[#eaf7f0] rounded-lg transition-colors"
                >
                  Low Risk Case
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applyPreset('moderate');
                    setFormData((prev) => ({ ...prev, chol: '' }));
                    setFormError(null);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#f0caca] text-[#bd4b4b] hover:bg-[#fff0f0] rounded-lg transition-colors flex items-center gap-1.5"
                  title="Simulate missing cholesterol example"
                >
                  <AlertCircle className="w-3 h-3 text-[#d75a5a]" />
                  <span>Missing Cholesterol Example</span>
                </button>
              </div>
            </div>

            {/* Missing Clinical Features Global Alert Banner */}
            {missingCheck.isMissing ? (
              <div className="mb-6 p-4 rounded-xl border-2 border-[#d75a5a] bg-[#fff5f5] text-xs animate-in fade-in duration-150">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#d75a5a] shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <h5 className="font-extrabold text-sm text-[#b03535] tracking-tight">
                      Unable to predict due to missing clinical features
                    </h5>
                    <p className="text-[#802a2a] text-xs leading-relaxed">
                      Random Forest prediction and explainability cannot execute until all required features and vitals are provided. 
                      Currently missing: <strong className="underline ml-1">{missingCheck.missingFields.join(', ')}</strong>.
                    </p>
                    {isFieldMissing(formData.chol) && (
                      <div className="mt-2 text-[11px] font-semibold text-[#8a2424] bg-white p-2.5 rounded-lg border border-[#f0caca] flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider text-[9px] bg-[#ffe0e0] px-1.5 py-0.5 rounded text-[#942727]">
                          Cholesterol Example
                        </span>
                        <span>
                          <strong>Serum Cholesterol (chol)</strong> is omitted. Please enter a value (e.g. 240 mg/dL) to enable risk calculation.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-3 bg-[#f0faf4] rounded-xl border border-[#c4e6d4] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#227b5a] font-bold">
                  <Check className="w-4 h-4" />
                  <span>All clinical features recorded · Model inference ready</span>
                </div>
                <span className="font-mono font-bold text-[#227b5a] bg-white px-2.5 py-1 rounded-md border border-[#c4e6d4]">
                  Estimated Risk: {previewPrediction ? `${previewPrediction.riskScore}%` : '—'}
                </span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Demographics & Clinical Condition */}
              <div>
                <h4 className="text-xs font-bold text-[#75878d] uppercase tracking-wider mb-3">
                  1. Patient ID &amp; Condition
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1">
                      Patient ID (e.g. P-011) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.id}
                      onChange={(e) => {
                        setFormData({ ...formData, id: e.target.value });
                        setFormError(null);
                      }}
                      className="w-full h-9 px-3 text-xs bg-[#fbfdfb] border border-[#e7eeea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1 flex items-center justify-between">
                      <span>Age *</span>
                      {isFieldMissing(formData.age) && (
                        <span className="text-[10px] font-bold text-[#d75a5a]">Missing</span>
                      )}
                    </label>
                    <input
                      type="number"
                      required
                      min={18}
                      max={110}
                      value={formData.age}
                      onChange={(e) => {
                        setFormData({ ...formData, age: e.target.value === '' ? '' : Number(e.target.value) });
                        setFormError(null);
                      }}
                      className={`w-full h-9 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
                        isFieldMissing(formData.age)
                          ? 'border-2 border-[#d75a5a] bg-[#fff5f5] text-[#9c2b2b]'
                          : 'bg-[#fbfdfb] border border-[#e7eeea] focus:ring-2 focus:ring-[#2e9d73]/30'
                      }`}
                    />
                    {isFieldMissing(formData.age) && (
                      <span className="text-[10px] font-bold text-[#d75a5a] block mt-1">
                        Unable to predict due to missing clinical features
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1">Sex *</label>
                    <select
                      value={formData.sex}
                      onChange={(e) => {
                        setFormData({ ...formData, sex: e.target.value as any });
                        setFormError(null);
                      }}
                      className="w-full h-9 px-3 text-xs bg-[#fbfdfb] border border-[#e7eeea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1">
                      Clinical Condition (Diagnosis) *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => {
                        setFormData({ ...formData, condition: e.target.value as any });
                        setFormError(null);
                      }}
                      className="w-full h-9 px-3 text-xs bg-[#fbfdfb] border border-[#e7eeea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30 font-semibold"
                    >
                      <option value="Heart Disease">Heart Disease (Target: 1)</option>
                      <option value="No Heart Disease">No Heart Disease (Target: 0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1 flex items-center justify-between">
                      <span>Heart Rate (bpm) *</span>
                      {isFieldMissing(formData.hr) && (
                        <span className="text-[10px] font-bold text-[#d75a5a]">Missing</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={220}
                      value={formData.hr}
                      placeholder="e.g. 75 bpm"
                      onChange={(e) => {
                        setFormData({ ...formData, hr: e.target.value === '' ? '' : Number(e.target.value) });
                        setFormError(null);
                      }}
                      className={`w-full h-9 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
                        isFieldMissing(formData.hr)
                          ? 'border-2 border-[#d75a5a] bg-[#fff5f5] text-[#9c2b2b]'
                          : 'bg-[#fbfdfb] border border-[#e7eeea] focus:ring-2 focus:ring-[#2e9d73]/30'
                      }`}
                    />
                    {isFieldMissing(formData.hr) && (
                      <span className="text-[10px] font-bold text-[#d75a5a] block mt-1">
                        Unable to predict due to missing clinical features
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1 flex items-center justify-between">
                      <span>Resp. Rate (/min) *</span>
                      {isFieldMissing(formData.rr) && (
                        <span className="text-[10px] font-bold text-[#d75a5a]">Missing</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={8}
                      max={45}
                      value={formData.rr}
                      placeholder="e.g. 16 /min"
                      onChange={(e) => {
                        setFormData({ ...formData, rr: e.target.value === '' ? '' : Number(e.target.value) });
                        setFormError(null);
                      }}
                      className={`w-full h-9 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
                        isFieldMissing(formData.rr)
                          ? 'border-2 border-[#d75a5a] bg-[#fff5f5] text-[#9c2b2b]'
                          : 'bg-[#fbfdfb] border border-[#e7eeea] focus:ring-2 focus:ring-[#2e9d73]/30 font-semibold text-[#227b5a]'
                      }`}
                    />
                    {isFieldMissing(formData.rr) && (
                      <span className="text-[10px] font-bold text-[#d75a5a] block mt-1">
                        Unable to predict due to missing clinical features
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1">SpO₂ (%)</label>
                    <input
                      type="number"
                      min={70}
                      max={100}
                      value={formData.spo2}
                      onChange={(e) => {
                        setFormData({ ...formData, spo2: e.target.value === '' ? '' : Number(e.target.value) });
                        setFormError(null);
                      }}
                      className="w-full h-9 px-3 text-xs bg-[#fbfdfb] border border-[#e7eeea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30"
                    />
                  </div>
                </div>
              </div>

              {/* 13 Cleveland Features */}
              <div>
                <h4 className="text-xs font-bold text-[#75878d] uppercase tracking-wider mb-3">
                  2. 13 Cleveland Dataset Clinical Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1">
                      Chest Pain Type (cp) *
                    </label>
                    <select
                      value={formData.cp}
                      onChange={(e) => {
                        setFormData({ ...formData, cp: e.target.value as any });
                        setFormError(null);
                      }}
                      className="w-full h-9 px-3 text-xs bg-[#fbfdfb] border border-[#e7eeea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30"
                    >
                      <option value="asymptomatic">asymptomatic</option>
                      <option value="atypical angina">atypical angina</option>
                      <option value="non-anginal">non-anginal</option>
                      <option value="typical angina">typical angina</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1 flex items-center justify-between">
                      <span>Resting BP (trestbps) *</span>
                      {isFieldMissing(formData.trestbps) && (
                        <span className="text-[10px] font-bold text-[#d75a5a]">Missing</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={80}
                      max={240}
                      value={formData.trestbps}
                      placeholder="e.g. 130 mmHg"
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setFormData({ ...formData, trestbps: val, bpSystolic: val });
                        setFormError(null);
                      }}
                      className={`w-full h-9 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
                        isFieldMissing(formData.trestbps)
                          ? 'border-2 border-[#d75a5a] bg-[#fff5f5] text-[#9c2b2b]'
                          : 'bg-[#fbfdfb] border border-[#e7eeea] focus:ring-2 focus:ring-[#2e9d73]/30'
                      }`}
                    />
                    {isFieldMissing(formData.trestbps) && (
                      <span className="text-[10px] font-bold text-[#d75a5a] block mt-1">
                        Unable to predict due to missing clinical features
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-[#75878d]">
                        Serum Cholesterol (chol) *
                      </label>
                      {isFieldMissing(formData.chol) && (
                        <span className="text-[10px] font-bold text-[#d75a5a]">
                          Missing Field
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={100}
                      max={580}
                      value={formData.chol}
                      placeholder="e.g. 240 mg/dL"
                      onChange={(e) => {
                        setFormData({ ...formData, chol: e.target.value === '' ? '' : Number(e.target.value) });
                        setFormError(null);
                      }}
                      className={`w-full h-9 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
                        isFieldMissing(formData.chol)
                          ? 'border-2 border-[#d75a5a] bg-[#fff5f5] text-[#9c2b2b]'
                          : 'bg-[#fbfdfb] border border-[#e7eeea] focus:ring-2 focus:ring-[#2e9d73]/30'
                      }`}
                    />
                    {isFieldMissing(formData.chol) && (
                      <span className="text-[10px] font-bold text-[#d75a5a] block mt-1">
                        Unable to predict due to missing clinical features (Cholesterol required)
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1 flex items-center justify-between">
                      <span>Max Heart Rate (thalch) *</span>
                      {isFieldMissing(formData.thalch) && (
                        <span className="text-[10px] font-bold text-[#d75a5a]">Missing</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={60}
                      max={220}
                      value={formData.thalch}
                      placeholder="e.g. 150 bpm"
                      onChange={(e) => {
                        setFormData({ ...formData, thalch: e.target.value === '' ? '' : Number(e.target.value) });
                        setFormError(null);
                      }}
                      className={`w-full h-9 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
                        isFieldMissing(formData.thalch)
                          ? 'border-2 border-[#d75a5a] bg-[#fff5f5] text-[#9c2b2b]'
                          : 'bg-[#fbfdfb] border border-[#e7eeea] focus:ring-2 focus:ring-[#2e9d73]/30'
                      }`}
                    />
                    {isFieldMissing(formData.thalch) && (
                      <span className="text-[10px] font-bold text-[#d75a5a] block mt-1">
                        Unable to predict due to missing clinical features
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1 flex items-center justify-between">
                      <span>ST Depression (oldpeak · mm) *</span>
                      {isFieldMissing(formData.oldpeak) && (
                        <span className="text-[10px] font-bold text-[#d75a5a]">Missing</span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={6.5}
                      value={formData.oldpeak}
                      placeholder="e.g. 1.2 mm"
                      onChange={(e) => {
                        setFormData({ ...formData, oldpeak: e.target.value === '' ? '' : Number(e.target.value) });
                        setFormError(null);
                      }}
                      className={`w-full h-9 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
                        isFieldMissing(formData.oldpeak)
                          ? 'border-2 border-[#d75a5a] bg-[#fff5f5] text-[#9c2b2b]'
                          : 'bg-[#fbfdfb] border border-[#e7eeea] focus:ring-2 focus:ring-[#2e9d73]/30'
                      }`}
                    />
                    {isFieldMissing(formData.oldpeak) && (
                      <span className="text-[10px] font-bold text-[#d75a5a] block mt-1">
                        Unable to predict due to missing clinical features
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1">
                      Vessel Count (ca: 0 to 3)
                    </label>
                    <select
                      value={formData.ca}
                      onChange={(e) => {
                        setFormData({ ...formData, ca: Number(e.target.value) });
                        setFormError(null);
                      }}
                      className="w-full h-9 px-3 text-xs bg-[#fbfdfb] border border-[#e7eeea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30"
                    >
                      <option value={0}>0 vessels</option>
                      <option value={1}>1 vessel</option>
                      <option value={2}>2 vessels</option>
                      <option value={3}>3 vessels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1">
                      Exercise Angina (exang)
                    </label>
                    <select
                      value={formData.exang}
                      onChange={(e) => {
                        setFormData({ ...formData, exang: e.target.value as any });
                        setFormError(null);
                      }}
                      className="w-full h-9 px-3 text-xs bg-[#fbfdfb] border border-[#e7eeea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30"
                    >
                      <option value="False">No</option>
                      <option value="True">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1">
                      ST Slope
                    </label>
                    <select
                      value={formData.slope}
                      onChange={(e) => {
                        setFormData({ ...formData, slope: e.target.value as any });
                        setFormError(null);
                      }}
                      className="w-full h-9 px-3 text-xs bg-[#fbfdfb] border border-[#e7eeea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30"
                    >
                      <option value="upsloping">upsloping</option>
                      <option value="flat">flat</option>
                      <option value="downsloping">downsloping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#75878d] mb-1">
                      Thalassemia (thal)
                    </label>
                    <select
                      value={formData.thal}
                      onChange={(e) => {
                        setFormData({ ...formData, thal: e.target.value as any });
                        setFormError(null);
                      }}
                      className="w-full h-9 px-3 text-xs bg-[#fbfdfb] border border-[#e7eeea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e9d73]/30"
                    >
                      <option value="normal">Normal</option>
                      <option value="fixed defect">Fixed Defect</option>
                      <option value="reversable defect">Reversable Defect</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Error Banner if triggered on submit */}
              {formError && (
                <div className="p-3 bg-[#fff0f0] border border-[#f0caca] rounded-xl text-xs text-[#9c2b2b] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#d75a5a] shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e7eeea]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#e7eeea] rounded-xl text-xs font-bold text-[#75878d] hover:bg-[#f5f9f6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={missingCheck.isMissing}
                  className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                    missingCheck.isMissing
                      ? 'bg-[#c46868] hover:bg-[#ad5757] cursor-not-allowed opacity-90'
                      : 'bg-[#2e9d73] hover:bg-[#227b5a] active:scale-95'
                  }`}
                  title={missingCheck.isMissing ? missingCheck.errorMessage : 'Add Patient & Calculate Scores'}
                >
                  {missingCheck.isMissing ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  <span>
                    {missingCheck.isMissing
                      ? 'Unable to predict due to missing clinical features'
                      : 'Add Patient & Calculate Scores'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
