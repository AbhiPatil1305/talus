import React from 'react';
import { Clock, Target, Award, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { ProcedureConfig } from '../../shared/types';

interface ModuleCardProps {
  procedure: ProcedureConfig;
  modelStatus: 'verified' | 'preliminary' | 'experimental';
  modelBadge: string;
  selectableStructuresInfo: string;
  onSelect: (procedureId: string) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  procedure,
  modelStatus,
  modelBadge,
  selectableStructuresInfo,
  onSelect,
}) => {
  const isAvailable = modelStatus === 'verified' || modelStatus === 'preliminary';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 shadow-xl group flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
            {procedure.category}
          </span>
          <span className="text-xs font-medium text-slate-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>~{procedure.estimatedMinutes} min (est.)</span>
          </span>
        </div>

        {/* Model Provenance & Structure Availability Badge */}
        <div className="flex items-center space-x-2 mb-3 text-[11px]">
          {modelStatus === 'verified' ? (
            <span className="inline-flex items-center space-x-1 text-emerald-300 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-md font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{modelBadge}</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-md font-medium">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>{modelBadge}</span>
            </span>
          )}
          <span className="text-slate-500 font-mono text-[10px]">
            &bull; {selectableStructuresInfo}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
          {procedure.title}
        </h3>

        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          {procedure.learningObjective}
        </p>

        {/* Checkpoint list preview */}
        <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            {procedure.checkpoints.length} Sequential Clinical Checkpoints:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {procedure.checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-2 text-xs text-slate-300 flex items-center space-x-2"
              >
                <div className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 font-mono text-[10px] flex items-center justify-center shrink-0">
                  {cp.order}
                </div>
                <span className="truncate">{cp.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rubric v{procedure.rubric.version}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pass: {procedure.rubric.passingScore}%</span>
          </span>
        </div>

        <button
          onClick={() => onSelect(procedure.id)}
          disabled={!isAvailable}
          className={`inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-lg transition-all ${
            isAvailable
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20 group-hover:translate-x-1'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>{isAvailable ? 'Launch Module' : 'Asset Required'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
