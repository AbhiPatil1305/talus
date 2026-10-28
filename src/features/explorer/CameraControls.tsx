import React from 'react';
import {
  RotateCcw,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Target,
  Tag,
  Expand,
  Minimize,
} from 'lucide-react';
import { CameraPreset } from '../../shared/cameraUtils';

interface CameraControlsProps {
  onSetPreset: (preset: CameraPreset) => void;
  onFitModel: () => void;
  onFocusSelected: () => void;
  hasSelectedStructure: boolean;
  showLabels: boolean;
  onToggleLabels: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onSetPreset,
  onFitModel,
  onFocusSelected,
  hasSelectedStructure,
  showLabels,
  onToggleLabels,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl text-xs select-none">
      {/* Fit Model (Prominent Action) */}
      <button
        onClick={onFitModel}
        className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-950/40 transition-all hover:scale-102"
        title="Fit entire model in viewport"
      >
        <Maximize className="w-3.5 h-3.5" />
        <span>Fit Model</span>
      </button>

      {/* Focus Selected Structure (Active when a structure is selected) */}
      <button
        onClick={onFocusSelected}
        disabled={!hasSelectedStructure}
        className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-all ${
          hasSelectedStructure
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
            : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
        }`}
        title={hasSelectedStructure ? 'Zoom into selected anatomical structure' : 'Select a structure to focus'}
      >
        <Target className="w-3.5 h-3.5" />
        <span>Focus Selected</span>
      </button>

      <div className="h-5 w-px bg-slate-700/80 mx-1 hidden sm:block" />

      {/* Viewpoint Presets Dropdown/Buttons */}
      <div className="flex items-center space-x-1">
        <span className="text-[10px] font-bold text-slate-400 px-1 hidden md:flex items-center space-x-1 uppercase tracking-wider">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>Angles:</span>
        </span>

        <button
          onClick={() => onSetPreset('anterior')}
          className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
          title="Anterior (Frontal Coronal View)"
        >
          <ArrowDown className="w-3 h-3 text-cyan-400" />
          <span>Ant</span>
        </button>

        <button
          onClick={() => onSetPreset('posterior')}
          className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
          title="Posterior (Dorsal Coronal View)"
        >
          <ArrowUp className="w-3 h-3 text-cyan-400" />
          <span>Post</span>
        </button>

        <button
          onClick={() => onSetPreset('lateral-left')}
          className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
          title="Lateral Left (Sagittal View)"
        >
          <ArrowLeft className="w-3 h-3 text-cyan-400" />
          <span>Left</span>
        </button>

        <button
          onClick={() => onSetPreset('lateral-right')}
          className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
          title="Lateral Right (Sagittal View)"
        >
          <ArrowRight className="w-3 h-3 text-cyan-400" />
          <span>Right</span>
        </button>

        <button
          onClick={() => onSetPreset('superior')}
          className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center space-x-1"
          title="Superior (Axial Transverse View)"
        >
          <span>Top</span>
        </button>

        <button
          onClick={() => onSetPreset('reset')}
          className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
          title="Isometric 3D Perspective"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>Reset</span>
        </button>
      </div>

      <div className="h-5 w-px bg-slate-700/80 mx-1" />

      {/* 3D Label Toggle */}
      <button
        onClick={onToggleLabels}
        className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
          showLabels
            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title="Toggle 3D anatomical labels"
      >
        <Tag className="w-3 h-3" />
        <span className="hidden sm:inline">Labels</span>
      </button>

      {/* Fullscreen Toggle */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-1"
          title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
};
