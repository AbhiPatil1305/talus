import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Instrument } from './Instrument';
import { Targets } from './Target';
import { RealAnatomyModel, RealOrganType } from './RealAnatomyModel';
import { AnatomyLayer } from './HumanAnatomy';
import {
  NormalizedInput,
  SimulationEvent,
  ProcedureConfig,
} from '../../shared/types';
import { globalInputAdapter } from '../hand-tracking/InputAdapter';
import { Layers, Eye, Heart, Sparkles, User, Crosshair } from 'lucide-react';

interface SimulationSceneProps {
  procedure: ProcedureConfig;
  completedCheckpointIds: string[];
  onSimulationEvent: (event: SimulationEvent) => void;
  onReset: () => void;
}

export const SimulationScene: React.FC<SimulationSceneProps> = ({
  procedure,
  completedCheckpointIds,
  onSimulationEvent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentInput, setCurrentInput] = useState<NormalizedInput>(
    globalInputAdapter.getCurrentInput()
  );

  // Derive organ type from procedure ID or allow user manual override in the scene
  const defaultOrgan: RealOrganType = procedure.id.includes('cardiac')
    ? 'heart'
    : procedure.id.includes('kidney')
    ? 'kidney'
    : procedure.id.includes('craniofacial')
    ? 'head'
    : 'heart'; // default to real heart model!

  const [activeOrgan, setActiveOrgan] = useState<RealOrganType>(defaultOrgan);
  const [activeLayer, setActiveLayer] = useState<AnatomyLayer>('skin');

  // Sync active organ when procedure changes
  useEffect(() => {
    if (procedure.id.includes('cardiac')) setActiveOrgan('heart');
    else if (procedure.id.includes('kidney')) setActiveOrgan('kidney');
    else if (procedure.id.includes('craniofacial')) setActiveOrgan('head');
    else if (procedure.id.includes('talus')) setActiveOrgan('ankle');
  }, [procedure.id]);

  // Determine current active checkpoint
  const currentCheckpointIndex = completedCheckpointIds.length;
  const currentCheckpoint = procedure.checkpoints[currentCheckpointIndex] || null;

  const [isHovering, setIsHovering] = useState(false);
  const lastCompletedIdRef = useRef<string | null>(null);

  // Attach input adapter to DOM container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    globalInputAdapter.attach(el);
    const unsubscribe = globalInputAdapter.subscribe((input) => {
      setCurrentInput(input);
    });

    return () => {
      unsubscribe();
      globalInputAdapter.detach();
    };
  }, []);

  // Distance computation in 3D world coordinates
  const checkInteraction = useCallback(() => {
    if (!currentCheckpoint) return;

    // Convert normalized input [-1, 1] to world [X, Z] over operative field
    const instrumentWorldX = currentInput.x * 3.2;
    const instrumentWorldZ = -currentInput.y * 2.2;

    const [tx, , tz] = currentCheckpoint.targetPosition;
    const dx = instrumentWorldX - tx;
    const dz = instrumentWorldZ - tz;
    const distance = Math.sqrt(dx * dx + dz * dz);

    const withinTolerance = distance <= currentCheckpoint.toleranceRadius;
    setIsHovering(withinTolerance);

    if (withinTolerance) {
      let actionSatisfied = false;

      if (currentCheckpoint.requiredAction === 'position') {
        actionSatisfied = true;
      } else if (currentCheckpoint.requiredAction === 'select') {
        actionSatisfied = currentInput.isSelecting;
      } else if (currentCheckpoint.requiredAction === 'traverse') {
        actionSatisfied = currentInput.isSelecting;
      } else if (currentCheckpoint.requiredAction === 'release') {
        actionSatisfied = !currentInput.isSelecting;
      }

      if (actionSatisfied && lastCompletedIdRef.current !== currentCheckpoint.id) {
        lastCompletedIdRef.current = currentCheckpoint.id;
        onSimulationEvent({
          type: 'CHECKPOINT_COMPLETED',
          checkpointId: currentCheckpoint.id,
          timestamp: Date.now(),
        });
      }
    }
  }, [currentCheckpoint, currentInput, onSimulationEvent]);

  // Target mesh name to highlight in real 3D model
  const highlightedMeshName = useMemo(() => {
    if (!currentCheckpoint) return null;
    if (activeOrgan === 'heart') {
      if (currentCheckpoint.id.includes('AORTA')) return 'VHM_ascending_aorta';
      if (currentCheckpoint.id.includes('SVC')) return 'VHM_aortic_arch';
      if (currentCheckpoint.id.includes('LAD')) return 'VHM_left_anterior_descending_artery';
      if (currentCheckpoint.id.includes('APEX')) return 'VHM_vasculature';
    }
    return null;
  }, [currentCheckpoint, activeOrgan]);

  useEffect(() => {
    checkInteraction();
  }, [checkInteraction]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[560px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none cursor-crosshair"
    >
      <Canvas
        camera={{ position: [0, 4.8, 4.2], fov: 46 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Operating Theatre Overhead Lighting (Dual Surgical Luminaires) */}
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 12, 4]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-4, 10, -3]} intensity={1.2} color="#bae6fd" />
        <pointLight position={[0, 4, 0]} intensity={1.0} color="#ffffff" />

        {/* Real 3D Human Anatomy Models */}
        <RealAnatomyModel
          organType={activeOrgan}
          layer={activeLayer}
          highlightedMeshName={highlightedMeshName}
        />

        {/* Surgical Skin Markings and Landmark Crosshairs */}
        <Targets
          checkpoints={procedure.checkpoints}
          completedIds={completedCheckpointIds}
          currentCheckpointId={currentCheckpoint?.id || null}
        />

        {/* Photorealistic Scalpel #10 Virtual Instrument */}
        <Instrument input={currentInput} isHoveringTarget={isHovering} />
      </Canvas>


      {/* Top Controls Bar: Organ Switcher & Layer Selector */}
      <div className="absolute top-4 right-4 z-20 flex flex-col sm:flex-row items-end sm:items-center gap-2">
        {/* Real Human Organ Switcher */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-xs">
          <span className="text-[10px] font-bold text-cyan-400 px-2 flex items-center space-x-1 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Human Part:</span>
          </span>
          <button
            onClick={() => setActiveOrgan('heart')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition-all ${
              activeOrgan === 'heart'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Heart</span>
          </button>
          <button
            onClick={() => setActiveOrgan('head')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition-all ${
              activeOrgan === 'head'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Head Scan</span>
          </button>
          <button
            onClick={() => setActiveOrgan('kidney')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition-all ${
              activeOrgan === 'kidney'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>Kidney</span>
          </button>
          <button
            onClick={() => setActiveOrgan('ankle')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition-all ${
              activeOrgan === 'ankle'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Ankle &amp; Talus</span>
          </button>
        </div>

        {/* Anatomical Layer Selector (Active when viewing Ankle) */}
        {activeOrgan === 'ankle' && (
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-xs">
            <span className="text-[10px] font-semibold text-slate-400 px-2 flex items-center space-x-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Layer:</span>
            </span>
            <button
              onClick={() => setActiveLayer('skin')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                activeLayer === 'skin' ? 'bg-cyan-600 text-white' : 'text-slate-400'
              }`}
            >
              Skin
            </button>
            <button
              onClick={() => setActiveLayer('bone')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                activeLayer === 'bone' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Talus Bone
            </button>
          </div>
        )}
      </div>

      {/* Real-time Status Overlay within 3D Canvas */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center space-x-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/70 text-xs">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              currentInput.isSelecting ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400 animate-pulse'
            }`}
          />
          <span className="font-mono text-slate-300 uppercase tracking-wide">
            Model: {activeOrgan === 'heart' ? 'NIH Visible Human Heart (CC-BY 4.0)' : activeOrgan === 'head' ? 'Three.js Craniofacial Scan (CC-BY 3.0)' : activeOrgan === 'ankle' ? 'Anatomical Layer Simulation' : 'Renal Parenchyma'} &bull; {currentInput.isSelecting ? 'INCISING' : 'PROBING'}
          </span>
        </div>
      </div>

      {/* Target Guidance Banner */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-between items-center bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5" />
              <span>
                {currentCheckpoint
                  ? `Clinical Landmark ${currentCheckpoint.order}: ${currentCheckpoint.title}`
                  : 'All Landmarks Verified!'}
              </span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {currentCheckpoint
              ? currentCheckpoint.description
              : 'Anatomical exposure verified. View your deterministic assessment summary below.'}
          </p>
        </div>
        <div className="text-right pl-4 shrink-0">
          <span className="text-xs font-mono text-cyan-400 font-bold">
            {completedCheckpointIds.length}/{procedure.checkpoints.length} Landmarks
          </span>
        </div>
      </div>
    </div>
  );
};
