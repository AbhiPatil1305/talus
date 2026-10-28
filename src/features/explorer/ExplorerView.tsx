import React, { useState } from 'react';
import { StructureList } from './StructureList';
import { AnatomyCanvas } from './AnatomyCanvas';
import { InfoPanel } from './InfoPanel';
import { CameraPreset } from './CameraControls';
import { AnatomicalStructure, AnatomicalSystem } from '../../shared/types';
import { ANATOMICAL_STRUCTURES } from './anatomyMetadata';
import { Compass, Shield } from 'lucide-react';

interface ExplorerViewProps {
  onLaunchProcedure: (procedureId: string) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({ onLaunchProcedure }) => {
  const [activeSystem, setActiveSystem] = useState<AnatomicalSystem>('all');
  const [selectedStructure, setSelectedStructure] = useState<AnatomicalStructure | null>(
    ANATOMICAL_STRUCTURES[0] // Default to Ascending Aorta
  );
  const [hoveredMeshName, setHoveredMeshName] = useState<string | null>(null);
  const [hiddenMeshNames, setHiddenMeshNames] = useState<Set<string>>(new Set());
  const [isIsolated, setIsIsolated] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);

  // Active GLB model: derived from selected structure or system
  const activeModelUrl = selectedStructure?.modelUrl || '/models/human_heart_nih.glb';

  // Compute model scale
  const modelScale = activeModelUrl.includes('heart')
    ? 0.05
    : activeModelUrl.includes('pelvis')
    ? 0.045
    : activeModelUrl.includes('lung')
    ? 0.04
    : 0.035;

  const handleSelectStructure = (structure: AnatomicalStructure | null) => {
    setSelectedStructure(structure);
    if (structure) {
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
    // Auto-select first structure of that system
    const firstOfSystem = ANATOMICAL_STRUCTURES.find((s) => s.system === system);
    if (firstOfSystem) {
      setSelectedStructure(firstOfSystem);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Attribution Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>TALUS 3D Human Anatomy Explorer &bull; Scientifically Verified Models</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Interactive Human Anatomical Reference Atlas
          </h1>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Source: NIH Visible Human Male &bull; Open CC-BY 4.0</span>
        </div>
      </div>

      {/* Main Explorer Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Searchable Structure Directory (4 cols) */}
        <div className="lg:col-span-4">
          <StructureList
            selectedStructure={selectedStructure}
            hiddenMeshNames={hiddenMeshNames}
            onSelectStructure={handleSelectStructure}
            onToggleMeshVisibility={handleToggleMeshVisibility}
            activeSystem={activeSystem}
            onSelectSystem={handleSelectSystem}
          />
        </div>

        {/* Right Column: 3D Canvas (8 cols) */}
        <div className="lg:col-span-8">
          <AnatomyCanvas
            modelUrl={activeModelUrl}
            selectedStructure={selectedStructure}
            hoveredMeshName={hoveredMeshName}
            hiddenMeshNames={hiddenMeshNames}
            isIsolated={isIsolated}
            cameraPreset={cameraPreset}
            onSelectStructure={handleSelectStructure}
            onHoverMesh={setHoveredMeshName}
            onSetCameraPreset={setCameraPreset}
            onClearCameraPreset={() => setCameraPreset(null)}
            scale={modelScale}
          />
        </div>
      </div>

      {/* Bottom Panel: Comprehensive Clinical Info & Procedure CTA */}
      <InfoPanel
        structure={selectedStructure}
        isIsolated={isIsolated}
        onToggleIsolate={handleToggleIsolate}
        onShowAll={handleShowAll}
        onLaunchProcedure={onLaunchProcedure}
      />
    </div>
  );
};
