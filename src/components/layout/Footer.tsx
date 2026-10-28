import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-6 mt-auto text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-400">TALUS Platform</span>
          <span>•</span>
          <span>Hackathon MVP Build (Local Browser Engine)</span>
        </div>
        <div className="text-slate-500 text-center sm:text-right">
          Deterministic Rule-Based Assessment Engine • Three.js Simulation • MediaPipe Vision POC
        </div>
      </div>
    </footer>
  );
};
