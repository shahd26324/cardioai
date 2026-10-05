import React from 'react';
import { KafkaMessage, Patient } from '../types/cardiac';
import { 
  Play, 
  Pause, 
  Layers, 
  Terminal, 
  Cpu
} from 'lucide-react';

interface KafkaStreamViewProps {
  messages: KafkaMessage[];
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onInjectAnomaly?: (patientId: string) => void;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const KafkaStreamView: React.FC<KafkaStreamViewProps> = ({
  messages,
  isStreaming,
  onToggleStreaming,
}) => {
  return (
    <div className="space-y-6 page-transition w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1d2b31] tracking-tight">
            IoT Patient Vital Stream
          </h2>
        </div>

        {/* Master Stream Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStreaming}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isStreaming
                ? 'bg-[#fff0f0] border border-[#f0caca] text-[#bd4b4b] hover:bg-[#ffe3e3]'
                : 'bg-[#2e9d73] text-white hover:bg-[#227b5a]'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Kafka Consumer</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Kafka Consumer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cluster Metrics Row (Clean 2-card layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <article className="card-clinical p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#75878d]">
              Kafka Topic
            </span>
            <div className="text-sm font-extrabold text-[#1d2b31] font-mono mt-0.5 truncate">
              cardiac.vitals.stream
            </div>
            <span className="text-[11px] text-[#2e9d73] font-semibold">3 partitions · rep 2</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#edf4fc] text-[#5b88c8] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </article>

        <article className="card-clinical p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#75878d]">
              Inference Throughput
            </span>
            <div className="text-xl font-extrabold text-[#1d2b31] font-mono mt-0.5">
              {isStreaming ? '142.4 msg/s' : '0.0 msg/s'}
            </div>
            <span className="text-[11px] text-[#2e9d73] font-semibold">p99 latency 1.8ms</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#eaf7f0] text-[#2e9d73] flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
        </article>
      </div>

      {/* Live Stream Terminal (Full width) */}
      <section className="card-clinical p-6 w-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2e9d73]" />
              <h3 className="text-base font-bold text-[#1d2b31]">
                Live Kafka Partition Stream Monitor
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#75878d]">
              Showing latest {messages.length} events
            </span>
          </div>

          <div className="bg-[#1a2327] rounded-xl p-4 font-mono text-xs text-[#a0b0b5] overflow-x-auto max-h-[500px] overflow-y-auto space-y-2.5">
            {messages.map((msg) => {
              const isSpike = msg.eventType === 'ANOMALY_SPIKE';
              const isEnrolled = msg.eventType === 'PATIENT_ENROLLED';

              return (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isSpike
                      ? 'bg-[#3d1a1a] border-[#7d2e2e] text-[#fca5a5]'
                      : isEnrolled
                      ? 'bg-[#18362b] border-[#227b5a] text-[#86efac]'
                      : 'bg-[#131a1d] border-[#26353b] text-[#d4dedb]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#75878d] mb-1">
                    <span className="text-[#5b88c8]">
                      topic:{msg.topic} [p{msg.partition}] offset:{msg.offset}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-white text-xs">Patient {msg.patientId}</strong>
                      <div className="text-[11px] text-[#a0b3b9] mt-0.5">
                        payload: &#123; HR:{msg.payload.hr} bpm, BP:{msg.payload.trestbps} mmHg, SpO₂:{msg.payload.spo2}%, oldpeak:{msg.payload.oldpeak}mm &#125;
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          msg.payload.risk >= 60
                            ? 'bg-[#c45656] text-white'
                            : msg.payload.risk >= 35
                            ? 'bg-[#d79630] text-white'
                            : 'bg-[#2e9d73] text-white'
                        }`}
                      >
                        Risk {msg.payload.risk}/100
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {messages.length === 0 && (
              <div className="py-8 text-center text-[#75878d]">
                Waiting for next Kafka message cycle...
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
