import React from 'react';
import {
  BookOpen,
  Activity,
  Sparkles,
  Eye,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AnatomicalStructure } from '../../shared/types';

interface InfoPanelProps {
  structure: AnatomicalStructure | null;
  isIsolated: boolean;
  onToggleIsolate: () => void;
  onShowAll: () => void;
  onLaunchProcedure: (procedureId: string) => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  structure,
  isIsolated,
  onToggleIsolate,
  onShowAll,
  onLaunchProcedure,
}) => {
  if (!structure) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center text-xs text-slate-400 min-h-[220px]">
        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-white text-sm mb-1">Select an Anatomical Structure</h4>
        <p className="max-w-md text-slate-400 text-xs">
          Click any 3D anatomical organ or skeletal structure directly in the scene, or select from the searchable structures list on the left to inspect its scientific description, physiological function, and surgical clinical relevance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {structure.system} &bull; {structure.category}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Mesh: {structure.meshName}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{structure.name}</h2>
          <span className="text-xs italic text-cyan-300 font-serif">
            {structure.latinName}
          </span>
        </div>

        {/* Visibility / Isolation Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleIsolate}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isIsolated
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {isIsolated ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Isolating (Active)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Isolate Structure</span>
              </>
            )}
          </button>

          <button
            onClick={onShowAll}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Show All</span>
          </button>
        </div>
      </div>

      {/* Anatomy Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Description */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <span className="text-cyan-400 font-bold flex items-center space-x-1.5 uppercase text-[10px] tracking-wider mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Morphology &amp; Anatomy</span>
          </span>
          <p className="text-slate-300 leading-relaxed text-xs">
            {structure.description}
          </p>
        </div>

        {/* Function */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <span className="text-emerald-400 font-bold flex items-center space-x-1.5 uppercase text-[10px] tracking-wider mb-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Physiological Function</span>
          </span>
          <p className="text-slate-300 leading-relaxed text-xs">
            {structure.function}
          </p>
        </div>

        {/* Clinical Relevance */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <span className="text-amber-400 font-bold flex items-center space-x-1.5 uppercase text-[10px] tracking-wider mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Surgical &amp; Clinical Relevance</span>
          </span>
          <p className="text-slate-300 leading-relaxed text-xs">
            {structure.clinicalRelevance}
          </p>
        </div>
      </div>

      {/* Direct Transition to Surgical Practice CTA */}
      {structure.surgicalProcedureId && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-800/50 rounded-xl">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Associated Surgical Training Module Available
              </span>
              <span className="text-[11px] text-slate-400">
                Ready to practice incision trajectory and landmark registration on this structure?
              </span>
            </div>
          </div>

          <button
            onClick={() => onLaunchProcedure(structure.surgicalProcedureId!)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-950/40 transition-all hover:scale-102"
          >
            <span>Practice Procedure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
