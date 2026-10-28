import React from 'react';
import { Activity, LayoutDashboard, PlaySquare, Compass } from 'lucide-react';
import { ViewState } from '../../shared/types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                TALUS
              </span>
              <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                MVP Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Practice virtually. Prepare confidently.</p>
          </div>
        </div>

        {/* View Switcher Navigation */}
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('explorer')}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              currentView === 'explorer'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Anatomy Explorer</span>
          </button>

          <button
            onClick={() => onNavigate('simulation')}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              currentView === 'simulation'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            <span>Practice Lab</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
