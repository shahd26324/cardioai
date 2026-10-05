import React, { useState } from 'react';
import { Patient } from '../types/cardiac';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  FileText
} from 'lucide-react';

interface ClinicalReportModalProps {
  patient: Patient | null;
  onClose: () => void;
}

// Helper to extract technical model features into clinical explanations
function getHumanExplanation(patient: Patient) {
  const f = patient.features;
  const riskFactors: { title: string; explanation: string; clinicalSignificance: string }[] = [];

  // Chest Pain
  if (f.cp === 'asymptomatic') {
    riskFactors.push({
      title: 'Silent Myocardial Ischemia (Asymptomatic Presentation)',
      explanation: 'The patient does not report classic chest pain despite objective ischemic signs.',
      clinicalSignificance: 'Silent ischemia carries high clinical risk because treatment is often delayed.'
    });
  } else if (f.cp === 'typical angina') {
    riskFactors.push({
      title: 'Typical Anginal Chest Pain',
      explanation: 'Exertional substernal chest pressure with classical cardiac features.',
      clinicalSignificance: 'Strongly correlated with underlying coronary insufficiency and compromised perfusion.'
    });
  }

  // ST Depression (oldpeak)
  if (f.oldpeak >= 2.0) {
    riskFactors.push({
      title: `Severe ST-Segment Depression (${f.oldpeak} mm)`,
      explanation: 'Marked horizontal or downsloping ST-segment depression recorded during cardiac stress.',
      clinicalSignificance: 'Indicates severe subendocardial ischemia across the left ventricular myocardium.'
    });
  } else if (f.oldpeak >= 1.0) {
    riskFactors.push({
      title: `Moderate ST-Segment Depression (${f.oldpeak} mm)`,
      explanation: 'Noticeable ST depression above normal physiological baseline.',
      clinicalSignificance: 'Suggests exertional ischemia requiring correlation with coronary anatomy.'
    });
  }

  // Major Vessels (ca)
  if (f.ca >= 2) {
    riskFactors.push({
      title: `Multivessel Coronary Disease (${f.ca} major vessels occluded)`,
      explanation: 'Fluoroscopy shows contrast impairment in multiple primary coronary vessels.',
      clinicalSignificance: 'Indicates diffuse atherosclerosis with elevated risk of major adverse cardiac events.'
    });
  } else if (f.ca === 1) {
    riskFactors.push({
      title: 'Single-Vessel Coronary Stenosis (1 major vessel occluded)',
      explanation: 'Arterial fluoroscopy reveals narrowing in one primary coronary artery.',
      clinicalSignificance: 'Consistent with focal coronary artery disease.'
    });
  }

  // Max Heart Rate (thalch)
  if (f.thalch < 130) {
    riskFactors.push({
      title: `Impaired Maximum Heart Rate (${f.thalch} bpm)`,
      explanation: 'Patient failed to achieve target age-predicted heart rate under exertion.',
      clinicalSignificance: 'Chronotropic incompetence is an established clinical marker for ischemic heart disease.'
    });
  }

  // Exercise Angina
  if (f.exang === 'True') {
    riskFactors.push({
      title: 'Exercise-Induced Angina Confirmed',
      explanation: 'Cardiac workload reliably reproduces ischemic symptoms.',
      clinicalSignificance: 'Confirms that myocardial oxygen demand exceeds coronary blood flow capacity.'
    });
  }

  // Thalassemia
  if (f.thal === 'reversable defect') {
    riskFactors.push({
      title: 'Reversible Thallium Perfusion Defect',
      explanation: 'Nuclear scan shows ischemia during stress that normalizes at rest.',
      clinicalSignificance: 'Strong hallmark of salvageable, ischemic but viable myocardium.'
    });
  } else if (f.thal === 'fixed defect') {
    riskFactors.push({
      title: 'Fixed Perfusion Defect',
      explanation: 'Non-reversible defect indicative of prior myocardial infarction or scar tissue.',
      clinicalSignificance: 'Indicates pre-existing myocardial injury.'
    });
  }

  return {
    riskFactors,
  };
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({ patient, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!patient) return null;

  const human = getHumanExplanation(patient);

  const handleCopy = () => {
    const text = `
INTERPRETABLE CLINICAL CARDIAC REPORT
=================================================
Patient ID: ${patient.id}
Age / Sex: ${patient.age} years / ${patient.features.sex}
Clinical Diagnosis: ${patient.condition} (Holdout Target: ${patient.target})
Model Risk Score: ${patient.risk}% (${patient.limeExplanation.predictedClass})

OBSERVED VITALS:
- Resting Heart Rate: ${patient.hr} bpm
- Respiratory Rate: ${patient.rr} breaths/min
- Blood Pressure: ${patient.bp[0]}/${patient.bp[1]} mmHg
- SpO2: ${patient.spo2}%
- Serum Cholesterol: ${patient.features.chol} mg/dL
- ST Depression: ${patient.features.oldpeak} mm

PRIMARY DISEASE DRIVERS:
${human.riskFactors.map((r, i) => `${i + 1}. ${r.title}\n   Observation: ${r.explanation}\n   Clinical Significance: ${r.clinicalSignificance}`).join('\n')}

RECOMMENDATIONS:
${patient.risk >= 60 ? '1. Immediate 12-lead ECG and cardiology consult.\n2. Consider urgent coronary angiography / catheterization evaluation.\n3. Continuous telemetry monitoring.' : patient.risk >= 35 ? '1. Cardiology outpatient follow-up.\n2. Serial cardiac enzyme check and stress echocardiogram.' : '1. Routine outpatient follow-up.\n2. Standard lifestyle and cardiovascular risk factor maintenance.'}
=================================================
Generated via Pulseboard Cardio AI
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white text-black rounded-2xl border border-neutral-300 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-neutral-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black flex items-center justify-center border border-neutral-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Diagnostic Decision Support
                </span>
                <h3 className="text-xl font-bold text-black tracking-tight font-mono">
                  Interpretable Clinical Report: Patient {patient.id}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 flex items-center justify-center transition-colors"
              aria-label="Close report"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Patient Overview Strip (Black and White) */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6 text-black">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Patient Identifier
              </span>
              <strong className="text-sm font-bold text-black font-mono">{patient.id}</strong>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Age / Biological Sex
              </span>
              <strong className="text-sm font-bold text-black">
                {patient.age} yrs · {patient.features.sex}
              </strong>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Clinical Diagnosis
              </span>
              <strong className="text-sm font-bold text-black">
                {patient.condition}
              </strong>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Model Risk Assessment
              </span>
              <strong className="text-sm font-bold text-black tabular-nums">
                {patient.missingFeatures && patient.missingFeatures.length > 0
                  ? 'Unable to predict due to missing clinical features'
                  : `${patient.risk}% · ${patient.state.toUpperCase()}`}
              </strong>
            </div>
          </div>

          {/* Vitals Summary (Black and White) */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
              Current Patient Vitals
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                <span className="block text-[10px] text-neutral-500">Heart Rate</span>
                <strong className="text-base font-bold text-black">{patient.hr}</strong>{' '}
                <small className="text-neutral-500">bpm</small>
              </div>
              <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                <span className="block text-[10px] text-neutral-500">Resp. Rate</span>
                <strong className="text-base font-bold text-black">{patient.rr}</strong>{' '}
                <small className="text-neutral-500">/min</small>
              </div>
              <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                <span className="block text-[10px] text-neutral-500">Blood Pressure</span>
                <strong className="text-base font-bold text-black">{patient.bp[0]}/{patient.bp[1]}</strong>{' '}
                <small className="text-neutral-500">mmHg</small>
              </div>
              <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                <span className="block text-[10px] text-neutral-500">SpO₂</span>
                <strong className="text-base font-bold text-black">{patient.spo2}</strong>{' '}
                <small className="text-neutral-500">%</small>
              </div>
              <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                <span className="block text-[10px] text-neutral-500">Cholesterol</span>
                <strong className="text-base font-bold text-black">{patient.features.chol}</strong>{' '}
                <small className="text-neutral-500">mg/dL</small>
              </div>
            </div>
          </div>

          {/* Primary Disease Drivers (Black and White, No Colors, No Symbols) */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
              Primary Disease Drivers
            </h4>

            <div className="space-y-2.5">
              {human.riskFactors.map((factor, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-neutral-200 bg-white text-xs">
                  <div className="font-bold text-black mb-1">
                    {idx + 1}. {factor.title}
                  </div>
                  <p className="text-neutral-800 mb-1">
                    <strong>Observation:</strong> {factor.explanation}
                  </p>
                  <p className="text-neutral-600 text-[11px]">
                    <strong>Clinical Significance:</strong> {factor.clinicalSignificance}
                  </p>
                </div>
              ))}

              {human.riskFactors.length === 0 && (
                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-700">
                  No acute ischemic risk factors detected.
                </div>
              )}
            </div>
          </div>

          {/* Recommendations (Black and White, Replaces Physician Action Plan, No Symbols) */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-xs">
            <strong className="block text-black font-bold mb-2">
              Recommendations
            </strong>
            <ol className="list-decimal list-inside space-y-1.5 text-neutral-800 text-xs">
              {patient.risk >= 60 ? (
                <>
                  <li>Immediate 12-lead electrocardiogram (ECG) to confirm ST-segment status.</li>
                  <li>Inpatient cardiology evaluation and coronary catheterization consideration.</li>
                  <li>Serial troponin and cardiac enzyme assessment.</li>
                  <li>Continuous telemetry monitoring with alert threshold for tachycardia or ST deviation.</li>
                </>
              ) : patient.risk >= 35 ? (
                <>
                  <li>Cardiology consultation within 24 to 48 hours for diagnostic stress testing.</li>
                  <li>Optimization of blood pressure and lipid management therapy.</li>
                  <li>Patient education regarding warning symptoms (dyspnea, exertional pressure).</li>
                </>
              ) : (
                <>
                  <li>Maintain current preventive therapy and routine cardiovascular risk screening.</li>
                  <li>Annual lipid panel and standard vital sign monitoring.</li>
                </>
              )}
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-200 mt-6">
          <span className="text-[11px] text-neutral-500">
            Certified interpretable clinical report
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-100 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
