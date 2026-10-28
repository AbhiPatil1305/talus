import React, { useState, useMemo } from 'react';
import { Search, Eye, EyeOff, X, Filter } from 'lucide-react';
import { AnatomicalStructure, AnatomicalSystem } from '../../shared/types';
import { searchStructures, SYSTEM_CATEGORIES } from './anatomyMetadata';

interface StructureListProps {
  selectedStructure: AnatomicalStructure | null;
  hiddenMeshNames: Set<string>;
  onSelectStructure: (structure: AnatomicalStructure) => void;
  onToggleMeshVisibility: (meshName: string) => void;
  activeSystem: AnatomicalSystem;
  onSelectSystem: (system: AnatomicalSystem) => void;
}

export const StructureList: React.FC<StructureListProps> = ({
  selectedStructure,
  hiddenMeshNames,
  onSelectStructure,
  onToggleMeshVisibility,
  activeSystem,
  onSelectSystem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStructures = useMemo(() => {
    return searchStructures(searchQuery, activeSystem);
  }, [searchQuery, activeSystem]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[580px] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Anatomical Structures</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            {filteredStructures.length} verified structures
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by English or Latin name..."
          className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Anatomical System Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-2 scrollbar-none text-[11px]">
        {SYSTEM_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectSystem(cat.id)}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all flex items-center space-x-1 ${
              activeSystem === cat.id
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Structure Items List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredStructures.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No structures match "{searchQuery}"
          </div>
        ) : (
          filteredStructures.map((structure) => {
            const isSelected = selectedStructure?.id === structure.id;
            const isHidden = hiddenMeshNames.has(structure.meshName);

            return (
              <div
                key={structure.id}
                onClick={() => onSelectStructure(structure)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500/80 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className="font-semibold block truncate group-hover:text-cyan-300">
                    {structure.name}
                  </span>
                  <span className="text-[10px] text-slate-500 italic block truncate">
                    {structure.latinName}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-cyan-400/90 font-mono mt-0.5 block">
                    {structure.category}
                  </span>
                </div>

                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMeshVisibility(structure.meshName);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                    isHidden
                      ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                      : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white'
                  }`}
                  title={isHidden ? 'Show Structure' : 'Hide Structure'}
                >
                  {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
