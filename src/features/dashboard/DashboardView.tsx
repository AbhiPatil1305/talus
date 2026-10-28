import React, { useState, useEffect } from 'react';
import {
  Activity,
  History,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Users,
  Compass,
} from 'lucide-react';
import { ModuleCard } from './ModuleCard';
import { BASIC_INCISION_PROCEDURE } from '../assessment/procedureConfig';
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
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Psychomotor Surgical Skills Practice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Standardized Surgical Skills Training, Directly in the Browser.
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            TALUS combines interactive real-time 3D instrument simulation with deterministic,
            rule-based event validation. Practice precision incision tracking, respect tissue
            boundaries, and receive instant rubric feedback—powered entirely on client devices with
            optional webcam hand tracking.
          </p>
        </div>
      </section>

      {/* Training Module Catalog */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Available Practice Modules</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a module to launch the interactive 3D practice laboratory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModuleCard
            procedure={BASIC_INCISION_PROCEDURE}
            onSelect={() => onStartSimulation(BASIC_INCISION_PROCEDURE.id)}
          />

          {/* Module 2 Stretch/Preview Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl p-6 flex flex-col justify-between opacity-70">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-slate-800 text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-md uppercase">
                  Advanced Stretch Module
                </span>
                <span className="text-xs text-slate-500">Coming Soon</span>
              </div>
              <h3 className="text-lg font-bold text-slate-300">
                Laparoscopic Grasp & Transfer Protocol
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Dual-instrument coordinate handoff with 6-DOF target ring positioning and bilateral
                pinch kinematics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/40 flex justify-between items-center text-xs text-slate-500">
              <span>Rubric v2026.2 (Planned)</span>
              <button disabled className="px-3.5 py-1.5 bg-slate-800/50 text-slate-500 rounded-lg cursor-not-allowed">
                Planned
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Local Practice Attempt History */}
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
            No completed attempts recorded yet. Launch Module 1 above to begin your first practice session!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 rounded-l-lg">Timestamp</th>
                  <th className="py-2.5 px-4">Module</th>
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

      {/* Team Architecture & Ownership Reference */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Hackathon Team Workstream Modular Structure</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-cyan-400 font-bold block">Member 1 — Frontend & Lead</span>
            <span className="text-slate-400 text-[11px] mt-1 block">
              App shell, navigation, dashboard, design system, integration.
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-cyan-400 font-bold block">Member 2 — 3D Simulation</span>
            <span className="text-slate-400 text-[11px] mt-1 block">
              Three.js scene, virtual instrument cursor, targets, event triggers.
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-cyan-400 font-bold block">Member 3 — Computer Vision</span>
            <span className="text-slate-400 text-[11px] mt-1 block">
              MediaPipe Hand Landmarker, pinch heuristic, mouse fallback contract.
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-cyan-400 font-bold block">Member 4 — Assessment</span>
            <span className="text-slate-400 text-[11px] mt-1 block">
              Checkpoints, deterministic scoring, pure validation, localStorage.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
