import React, { useState, useEffect } from 'react';
import {
  Activity,
  History,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Shield,
  Heart,
  Brain,
  Sparkles,
  Info,
} from 'lucide-react';
import { ModuleCard } from './ModuleCard';
import {
  CARDIAC_CABG_PROCEDURE,
  TALUS_ARTHROTOMY_PROCEDURE,
  KIDNEY_NEPHRECTOMY_PROCEDURE,
  CRANIOFACIAL_PROCEDURE,
} from '../assessment/procedureConfig';
import { loadSessionHistory, clearSessionHistory } from '../assessment/assessment';
import { SessionSummary } from '../../shared/types';

interface DashboardViewProps {
  onStartSimulation: (procedureId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartSimulation }) => {
  const [history, setHistory] = useState<SessionSummary[]>([]);

  useEffect(() => {
    setHistory(loadSessionHistory());
  }, []);

  const handleClearHistory = () => {
    clearSessionHistory();
    setHistory([]);
  };

  return (
    <div className="space-y-10">
      {/* Hero Introduction */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-cyan-950/80 border border-cyan-800/60 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Anatomy &amp; Procedural Simulation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Scientific 3D Anatomy Exploration &amp; Surgical Guidance
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            TALUS combines authentic 3D models from scientific repositories—including the NIH Visible Human
            Project and Three.js medical reference scans—with a deterministic, rules-based assessment engine.
            Practice anatomical landmark orientation, surgical approaches, and incision corridors with real-time feedback.
          </p>
        </div>
      </section>

      {/* Anatomical Training Modules Catalog */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Anatomical Training Modules</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select an anatomical training module to enter the guided 3D practice laboratory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module 1: Cardiovascular CABG Cannulation (NIH Visible Human) */}
          <ModuleCard
            procedure={CARDIAC_CABG_PROCEDURE}
            modelStatus="verified"
            modelBadge="NIH Visible Human (CC-BY 4.0)"
            selectableStructuresInfo="8 verified coronary/aortic structures"
            onSelect={() => onStartSimulation(CARDIAC_CABG_PROCEDURE.id)}
          />

          {/* Module 2: Ankle & Talus Arthrotomy (Anatomical Layer Simulation) */}
          <ModuleCard
            procedure={TALUS_ARTHROTOMY_PROCEDURE}
            modelStatus="verified"
            modelBadge="Anatomical Layer Simulation"
            selectableStructuresInfo="3 surgical layers &amp; talus dome"
            onSelect={() => onStartSimulation(TALUS_ARTHROTOMY_PROCEDURE.id)}
          />

          {/* Module 3: Renal Hilum & Partial Nephrectomy (Preliminary Model) */}
          <ModuleCard
            procedure={KIDNEY_NEPHRECTOMY_PROCEDURE}
            modelStatus="preliminary"
            modelBadge="Asset Segmentation Required"
            selectableStructuresInfo="Unsegmented parenchymal geometry"
            onSelect={() => onStartSimulation(KIDNEY_NEPHRECTOMY_PROCEDURE.id)}
          />

          {/* Module 4: Craniofacial Approach (Three.js 3D Scan) */}
          <ModuleCard
            procedure={CRANIOFACIAL_PROCEDURE}
            modelStatus="verified"
            modelBadge="Three.js Reference Scan (CC-BY 3.0)"
            selectableStructuresInfo="1 unified craniofacial scan"
            onSelect={() => onStartSimulation(CRANIOFACIAL_PROCEDURE.id)}
          />
        </div>
      </section>

      {/* Local Practice Attempt Records */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Local Attempt Records (localStorage)</span>
          </h2>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No completed attempts recorded yet. Launch an anatomical module above to begin your first surgical practice session!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 rounded-l-lg">Timestamp</th>
                  <th className="py-2.5 px-4">Anatomical Module</th>
                  <th className="py-2.5 px-4">Score</th>
                  <th className="py-2.5 px-4">Checkpoints</th>
                  <th className="py-2.5 px-4">Errors</th>
                  <th className="py-2.5 px-4 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {history.map((record) => (
                  <tr key={record.sessionId} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(record.completedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{record.procedureTitle}</td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {record.result.score}%
                    </td>
                    <td className="py-3 px-4">
                      {record.result.completedCheckpointIds.length}/{record.result.totalCheckpoints}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-mono">
                      {record.result.errorCount}
                    </td>
                    <td className="py-3 px-4">
                      {record.result.passed ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASSED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <XCircle className="w-3 h-3" />
                          <span>NEEDS PRACTICE</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Asset Provenance & Licensing Reference */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Scientific Asset Provenance &amp; Licensing</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-rose-400 font-bold block flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5" />
              <span>NIH Visible Human Heart</span>
            </span>
            <span className="text-slate-400 text-[11px] mt-1 block">
              HuBMAP 3D Reference Library &bull; CC-BY 4.0. Contains 49 segmented meshes including ascending aorta, aortic arch, and LAD.
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold block flex items-center space-x-1">
              <Brain className="w-3.5 h-3.5" />
              <span>Craniofacial Scan</span>
            </span>
            <span className="text-slate-400 text-[11px] mt-1 block">
              Lee Perry-Smith 3D scan &bull; CC-BY 3.0. Single surface mesh for craniofacial and temporal neurosurgical approaches.
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-cyan-400 font-bold block flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>NIH Visible Human Pelvis</span>
            </span>
            <span className="text-slate-400 text-[11px] mt-1 block">
              NIH Visible Human Male &bull; CC-BY 4.0. Pelvic girdle, sacrum, coccyx, ilium, and palpable ASIS landmark.
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-purple-400 font-bold block flex items-center space-x-1">
              <Info className="w-3.5 h-3.5" />
              <span>Kidney Model (Preliminary)</span>
            </span>
            <span className="text-slate-400 text-[11px] mt-1 block">
              Human-Organ3D &bull; CC-BY 4.0. Unsegmented meshes. Requires clinical vessel separation before procedure practice.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
