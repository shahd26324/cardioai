export type ClinicalState = 'stable' | 'watch' | 'alert';

export interface ClevelandFeatures {
  age: number; // in years
  sex: 'Male' | 'Female';
  cp: 'typical angina' | 'atypical angina' | 'non-anginal' | 'asymptomatic';
  trestbps: number; // resting blood pressure (mmHg)
  chol: number; // serum cholesterol (mg/dl)
  fbs: 'False' | 'True'; // fasting blood sugar > 120 mg/dl
  restecg: 'normal' | 'st-t abnormality' | 'lv hypertrophy';
  thalch: number; // maximum heart rate achieved
  exang: 'False' | 'True'; // exercise induced angina
  oldpeak: number; // ST depression induced by exercise relative to rest
  slope: 'upsloping' | 'flat' | 'downsloping';
  ca: number; // number of major vessels (0-3) colored by flouroscopy
  thal: 'normal' | 'fixed defect' | 'reversable defect';
}

export interface SHAPContribution {
  feature: string;
  label: string;
  value: string | number;
  shapValue: number; // positive = pushes risk towards heart disease, negative = lowers risk
  percentage: number; // absolute relative weight (0 - 100)
  isPositive: boolean; // true = risk factor, false = protective factor
}

export interface LIMERule {
  rule: string;
  weight: number; // weight in local linear surrogate
  direction: 'Heart Disease' | 'No Disease';
  feature: string;
  actualValue: string | number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female';
  condition: 'Heart Disease' | 'No Heart Disease'; // Ground truth clinical diagnosis from dataset
  target: 0 | 1;
  hr: number; // bpm (heart rate)
  rr: number; // /min (respiratory rate)
  spo2: number; // %
  bp: [number, number]; // systolic, diastolic
  risk: number; // 0 - 100 CV risk score
  state: ClinicalState;
  concordance: 'True Positive' | 'True Negative' | 'False Positive' | 'False Negative';
  seed: number;
  updatedAt: number;
  features: ClevelandFeatures;
  missingFeatures?: string[];
  predictionStatus?: 'valid' | 'missing_features';
  shapExplanation: {
    baseValue: number;
    patientRisk: number;
    contributions: SHAPContribution[];
  };
  limeExplanation: {
    predictedClass: 'Heart Disease' | 'No Heart Disease';
    probabilityHeartDisease: number;
    probabilityNoDisease: number;
    rules: LIMERule[];
  };
}

export interface KafkaMessage {
  id: string;
  topic: string;
  partition: number;
  offset: number;
  timestamp: string;
  patientId: string;
  patientName: string;
  payload: {
    hr: number;
    trestbps: number;
    chol: number;
    thalch: number;
    oldpeak: number;
    spo2: number;
    risk: number;
  };
  eventType: 'TELEMETRY' | 'ANOMALY_SPIKE' | 'PATIENT_ENROLLED';
}
