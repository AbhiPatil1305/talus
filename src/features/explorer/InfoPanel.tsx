import React from 'react';
import {
  BookOpen,
  Activity,
  Sparkles,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Minimize2,
  Target,
  PanelRightClose,
} from 'lucide-react';
import { AnatomicalStructure } from '../../shared/types';

interface InfoPanelProps {
  structure: AnatomicalStructure | null;
  isIsolated: boolean;
  isHidden?: boolean;
  onToggleIsolate: () => void;
  onShowAll: () => void;
  onToggleVisibility?: () => void;
  onFocusStructure?: () => void;
  onLaunchProcedure: (procedureId: string) => void;
  onCollapse?: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  structure,
  isIsolated,
  isHidden = false,
  onToggleIsolate,
  onShowAll,
  onToggleVisibility,
  onFocusStructure,
  onLaunchProcedure,
  onCollapse,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full shadow-2xl space-y-4 select-none overflow-y-auto">
      {/* Inspector Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Structure Inspector
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {structure ? 'Verified TA2 Taxonomy' : 'No selection'}
            </span>
          </div>
        </div>

        {onCollapse && (
          <button
            onClick={onCollapse}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Collapse Inspector"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {!structure ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-xs text-slate-400">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 mb-3">
            <Target className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-xs mb-1">No Structure Selected</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
            Click any anatomical mesh directly in the 3D viewport, or pick an item from the left hierarchy tree to inspect verified morphology and surgical landmarks.
          </p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {/* Main Title & Latin Nomenclature */}
          <div>
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {structure.system}
              </span>
              <span className="text-[10px] font-mono text-slate-500 truncate">
                Node: {structure.meshName}
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight leading-snug">
              {structure.name}
            </h2>
            <span className="text-xs italic text-cyan-300 font-serif block mt-0.5">
              {structure.latinName}
            </span>
          </div>

          {/* Quick Action Buttons (Focus, Isolate, Hide, Show All) */}
          <div className="grid grid-cols-2 gap-1.5">
            {onFocusStructure && (
              <button
                onClick={onFocusStructure}
                className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 shadow-sm transition-colors"
                title="Zoom into this structure"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Focus</span>
              </button>
            )}

            <button
              onClick={onToggleIsolate}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors ${
                isIsolated
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Dim other structures"
            >
              {isIsolated ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Isolating</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Isolate</span>
                </>
              )}
            </button>

            {onToggleVisibility && (
              <button
                onClick={onToggleVisibility}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 border border-slate-700 transition-colors"
                title={isHidden ? 'Show Structure' : 'Hide Structure'}
              >
                {isHidden ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Show</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hide</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onShowAll}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 border border-slate-700 transition-colors"
              title="Restore visibility of all structures"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Show All</span>
            </button>
          </div>

          {/* Morphology Description */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-cyan-400 font-bold flex items-center space-x-1 uppercase text-[10px] tracking-wider mb-1">
              <BookOpen className="w-3 h-3" />
              <span>Morphology &amp; Anatomy</span>
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {structure.description}
            </p>
          </div>

          {/* Physiological Function */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-emerald-400 font-bold flex items-center space-x-1 uppercase text-[10px] tracking-wider mb-1">
              <Activity className="w-3 h-3" />
              <span>Physiological Function</span>
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {structure.function}
            </p>
          </div>

          {/* Surgical & Clinical Relevance */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-amber-400 font-bold flex items-center space-x-1 uppercase text-[10px] tracking-wider mb-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Clinical &amp; Surgical Relevance</span>
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {structure.clinicalRelevance}
            </p>
          </div>

          {/* Practice Procedure CTA */}
          {structure.surgicalProcedureId && (
            <div className="p-3 bg-gradient-to-r from-cyan-950/70 to-slate-900 border border-cyan-800/60 rounded-xl space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-bold text-white leading-tight">
                  Surgical Training Available
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">
                Practice landmark registration and incision trajectory on this structure in the operating theatre.
              </p>
              <button
                onClick={() => onLaunchProcedure(structure.surgicalProcedureId!)}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Practice Procedure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
