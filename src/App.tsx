import React, { useState, useEffect, useRef } from 'react';
import { Patient, KafkaMessage } from './types/cardiac';
import { getInitialPatients } from './services/initialPatients';
import { predictPatientCardiacRisk } from './services/cardioModel';
import { Sidebar, ViewType } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { OverviewView } from './components/OverviewView';
import { LiveMonitoringView } from './components/LiveMonitoringView';
import { PatientListView } from './components/PatientListView';
import { KafkaStreamView } from './components/KafkaStreamView';
import { ExplainabilityLabView } from './components/ExplainabilityLabView';
import { PatientDetailDrawer } from './components/PatientDetailDrawer';
import { ClinicalReportModal } from './components/ClinicalReportModal';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function drift(value: number, min: number, max: number, amount = 2): number {
  return clamp(value + (Math.random() - 0.5) * amount * 2, min, max);
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [patients, setPatients] = useState<Patient[]>(() => getInitialPatients());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reportPatient, setReportPatient] = useState<Patient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [kafkaMessages, setKafkaMessages] = useState<KafkaMessage[]>([]);

  const offsetRef = useRef(184000);

  // Initialize initial Kafka messages from holdout dataset
  useEffect(() => {
    const initialMsgs: KafkaMessage[] = [
      {
        id: 'msg-init-1',
        topic: 'cardiac.vitals.stream',
        partition: 0,
        offset: offsetRef.current++,
        timestamp: new Date().toLocaleTimeString(),
        patientId: 'P-002',
        patientName: 'P-002',
        payload: {
          hr: 104,
          trestbps: 120,
          chol: 282,
          thalch: 135,
          oldpeak: 4.0,
          spo2: 94,
          risk: 86,
        },
        eventType: 'TELEMETRY',
      },
      {
        id: 'msg-init-2',
        topic: 'cardiac.vitals.stream',
        partition: 1,
        offset: offsetRef.current++,
        timestamp: new Date(Date.now() - 2400).toLocaleTimeString(),
        patientId: 'P-003',
        patientName: 'P-003',
        payload: {
          hr: 73,
          trestbps: 172,
          chol: 260,
          thalch: 73,
          oldpeak: 2.0,
          spo2: 95,
          risk: 68,
        },
        eventType: 'TELEMETRY',
      },
      {
        id: 'msg-init-3',
        topic: 'cardiac.vitals.stream',
        partition: 2,
        offset: offsetRef.current++,
        timestamp: new Date(Date.now() - 4800).toLocaleTimeString(),
        patientId: 'P-001',
        patientName: 'P-001',
        payload: {
          hr: 76,
          trestbps: 130,
          chol: 206,
          thalch: 170,
          oldpeak: 0.0,
          spo2: 97,
          risk: 32,
        },
        eventType: 'TELEMETRY',
      },
    ];
    setKafkaMessages(initialMsgs);
  }, []);

  // Apache Kafka Live Telemetry Stream Simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setPatients((prevPatients) => {
        const targetIndex = Math.floor(Math.random() * prevPatients.length);
        const p = prevPatients[targetIndex];
        if (!p) return prevPatients;

        const newHr = Math.round(drift(p.hr, 55, 120, p.state === 'alert' ? 4 : 2));
        const newSpo2 = Math.round(drift(p.spo2, 91, 99, 0.8));
        const newSys = Math.round(drift(p.bp[0], 105, 168, 2.5));
        const newDia = Math.round(drift(p.bp[1], 62, 102, 1.5));
        const newOldpeak = Number(drift(p.features.oldpeak, 0.0, 5.0, 0.1).toFixed(1));

        const updatedFeatures = {
          ...p.features,
          trestbps: newSys,
          oldpeak: newOldpeak,
        };

        const prediction = predictPatientCardiacRisk(updatedFeatures);

        const updatedPatient: Patient = {
          ...p,
          hr: newHr,
          spo2: newSpo2,
          bp: [newSys, newDia],
          risk: prediction.riskScore,
          state: prediction.state,
          updatedAt: Date.now(),
          features: updatedFeatures,
          shapExplanation: prediction.shapExplanation,
          limeExplanation: prediction.limeExplanation,
        };

        // Emit Kafka streaming message
        const newMsg: KafkaMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          topic: 'cardiac.vitals.stream',
          partition: targetIndex % 3,
          offset: offsetRef.current++,
          timestamp: new Date().toLocaleTimeString(),
          patientId: updatedPatient.id,
          patientName: updatedPatient.name,
          payload: {
            hr: newHr,
            trestbps: newSys,
            chol: updatedPatient.features.chol,
            thalch: updatedPatient.features.thalch,
            oldpeak: newOldpeak,
            spo2: newSpo2,
            risk: prediction.riskScore,
          },
          eventType: 'TELEMETRY',
        };

        setKafkaMessages((msgs) => [newMsg, ...msgs.slice(0, 49)]);

        // Sync drawer if open on this patient
        setSelectedPatient((curr) => (curr && curr.id === updatedPatient.id ? updatedPatient : curr));

        const newPatients = [...prevPatients];
        newPatients[targetIndex] = updatedPatient;
        return newPatients;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Inject Anomaly Spike via Kafka
  const handleInjectAnomaly = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const updatedFeatures = {
          ...p.features,
          trestbps: 174,
          oldpeak: 3.8,
          exang: 'True' as const,
          cp: 'asymptomatic' as const,
        };

        const prediction = predictPatientCardiacRisk(updatedFeatures);
        const spikedHr = 124;

        const updatedPatient: Patient = {
          ...p,
          hr: spikedHr,
          spo2: 92,
          bp: [174, 102],
          risk: prediction.riskScore,
          state: 'alert',
          updatedAt: Date.now(),
          features: updatedFeatures,
          shapExplanation: prediction.shapExplanation,
          limeExplanation: prediction.limeExplanation,
        };

        const anomalyMsg: KafkaMessage = {
          id: `msg-spike-${Date.now()}`,
          topic: 'cardiac.vitals.stream',
          partition: 0,
          offset: offsetRef.current++,
          timestamp: new Date().toLocaleTimeString(),
          patientId: updatedPatient.id,
          patientName: updatedPatient.name,
          payload: {
            hr: spikedHr,
            trestbps: 174,
            chol: updatedPatient.features.chol,
            thalch: updatedPatient.features.thalch,
            oldpeak: 3.8,
            spo2: 92,
            risk: prediction.riskScore,
          },
          eventType: 'ANOMALY_SPIKE',
        };

        setKafkaMessages((msgs) => [anomalyMsg, ...msgs.slice(0, 49)]);

        if (selectedPatient && selectedPatient.id === updatedPatient.id) {
          setSelectedPatient(updatedPatient);
        }

        return updatedPatient;
      })
    );
  };

  // Add Patient to active registry
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);

    const enrollMsg: KafkaMessage = {
      id: `msg-enroll-${Date.now()}`,
      topic: 'cardiac.vitals.stream',
      partition: 1,
      offset: offsetRef.current++,
      timestamp: new Date().toLocaleTimeString(),
      patientId: newPatient.id,
      patientName: newPatient.name,
      payload: {
        hr: newPatient.hr,
        trestbps: newPatient.bp[0],
        chol: newPatient.features.chol,
        thalch: newPatient.features.thalch,
        oldpeak: newPatient.features.oldpeak,
        spo2: newPatient.spo2,
        risk: newPatient.risk,
      },
      eventType: 'PATIENT_ENROLLED',
    };

    setKafkaMessages((msgs) => [enrollMsg, ...msgs.slice(0, 49)]);
  };

  const alertCount = patients.filter((p) => p.state === 'alert').length;

  return (
    <div className="flex min-h-screen w-full bg-[#f5f9f6] text-[#1d2b31]">
      {/* Sidebar Rail */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        alertCount={alertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 overflow-x-hidden">
        {/* Topbar: Greeting without Maya + Actions & Tab switcher */}
        <Topbar
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
          onOpenAddPatient={() => setIsAddModalOpen(true)}
          isStreaming={isStreaming}
          onToggleStreaming={() => setIsStreaming(!isStreaming)}
          alertCount={alertCount}
        />

        {/* View Switching */}
        {currentView === 'overview' && (
          <OverviewView
            patients={patients}
            onSelectPatient={(p) => setSelectedPatient(p)}
            onNavigate={(v) => setCurrentView(v)}
          />
        )}

        {currentView === 'monitoring' && (
          <LiveMonitoringView
            patients={patients}
            onSelectPatient={(p) => setSelectedPatient(p)}
            isStreaming={isStreaming}
          />
        )}

        {currentView === 'patients' && (
          <PatientListView
            patients={patients}
            onSelectPatient={(p) => setSelectedPatient(p)}
            onGenerateReport={(p) => setReportPatient(p)}
            onAddPatient={handleAddPatient}
            isAddModalOpen={isAddModalOpen}
            setIsAddModalOpen={setIsAddModalOpen}
          />
        )}

        {currentView === 'kafka' && (
          <KafkaStreamView
            messages={kafkaMessages}
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming(!isStreaming)}
            onInjectAnomaly={handleInjectAnomaly}
            patients={patients}
            onSelectPatient={(p) => setSelectedPatient(p)}
          />
        )}

        {currentView === 'explainability' && (
          <ExplainabilityLabView
            patients={patients}
            onSelectPatient={(p) => setSelectedPatient(p)}
          />
        )}
      </main>

      {/* Patient Detail Drawer with individual SHAP and LIME breakdown */}
      <PatientDetailDrawer
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onGenerateReport={(p) => {
          setSelectedPatient(null);
          setReportPatient(p);
        }}
      />

      {/* Interpretable Clinical Report Modal */}
      <ClinicalReportModal
        patient={reportPatient}
        onClose={() => setReportPatient(null)}
      />
    </div>
  );
}
