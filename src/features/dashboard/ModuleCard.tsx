import React from 'react';
import { Clock, Target, Award, ArrowRight } from 'lucide-react';
import { ProcedureConfig } from '../../shared/types';

interface ModuleCardProps {
  procedure: ProcedureConfig;
  onSelect: (procedureId: string) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ procedure, onSelect }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 shadow-xl group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
            {procedure.category}
          </span>
          <span className="text-xs font-medium text-slate-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>~{procedure.estimatedMinutes} min</span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
          {procedure.title}
        </h3>

        <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
          {procedure.learningObjective}
        </p>

        {/* Checkpoint list preview */}
        <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            {procedure.checkpoints.length} Sequential Checkpoints:
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

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
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
          className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-900/20 transition-all group-hover:translate-x-1"
        >
          <span>Launch Module</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
