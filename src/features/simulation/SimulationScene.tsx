import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Instrument } from './Instrument';
import { Targets } from './Target';
import { HumanAnatomy, AnatomyLayer } from './HumanAnatomy';
import {
  NormalizedInput,
  SimulationEvent,
  ProcedureConfig,
} from '../../shared/types';
import { globalInputAdapter } from '../hand-tracking/InputAdapter';
import { Layers, Eye } from 'lucide-react';

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
  const [activeLayer, setActiveLayer] = useState<AnatomyLayer>('skin');

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

  useEffect(() => {
    checkInteraction();
  }, [checkInteraction]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[540px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none cursor-crosshair"
    >
      <Canvas
        camera={{ position: [0, 5.0, 3.8], fov: 46 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Operating Theatre Overhead Lighting (Dual Surgical Luminaires) */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 12, 4]} intensity={1.8} color="#f8fafc" />
        <directionalLight position={[-4, 10, -3]} intensity={1.0} color="#e0f2fe" />
        <pointLight position={[0, 4, 0]} intensity={0.8} color="#ffffff" />

        {/* 3D Human Lower Limb, Ankle, and Talus Bone Anatomical Model */}
        <HumanAnatomy layer={activeLayer} />

        {/* Surgical Skin Markings and Landmark Crosshairs */}
        <Targets
          checkpoints={procedure.checkpoints}
          completedIds={completedCheckpointIds}
          currentCheckpointId={currentCheckpoint?.id || null}
        />

        {/* Photorealistic Scalpel #10 Virtual Instrument */}
        <Instrument input={currentInput} isHoveringTarget={isHovering} />
      </Canvas>

      {/* Anatomical Layer Selector Toggle Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-xs">
        <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center space-x-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Anatomy Layer:</span>
        </span>
        <button
          onClick={() => setActiveLayer('skin')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            activeLayer === 'skin'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Skin & Drapes
        </button>
        <button
          onClick={() => setActiveLayer('subcutaneous')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            activeLayer === 'subcutaneous'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Subcutaneous / Retinaculum
        </button>
        <button
          onClick={() => setActiveLayer('bone')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            activeLayer === 'bone'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Talus Bone & Skeleton
        </button>
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
            Tool: Scalpel #10 &bull; {currentInput.isSelecting ? 'INCISING' : 'SURFACE ALIGN'}
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-slate-400">
          [{currentInput.x.toFixed(2)}, {currentInput.y.toFixed(2)}]
        </span>
      </div>

      {/* Target Guidance Banner */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-between items-center bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5" />
              <span>
                {currentCheckpoint
                  ? `Clinical Step ${currentCheckpoint.order}: ${currentCheckpoint.title}`
                  : 'All Anatomical Checkpoints Completed!'}
              </span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {currentCheckpoint
              ? currentCheckpoint.description
              : 'Incision verified. Proceed to the deterministic assessment performance summary.'}
          </p>
        </div>
        <div className="text-right pl-4 shrink-0">
          <span className="text-xs font-mono text-cyan-400 font-bold">
            {completedCheckpointIds.length}/{procedure.checkpoints.length} Steps
          </span>
        </div>
      </div>
    </div>
  );
};
