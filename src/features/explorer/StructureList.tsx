import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  EyeOff,
  X,
  Filter,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
} from 'lucide-react';
import { AnatomicalStructure, AnatomicalSystem } from '../../shared/types';
import { searchStructures, SYSTEM_CATEGORIES } from './anatomyMetadata';

interface StructureListProps {
  selectedStructure: AnatomicalStructure | null;
  hiddenMeshNames: Set<string>;
  onSelectStructure: (structure: AnatomicalStructure) => void;
  onToggleMeshVisibility: (meshName: string) => void;
  activeSystem: AnatomicalSystem;
  onSelectSystem: (system: AnatomicalSystem) => void;
  onCollapse?: () => void;
}

export const StructureList: React.FC<StructureListProps> = ({
  selectedStructure,
  hiddenMeshNames,
  onSelectStructure,
  onToggleMeshVisibility,
  activeSystem,
  onSelectSystem,
  onCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const filteredStructures = useMemo(() => {
    return searchStructures(searchQuery, activeSystem);
  }, [searchQuery, activeSystem]);

  // Group structures by category
  const groupedStructures = useMemo(() => {
    const groups: Record<string, AnatomicalStructure[]> = {};
    for (const struct of filteredStructures) {
      const cat = struct.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(struct);
    }
    return groups;
  }, [filteredStructures]);

  const toggleGroupCollapse = (category: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full shadow-xl select-none">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Anatomy Tree
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {filteredStructures.length} verified structures
            </span>
          </div>
        </div>

        {onCollapse && (
          <button
            onClick={onCollapse}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by English or Latin name..."
          className="w-full pl-8 pr-7 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
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

      {/* System Tabs (Compact) */}
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

      {/* Grouped Structure Tree */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {Object.keys(groupedStructures).length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No structures match "{searchQuery}"
          </div>
        ) : (
          Object.entries(groupedStructures).map(([category, structures]) => {
            const isGroupCollapsed = collapsedGroups.has(category);

            return (
              <div key={category} className="space-y-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleGroupCollapse(category)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-slate-200 py-1 px-1 rounded-md transition-colors"
                >
                  <span className="flex items-center space-x-1 uppercase tracking-wider">
                    {isGroupCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-cyan-400" />
                    )}
                    <span>{category}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">
                    {structures.length}
                  </span>
                </button>

                {/* Structure Items in Group */}
                {!isGroupCollapsed && (
                  <div className="space-y-1 pl-1">
                    {structures.map((structure) => {
                      const isSelected = selectedStructure?.id === structure.id;
                      const isHidden = hiddenMeshNames.has(structure.meshName);

                      return (
                        <div
                          key={structure.id}
                          onClick={() => onSelectStructure(structure)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-cyan-950/80 border-cyan-500/90 text-white shadow-md'
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
                          </div>

                          {/* Visibility Eye Toggle */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleMeshVisibility(structure.meshName);
                            }}
                            className={`p-1 rounded-lg border transition-colors shrink-0 ${
                              isHidden
                                ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white'
                            }`}
                            title={isHidden ? 'Show Structure' : 'Hide Structure'}
                          >
                            {isHidden ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
