import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Instrument, InstrumentMode } from './Instrument';
import { StabilizerTool } from './StabilizerTool';
import { Targets } from './Target';
import { RealAnatomyModel, RealOrganType } from './RealAnatomyModel';
import { AnatomyLayer } from './HumanAnatomy';
import {
  NormalizedInput,
  SimulationEvent,
  ProcedureConfig,
  BimanualCoordinationState,
} from '../../shared/types';
import { globalInputAdapter } from '../hand-tracking/InputAdapter';
import { globalHandTracker } from '../hand-tracking/HandTracking';
import {
  Camera,
  CameraOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Crosshair,
  Hand,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import { CameraPreset } from '../../shared/cameraUtils';

interface SimulationSceneProps {
  procedure: ProcedureConfig;
  completedCheckpointIds: string[];
  onSimulationEvent: (event: SimulationEvent) => void;
  onReset: () => void;
}

/**
 * Camera preset controller inside R3F Canvas
 */
const SimulationCameraController: React.FC<{
  cameraPreset: CameraPreset | null;
  fitSignal: number;
  onHandled: () => void;
}> = ({ cameraPreset, fitSignal, onHandled }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    const persCamera = camera as THREE.PerspectiveCamera;

    if (cameraPreset === 'anterior') {
      persCamera.position.set(0, 4.5, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === 'superior') {
      persCamera.position.set(0, 5.2, 0.001);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === 'lateral-left') {
      persCamera.position.set(-4.5, 2.5, 0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === 'lateral-right') {
      persCamera.position.set(4.5, 2.5, 0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === 'reset' || fitSignal > 0) {
      persCamera.position.set(0, 3.8, 3.2);
      controlsRef.current.target.set(0, 0, 0);
    }

    persCamera.updateProjectionMatrix();
    controlsRef.current.update();
    onHandled();
  }, [cameraPreset, fitSignal, camera, onHandled]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={1.0}
      maxDistance={12.0}
    />
  );
};

export const SimulationScene: React.FC<SimulationSceneProps> = ({
  procedure,
  completedCheckpointIds,
  onSimulationEvent,
  onReset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentInput, setCurrentInput] = useState<NormalizedInput>(
    globalInputAdapter.getCurrentInput()
  );

  const [toolMode, setToolMode] = useState<InstrumentMode>('scalpel');
  const [activeLayer, setActiveLayer] = useState<AnatomyLayer>('skin');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState(globalHandTracker.status);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);
  const [fitSignal, setFitSignal] = useState(0);

  // Active Organ derived from procedure
  const activeOrgan: RealOrganType = procedure.id.includes('cardiac')
    ? 'heart'
    : procedure.id.includes('kidney')
    ? 'kidney'
    : procedure.id.includes('craniofacial')
    ? 'head'
    : 'ankle';

  // Current active checkpoint
  const currentCheckpointIndex = completedCheckpointIds.length;
  const currentCheckpoint = procedure.checkpoints[currentCheckpointIndex] || null;
  const lastCompletedIdRef = useRef<string | null>(null);

  // Extract bimanual hand inputs
  const leftHand = currentInput.bimanual?.leftHand || {
    tracked: false,
    x: -0.4,
    y: 0.1,
    isPinching: false,
    pinchDistance: 0.2,
    confidence: 1.0,
    rawHandedness: 'Left',
  };

  const rightHand = currentInput.bimanual?.rightHand || {
    tracked: true,
    x: currentInput.x,
    y: currentInput.y,
    isPinching: currentInput.isSelecting,
    pinchDistance: currentInput.isSelecting ? 0.04 : 0.2,
    confidence: 1.0,
    rawHandedness: 'Right',
  };

  // Target positions & spatial range checks
  const targetCoords = currentCheckpoint?.targetPosition || null;

  const leftWorldX = leftHand.x * 3.2;
  const leftWorldZ = -leftHand.y * 2.2;
  const rightWorldX = rightHand.x * 3.2;
  const rightWorldZ = -rightHand.y * 2.2;

  const isLeftNearTarget = useMemo(() => {
    if (!targetCoords) return false;
    const dx = leftWorldX - targetCoords[0];
    const dz = leftWorldZ - targetCoords[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    return dist <= (currentCheckpoint?.toleranceRadius || 0.65) + 0.45;
  }, [leftWorldX, leftWorldZ, targetCoords, currentCheckpoint]);

  const isHoldingTarget = isLeftNearTarget && leftHand.isPinching;

  const isRightHoveringTarget = useMemo(() => {
    if (!targetCoords) return false;
    const dx = rightWorldX - targetCoords[0];
    const dz = rightWorldZ - targetCoords[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    return dist <= (currentCheckpoint?.toleranceRadius || 0.65);
  }, [rightWorldX, rightWorldZ, targetCoords, currentCheckpoint]);

  // Two-hand coordination state machine
  const coordinationState: BimanualCoordinationState = useMemo(() => {
    if (!currentCheckpoint) return 'CHECKPOINT_COMPLETED';
    if (isHoldingTarget && rightHand.isPinching) return 'TRACING';
    if (isHoldingTarget) return 'LEFT_TOOL_HOLDING';
    if (rightHand.isPinching && isRightHoveringTarget) return 'RIGHT_TOOL_ENGAGED';
    if (isRightHoveringTarget || isLeftNearTarget) return 'TARGET_SELECTED';
    return 'IDLE';
  }, [currentCheckpoint, isHoldingTarget, rightHand.isPinching, isRightHoveringTarget, isLeftNearTarget]);

  // Highlighted anatomical mesh corresponding to checkpoint
  const highlightedMeshName = useMemo(() => {
    return currentCheckpoint?.targetMeshName || null;
  }, [currentCheckpoint]);

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

  // Sync left stabilizer tool to target position in mouse mode
  useEffect(() => {
    if (currentInput.source === 'mouse' && targetCoords) {
      // Position left stabilizer nearby target landmark so Spacebar immediately holds
      const normX = targetCoords[0] / 3.2;
      const normY = -targetCoords[2] / 2.2;
      globalInputAdapter.setLeftStabilizerPosition(normX - 0.1, normY);
    }
  }, [targetCoords, currentInput.source]);

  // Handle Webcam Toggle
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      globalHandTracker.stopWebcam();
      setIsWebcamActive(false);
      setWebcamStatus({ ...globalHandTracker.status });
    } else {
      if (videoRef.current) {
        const ok = await globalHandTracker.startWebcam(videoRef.current, (bimanual) => {
          globalInputAdapter.updateBimanualInput(bimanual);
          setWebcamStatus({ ...globalHandTracker.status });
        });
        setIsWebcamActive(ok);
      }
    }
  };

  // Keyboard shortcut listener ('1' scalpel, '2' probe, 'r' reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') setToolMode('scalpel');
      else if (e.key === '2') setToolMode('probe');
      else if (e.key === 'r' || e.key === 'R') onReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReset]);

  // Two-hand surgical verification logic
  const checkInteraction = useCallback(() => {
    if (!currentCheckpoint) return;

    // Check if left hand stabilization is required
    const requiresStab = currentCheckpoint.requiresStabilization ?? false;

    // Safety violation: Attempting to cut/probe without holding target
    if (requiresStab && rightHand.isPinching && isRightHoveringTarget && !isHoldingTarget) {
      onSimulationEvent({
        type: 'INVALID_ACTION',
        reason: `Tissue stabilization required before incising ${currentCheckpoint.title}`,
        checkpointId: currentCheckpoint.id,
        timestamp: Date.now(),
      });
      return;
    }

    if (isRightHoveringTarget) {
      let actionSatisfied = false;

      if (currentCheckpoint.requiredAction === 'position') {
        actionSatisfied = true;
      } else if (currentCheckpoint.requiredAction === 'select') {
        actionSatisfied = rightHand.isPinching && (!requiresStab || isHoldingTarget);
      } else if (currentCheckpoint.requiredAction === 'traverse') {
        actionSatisfied = rightHand.isPinching && (!requiresStab || isHoldingTarget);
      } else if (currentCheckpoint.requiredAction === 'release') {
        actionSatisfied = !rightHand.isPinching;
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
  }, [
    currentCheckpoint,
    rightHand.isPinching,
    isRightHoveringTarget,
    isHoldingTarget,
    onSimulationEvent,
  ]);

  useEffect(() => {
    checkInteraction();
  }, [checkInteraction]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col space-y-4 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4' : ''
      }`}
    >
      {/* Hidden/Thumbnail Video Element for MediaPipe Local Frame Processing */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute z-30 rounded-xl border border-cyan-500/60 shadow-2xl object-cover transition-all ${
          isWebcamActive
            ? 'bottom-20 right-6 w-36 h-28 opacity-90'
            : 'hidden pointer-events-none'
        }`}
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Top Operating Theatre Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-950/40">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {procedure.title}
              </h1>
              <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                Operating Theatre
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic Surgical Assessment &bull; Bimanual Left-Stabilize / Right-Cut Simulation
            </p>
          </div>
        </div>

        {/* Action Controls & Webcam Tracking Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Webcam Hand Tracking Toggle */}
          <button
            onClick={toggleWebcam}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
              isWebcamActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {isWebcamActive ? (
              <>
                <Camera className="w-3.5 h-3.5 text-white" />
                <span>Webcam Active ({webcamStatus.handsDetectedCount} Hands)</span>
              </>
            ) : (
              <>
                <CameraOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Enable Bimanual Webcam</span>
              </>
            )}
          </button>

          {/* Model Provenance Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {activeOrgan === 'heart'
                ? 'NIH Visible Human (CC-BY 4.0)'
                : activeOrgan === 'head'
                ? 'Three.js Scan (CC-BY 3.0)'
                : 'Layered Anatomy'}
            </span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Sidebar Toggle Buttons */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsLeftCollapsed((prev) => !prev)}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 border ${
                !isLeftCollapsed
                  ? 'bg-slate-800 border-slate-700 text-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isLeftCollapsed ? 'Show Checkpoints' : 'Hide Checkpoints'}
            >
              <PanelLeft className="w-4 h-4" />
              <span className="hidden xl:inline text-[11px]">Tasks</span>
            </button>

            <button
              onClick={() => setIsRightCollapsed((prev) => !prev)}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 border ${
                !isRightCollapsed
                  ? 'bg-slate-800 border-slate-700 text-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isRightCollapsed ? 'Show Guidance' : 'Hide Guidance'}
            >
              <PanelRight className="w-4 h-4" />
              <span className="hidden xl:inline text-[11px]">Guidance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Pane Medical Operating Theatre */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-250px)] min-h-[620px] gap-4">
        {/* Left Panel: Sequential Checkpoints & Hand Input Status (Collapsible) */}
        {!isLeftCollapsed && (
          <div className="w-full lg:w-76 shrink-0 h-[380px] lg:h-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl animate-fade-in select-none">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>Checkpoints</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                {completedCheckpointIds.length}/{procedure.checkpoints.length} Verified
              </span>
            </div>

            {/* Checkpoint Item List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {procedure.checkpoints.map((cp) => {
                const isCompleted = completedCheckpointIds.includes(cp.id);
                const isCurrent = currentCheckpoint?.id === cp.id;

                return (
                  <div
                    key={cp.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/80 border-cyan-500/90 text-white shadow-md'
                        : isCompleted
                        ? 'bg-slate-950/70 border-emerald-800/60 text-slate-300'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-4 h-4 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                            isCompleted
                              ? 'bg-emerald-500 text-slate-950'
                              : isCurrent
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {cp.order}
                        </span>
                        <span className="font-semibold text-xs truncate max-w-[170px]">
                          {cp.title}
                        </span>
                      </div>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {cp.description}
                    </p>

                    {cp.requiresStabilization && (
                      <div className="mt-1.5 inline-flex items-center space-x-1 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.5 rounded text-[9px] text-amber-300 font-mono">
                        <Hand className="w-2.5 h-2.5 text-amber-400" />
                        <span>Left Stabilizer Required</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bimanual Hand Input Indicator */}
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-[11px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Bimanual Tracking Status:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`p-2 rounded-xl border ${
                    isHoldingTarget
                      ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300'
                      : leftHand.isPinching
                      ? 'bg-cyan-950/70 border-cyan-700/80 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold block text-[10px]">LEFT: Stabilizer</span>
                  <span className="text-[10px] truncate block font-mono">
                    {isHoldingTarget ? '🔒 Holding Target' : leftHand.isPinching ? 'Grip Active' : 'Idle (Space)'}
                  </span>
                </div>

                <div
                  className={`p-2 rounded-xl border ${
                    rightHand.isPinching
                      ? 'bg-cyan-950/70 border-cyan-700/80 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold block text-[10px]">RIGHT: {toolMode.toUpperCase()}</span>
                  <span className="text-[10px] truncate block font-mono">
                    {rightHand.isPinching ? '⚡ Active Engage' : 'Positioning'}
                  </span>
                </div>
              </div>

              {/* Mouse & Keyboard Shortcut Hint */}
              <div className="p-2 bg-slate-950 border border-slate-800/80 rounded-xl text-[10px] text-slate-400 font-mono leading-tight">
                <span className="text-cyan-400 font-bold block mb-0.5">Controls Guide:</span>
                • Spacebar: Hold stabilizer<br />
                • Left-Click: Engage scalpel/probe<br />
                • Keys 1/2: Scalpel / Probe
              </div>
            </div>
          </div>
        )}

        {/* Center 3D Operative Field (Maximized) */}
        <div className="flex-1 min-w-0 h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
          <Canvas
            camera={{ position: [0, 3.8, 3.2], fov: 46 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
          >
            {/* Surgical Theatre Luminaires */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 12, 6]} intensity={2.2} color="#ffffff" />
            <directionalLight position={[-5, 10, -4]} intensity={1.4} color="#bae6fd" />
            <directionalLight position={[0, -4, 4]} intensity={0.5} color="#e0f2fe" />
            <pointLight position={[0, 4, 0]} intensity={1.0} color="#ffffff" />

            {/* Orbit Camera Controller */}
            <SimulationCameraController
              cameraPreset={cameraPreset}
              fitSignal={fitSignal}
              onHandled={() => setCameraPreset(null)}
            />

            {/* Real 3D Anatomical Organ Model */}
            <RealAnatomyModel
              organType={activeOrgan}
              layer={activeLayer}
              highlightedMeshName={highlightedMeshName}
            />

            {/* Surgical Incision Guides and Checkpoint Reticles */}
            <Targets
              checkpoints={procedure.checkpoints}
              completedIds={completedCheckpointIds}
              currentCheckpointId={currentCheckpoint?.id || null}
              isLeftStabilized={isHoldingTarget}
            />

            {/* Virtual Left-Hand Stabilizing Forceps */}
            <StabilizerTool
              hand={leftHand}
              targetPosition={targetCoords}
              isHoldingTarget={isHoldingTarget}
            />

            {/* Virtual Right-Hand Active Scalpel / Probe */}
            <Instrument
              hand={rightHand}
              mode={toolMode}
              isHoveringTarget={isRightHoveringTarget}
              isEngaged={rightHand.isPinching}
              isTracing={coordinationState === 'TRACING'}
            />
          </Canvas>

          {/* Floating Top-Left Camera Controls Toolbar */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl text-xs select-none">
            <button
              onClick={() => setFitSignal((prev) => prev + 1)}
              className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold flex items-center space-x-1 shadow-sm"
              title="Fit Model in Viewport"
            >
              <span>Fit View</span>
            </button>

            <button
              onClick={() => setCameraPreset('anterior')}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Anterior Coronal View"
            >
              Anterior
            </button>

            <button
              onClick={() => setCameraPreset('superior')}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Superior Cranial View"
            >
              Superior
            </button>

            <button
              onClick={() => setCameraPreset('reset')}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Reset</span>
            </button>
          </div>

          {/* Live Coordination State Floating Badge */}
          <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                coordinationState === 'TRACING'
                  ? 'bg-emerald-400 animate-ping'
                  : coordinationState === 'LEFT_TOOL_HOLDING'
                  ? 'bg-cyan-400 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span className="font-mono text-slate-300 text-[11px] font-bold uppercase tracking-wider">
              State: {coordinationState.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Bottom Guidance Banner */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-between items-center bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/80">
            <div>
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {currentCheckpoint
                    ? `Landmark ${currentCheckpoint.order}: ${currentCheckpoint.title}`
                    : 'All Landmarks Completed!'}
                </span>
              </span>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentCheckpoint
                  ? currentCheckpoint.description
                  : 'Anatomical exposure verified. Proceed to finalize and record session.'}
              </p>
            </div>

            <div className="text-right pl-4 shrink-0 font-mono text-xs text-cyan-400 font-bold">
              {completedCheckpointIds.length}/{procedure.checkpoints.length} Steps
            </div>
          </div>
        </div>

        {/* Right Panel: Tool Mode, Landmark Guidance & Manual Actions (Collapsible) */}
        {!isRightCollapsed && (
          <div className="w-full lg:w-76 shrink-0 h-[380px] lg:h-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl animate-fade-in select-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Surgical Guidance</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">v2.0</span>
              </div>

              {/* Right-Hand Active Tool Mode Toggle */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Right Active Instrument:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setToolMode('scalpel')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                      toolMode === 'scalpel'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Scalpel #10</span>
                  </button>

                  <button
                    onClick={() => setToolMode('probe')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                      toolMode === 'probe'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Surgical Probe</span>
                  </button>
                </div>
              </div>

              {/* Anatomical Layer Selector (When viewing Ankle) */}
              {activeOrgan === 'ankle' && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Anatomical Layer:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setActiveLayer('skin')}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                        activeLayer === 'skin' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Skin
                    </button>
                    <button
                      onClick={() => setActiveLayer('bone')}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                        activeLayer === 'bone' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Talus Bone
                    </button>
                  </div>
                </div>
              )}

              {/* Bimanual Coordination Guidance Card */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-cyan-400 font-bold text-[10px] uppercase tracking-wider block">
                  Two-Hand Technique:
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  1. <strong className="text-emerald-400">Left Hand:</strong> Grip landmark with forceps to stabilize tissue.<br />
                  2. <strong className="text-cyan-400">Right Hand:</strong> Trace along incision guideline.<br />
                  3. <strong className="text-slate-400">Release:</strong> Release forceps upon reaching endpoint.
                </p>
              </div>

              {/* Mouse Fallback Stabilize Button */}
              <button
                onMouseDown={() => globalInputAdapter.setLeftStabilizerHold(true)}
                onMouseUp={() => globalInputAdapter.setLeftStabilizerHold(false)}
                className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all ${
                  isHoldingTarget
                    ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Hand className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hold Left Stabilizer (or Spacebar)</span>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="w-full mt-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scene (Key: R)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
