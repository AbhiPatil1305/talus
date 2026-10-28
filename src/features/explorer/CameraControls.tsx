import React from 'react';
import { RotateCcw, Compass, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export type CameraPreset = 'anterior' | 'posterior' | 'lateral-left' | 'lateral-right' | 'superior' | 'reset';

interface CameraControlsProps {
  onSetPreset: (preset: CameraPreset) => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({ onSetPreset }) => {
  return (
    <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs space-x-1">
      <span className="text-[10px] font-bold text-slate-400 px-2 flex items-center space-x-1 uppercase tracking-wider">
        <Compass className="w-3 h-3 text-cyan-400" />
        <span className="hidden sm:inline">Viewpoint:</span>
      </span>

      <button
        onClick={() => onSetPreset('anterior')}
        className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
        title="Anterior (Frontal View)"
      >
        <ArrowDown className="w-3 h-3 text-cyan-400" />
        <span>Anterior</span>
      </button>

      <button
        onClick={() => onSetPreset('posterior')}
        className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
        title="Posterior (Dorsal View)"
      >
        <ArrowUp className="w-3 h-3 text-cyan-400" />
        <span>Posterior</span>
      </button>

      <button
        onClick={() => onSetPreset('lateral-left')}
        className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
        title="Lateral Left View"
      >
        <ArrowLeft className="w-3 h-3 text-cyan-400" />
        <span>Left</span>
      </button>

      <button
        onClick={() => onSetPreset('lateral-right')}
        className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
        title="Lateral Right View"
      >
        <ArrowRight className="w-3 h-3 text-cyan-400" />
        <span>Right</span>
      </button>

      <button
        onClick={() => onSetPreset('superior')}
        className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center space-x-1"
        title="Superior (Cranial View)"
      >
        <span>Superior</span>
      </button>

      <div className="h-4 w-px bg-slate-700/80 mx-1" />

      <button
        onClick={() => onSetPreset('reset')}
        className="px-2 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
        title="Reset Camera to default"
      >
        <RotateCcw className="w-3 h-3 text-amber-400" />
        <span>Reset</span>
      </button>
    </div>
  );
};
