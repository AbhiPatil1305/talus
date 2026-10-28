import React, { useState } from 'react';
import { StructureList } from './StructureList';
import { AnatomyCanvas } from './AnatomyCanvas';
import { InfoPanel } from './InfoPanel';
import { AnatomicalStructure, AnatomicalSystem } from '../../shared/types';
import {
  ANATOMICAL_STRUCTURES,
  AVAILABLE_MODELS,
  AvailableModel,
} from './anatomyMetadata';
import {
  Compass,
  Shield,
  PanelLeft,
  PanelRight,
  Layers,
} from 'lucide-react';

interface ExplorerViewProps {
  onLaunchProcedure: (procedureId: string) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({ onLaunchProcedure }) => {
  const [selectedModel, setSelectedModel] = useState<AvailableModel>(AVAILABLE_MODELS[0]);
  const [activeSystem, setActiveSystem] = useState<AnatomicalSystem>('all');
  const [selectedStructure, setSelectedStructure] = useState<AnatomicalStructure | null>(
    ANATOMICAL_STRUCTURES[0] // Default to Ascending Aorta
  );
  const [hoveredMeshName, setHoveredMeshName] = useState<string | null>(null);
  const [hiddenMeshNames, setHiddenMeshNames] = useState<Set<string>>(new Set());
  const [isIsolated, setIsIsolated] = useState(false);

  // Collapsible Sidebars State
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const handleSelectModel = (model: AvailableModel) => {
    setSelectedModel(model);
    setActiveSystem(model.system);
    // Find first structure belonging to this model
    const firstOfModel = ANATOMICAL_STRUCTURES.find((s) => s.modelUrl === model.url);
    setSelectedStructure(firstOfModel || null);
    setHiddenMeshNames(new Set());
    setIsIsolated(false);
  };

  const handleSelectStructure = (structure: AnatomicalStructure | null) => {
    setSelectedStructure(structure);
    if (structure) {
      // Auto-switch model if structure belongs to another model
      const matchingModel = AVAILABLE_MODELS.find((m) => m.url === structure.modelUrl);
      if (matchingModel && matchingModel.url !== selectedModel.url) {
        setSelectedModel(matchingModel);
      }
      // If the structure is currently hidden, unhide it
      if (hiddenMeshNames.has(structure.meshName)) {
        setHiddenMeshNames((prev) => {
          const next = new Set(prev);
          next.delete(structure.meshName);
          return next;
        });
      }
    }
  };

  const handleToggleMeshVisibility = (meshName: string) => {
    setHiddenMeshNames((prev) => {
      const next = new Set(prev);
      if (next.has(meshName)) {
        next.delete(meshName);
      } else {
        next.add(meshName);
      }
      return next;
    });
  };

  const handleToggleIsolate = () => {
    setIsIsolated((prev) => !prev);
  };

  const handleShowAll = () => {
    setHiddenMeshNames(new Set());
    setIsIsolated(false);
  };

  const handleSelectSystem = (system: AnatomicalSystem) => {
    setActiveSystem(system);
    if (system !== 'all') {
      const matchingModel = AVAILABLE_MODELS.find((m) => m.system === system);
      if (matchingModel) {
        setSelectedModel(matchingModel);
      }
    }
    const firstOfSystem = ANATOMICAL_STRUCTURES.find((s) => s.system === system);
    if (firstOfSystem) {
      setSelectedStructure(firstOfSystem);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Clinical Header & Model Selector Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-950/40">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Anatomy Explorer
              </h1>
              <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                3D Atlas
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive clinical reference with Terminologia Anatomica taxonomy
            </p>
          </div>
        </div>

        {/* Model Switcher & Attribution */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Organ Dropdown Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedModel.id}
              onChange={(e) => {
                const found = AVAILABLE_MODELS.find((m) => m.id === e.target.value);
                if (found) handleSelectModel(found);
              }}
              aria-label="Active Anatomical Model"
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-2"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id} className="bg-slate-900 text-white">
                  {model.name} ({model.structureCount} structures)
                </option>
              ))}
            </select>
          </div>

          {/* Scientific Verification Badge */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{selectedModel.badge}</span>
          </div>

          {/* Sidebar Toggle Buttons */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsLeftCollapsed((prev) => !prev)}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 border ${
                !isLeftCollapsed
                  ? 'bg-slate-800 border-slate-700 text-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isLeftCollapsed ? 'Show Structure Tree' : 'Hide Structure Tree'}
            >
              <PanelLeft className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px]">Tree</span>
            </button>

            <button
              onClick={() => setIsRightCollapsed((prev) => !prev)}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 border ${
                !isRightCollapsed
                  ? 'bg-slate-800 border-slate-700 text-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isRightCollapsed ? 'Show Inspector' : 'Hide Inspector'}
            >
              <PanelRight className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px]">Inspector</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Pane Medical Workspace */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-210px)] min-h-[640px] gap-4">
        {/* Left Sidebar: Structure Tree (Collapsible) */}
        {!isLeftCollapsed && (
          <div className="w-full lg:w-80 shrink-0 h-[380px] lg:h-full animate-fade-in">
            <StructureList
              selectedStructure={selectedStructure}
              hiddenMeshNames={hiddenMeshNames}
              onSelectStructure={handleSelectStructure}
              onToggleMeshVisibility={handleToggleMeshVisibility}
              activeSystem={activeSystem}
              onSelectSystem={handleSelectSystem}
              onCollapse={() => setIsLeftCollapsed(true)}
            />
          </div>
        )}

        {/* Center Viewport: Maximized 3D Model View */}
        <div className="flex-1 min-w-0 h-full relative">
          <AnatomyCanvas
            modelUrl={selectedModel.url}
            selectedStructure={selectedStructure}
            hoveredMeshName={hoveredMeshName}
            hiddenMeshNames={hiddenMeshNames}
            isIsolated={isIsolated}
            onSelectStructure={handleSelectStructure}
            onHoverMesh={setHoveredMeshName}
          />
        </div>

        {/* Right Inspector: Anatomical & Surgical Details (Collapsible) */}
        {!isRightCollapsed && (
          <div className="w-full lg:w-84 shrink-0 h-[420px] lg:h-full animate-fade-in">
            <InfoPanel
              structure={selectedStructure}
              isIsolated={isIsolated}
              isHidden={selectedStructure ? hiddenMeshNames.has(selectedStructure.meshName) : false}
              onToggleIsolate={handleToggleIsolate}
              onShowAll={handleShowAll}
              onToggleVisibility={() => {
                if (selectedStructure) handleToggleMeshVisibility(selectedStructure.meshName);
              }}
              onLaunchProcedure={onLaunchProcedure}
              onCollapse={() => setIsRightCollapsed(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
