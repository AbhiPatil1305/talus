import React from 'react';
import {
  Award,
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ListOrdered,
} from 'lucide-react';
import { AssessmentResult, ProcedureConfig } from '../../shared/types';

interface CompletionSummaryProps {
  result: AssessmentResult;
  procedure: ProcedureConfig;
  onRetry: () => void;
  onBackToDashboard: () => void;
}

export const CompletionSummary: React.FC<CompletionSummaryProps> = ({
  result,
  procedure,
  onRetry,
  onBackToDashboard,
}) => {
  const durationSeconds = (result.durationMs / 1000).toFixed(1);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Assessment Summary • Rubric v{result.rubricVersion}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{procedure.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic, rules-based evaluation based on recorded kinematic events.
            </p>
          </div>

          {/* Big Score Gauge */}
          <div className="flex flex-col items-center justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800/80 min-w-[140px]">
            <span
              className={`text-4xl font-black font-mono tracking-tight ${
                result.passed ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {result.score}%
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
              {result.passed ? 'PASSED (≥ 70%)' : 'REQUIRES PRACTICE'}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
              <span>Checkpoints</span>
            </span>
            <span className="text-base font-bold text-white mt-1 block">
              {result.completedCheckpointIds.length} / {result.totalCheckpoints}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Invalid Actions</span>
            </span>
            <span className="text-base font-bold text-amber-400 mt-1 block">
              {result.errorCount}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Elapsed Time</span>
            </span>
            <span className="text-base font-bold text-white mt-1 block font-mono">
              {durationSeconds}s
            </span>
          </div>
        </div>
      </div>

      {/* Checkpoint Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>Step-by-Step Checkpoint Validation</span>
        </h2>
        <div className="space-y-3">
          {procedure.checkpoints.map((cp) => {
            const isCompleted = result.completedCheckpointIds.includes(cp.id);
            return (
              <div
                key={cp.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  isCompleted
                    ? 'bg-slate-950/70 border-emerald-900/40 text-slate-200'
                    : 'bg-slate-950/30 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {cp.order}
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{cp.title}</span>
                    <span className="text-[11px] text-slate-400">{cp.description}</span>
                  </div>
                </div>
                <span
                  className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                    isCompleted
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? 'VERIFIED (+25 PTS)' : 'NOT COMPLETED'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological Feedback Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Deterministic Educational Feedback Events
        </h2>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
          {result.feedback.map((fb) => (
            <div
              key={fb.id}
              className={`p-3 rounded-lg text-xs border ${
                fb.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200'
                  : fb.type === 'error'
                  ? 'bg-rose-950/30 border-rose-900/50 text-rose-200'
                  : fb.type === 'warning'
                  ? 'bg-amber-950/30 border-amber-900/50 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              {fb.message}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Practice Exercise</span>
        </button>
      </div>
    </div>
  );
};
