import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Instrument } from './Instrument';
import { Targets } from './Target';
import {
  NormalizedInput,
  SimulationEvent,
  ProcedureConfig,
} from '../../shared/types';
import { globalInputAdapter } from '../hand-tracking/InputAdapter';

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

  // Determine current active checkpoint
  const currentCheckpointIndex = completedCheckpointIds.length;
  const currentCheckpoint = procedure.checkpoints[currentCheckpointIndex] || null;

  // Track whether instrument is currently hovering within tolerance of active target
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

    // Convert normalized input [-1, 1] to world [X, Z]
    const instrumentWorldX = currentInput.x * 3.5;
    const instrumentWorldZ = -currentInput.y * 2.5;

    const [tx, , tz] = currentCheckpoint.targetPosition;
    const dx = instrumentWorldX - tx;
    const dz = instrumentWorldZ - tz;
    const distance = Math.sqrt(dx * dx + dz * dz);

    const withinTolerance = distance <= currentCheckpoint.toleranceRadius;
    setIsHovering(withinTolerance);

    if (withinTolerance) {
      // Check required action
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
      className="relative w-full h-[520px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 select-none cursor-crosshair"
    >
      <Canvas
        camera={{ position: [0, 4.5, 4.0], fov: 48 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <directionalLight position={[-5, 8, -3]} intensity={0.5} />

        {/* Surgical Practice Pad (Silicone Block) */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[7.2, 0.2, 5.2]} />
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* Practice Tissue Incision Area (Soft Derm / Epidermis Simulation Base) */}
        <mesh position={[0, 0.055, 0]}>
          <boxGeometry args={[5.2, 0.02, 2.2]} />
          <meshStandardMaterial
            color="#fecdd3"
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>

        {/* Incision Line and Targets */}
        <Targets
          checkpoints={procedure.checkpoints}
          completedIds={completedCheckpointIds}
          currentCheckpointId={currentCheckpoint?.id || null}
        />

        {/* Virtual Instrument Cursor */}
        <Instrument input={currentInput} isHoveringTarget={isHovering} />
      </Canvas>

      {/* Real-time Status Overlay within 3D Canvas */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-700/60 text-xs">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              currentInput.isSelecting ? 'bg-emerald-400' : 'bg-cyan-400'
            }`}
          />
          <span className="font-mono text-slate-300 uppercase tracking-wide">
            Input: {currentInput.source} {currentInput.isSelecting ? '(ENGAGED)' : '(IDLE)'}
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-slate-400">
          Pos: [{currentInput.x.toFixed(2)}, {currentInput.y.toFixed(2)}]
        </span>
      </div>

      {/* Target Guidance Banner */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-between items-center bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-lg border border-slate-700/60">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold block">
            {currentCheckpoint
              ? `Step ${currentCheckpoint.order}: ${currentCheckpoint.title}`
              : 'All Checkpoints Completed!'}
          </span>
          <p className="text-sm text-slate-300 mt-0.5">
            {currentCheckpoint
              ? currentCheckpoint.description
              : 'Proceed to review deterministic performance report.'}
          </p>
        </div>
        <div className="text-right pl-4">
          <span className="text-xs font-mono text-slate-400">
            Progress: {completedCheckpointIds.length}/{procedure.checkpoints.length}
          </span>
        </div>
      </div>
    </div>
  );
};
