import React, { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { AnatomyModelViewer } from './AnatomyModelViewer';
import { CameraControls } from './CameraControls';
import { AnatomicalStructure } from '../../shared/types';
import {
  CameraPreset,
  fitCameraToObject,
  focusCameraOnMesh,
  ObjectBoundsResult,
} from '../../shared/cameraUtils';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AnatomyCanvasProps {
  modelUrl: string;
  selectedStructure: AnatomicalStructure | null;
  hoveredMeshName: string | null;
  hiddenMeshNames: Set<string>;
  isIsolated: boolean;
  onSelectStructure: (structure: AnatomicalStructure | null) => void;
  onHoverMesh: (meshName: string | null) => void;
}

/**
 * Internal Three.js camera controller handling Fit Model, Focus Mesh, Presets, and Resizing
 */
const SceneCameraController: React.FC<{
  rootGroup: THREE.Group | null;
  selectedMeshName: string | null;
  cameraPreset: CameraPreset | null;
  fitSignal: number;
  focusSignal: number;
  onPresetHandled: () => void;
}> = ({
  rootGroup,
  selectedMeshName,
  cameraPreset,
  fitSignal,
  focusSignal,
  onPresetHandled,
}) => {
  const { camera, size } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Fit camera whenever model root changes or fitSignal increments
  useEffect(() => {
    if (!rootGroup) return;
    const persCamera = camera as THREE.PerspectiveCamera;
    fitCameraToObject(persCamera, controlsRef.current, rootGroup, 'reset');
  }, [rootGroup, fitSignal, camera]);

  // Handle camera presets (Anterior, Posterior, etc.)
  useEffect(() => {
    if (!cameraPreset || !rootGroup) return;
    const persCamera = camera as THREE.PerspectiveCamera;
    fitCameraToObject(persCamera, controlsRef.current, rootGroup, cameraPreset);
    onPresetHandled();
  }, [cameraPreset, rootGroup, camera, onPresetHandled]);

  // Focus on selected mesh
  useEffect(() => {
    if (!rootGroup || !selectedMeshName || focusSignal === 0) return;
    const mesh = rootGroup.getObjectByName(selectedMeshName);
    if (!mesh) return;

    const persCamera = camera as THREE.PerspectiveCamera;
    focusCameraOnMesh(persCamera, controlsRef.current, mesh);
  }, [focusSignal, rootGroup, selectedMeshName, camera]);

  // Recalculate camera aspect and projection on viewport resize
  useEffect(() => {
    const persCamera = camera as THREE.PerspectiveCamera;
    if (persCamera.isPerspectiveCamera && size.width > 0 && size.height > 0) {
      persCamera.aspect = size.width / size.height;
      persCamera.updateProjectionMatrix();
    }
  }, [size, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={0.02}
      maxDistance={25.0}
    />
  );
};

export const AnatomyCanvas: React.FC<AnatomyCanvasProps> = ({
  modelUrl,
  selectedStructure,
  hoveredMeshName,
  hiddenMeshNames,
  isIsolated,
  onSelectStructure,
  onHoverMesh,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rootGroup, setRootGroup] = useState<THREE.Group | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);
  const [fitSignal, setFitSignal] = useState(0);
  const [focusSignal, setFocusSignal] = useState(0);
  const [showLabels, setShowLabels] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleModelLoaded = useCallback(
    (_bounds: ObjectBoundsResult, group: THREE.Group) => {
      setRootGroup(group);
      setFitSignal((prev) => prev + 1);
      setHasError(false);
    },
    []
  );

  const handleFitModel = () => {
    setFitSignal((prev) => prev + 1);
  };

  const handleFocusSelected = () => {
    setFocusSignal((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Sync fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[520px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-full min-h-0 flex-1">
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950">
            <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
            <h4 className="text-white font-bold text-sm mb-1">Unable to Load Anatomical Asset</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              The 3D model could not be rendered. Check network connectivity or try reloading.
            </p>
            <button
              onClick={() => {
                setHasError(false);
                setFitSignal((prev) => prev + 1);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Load</span>
            </button>
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0, 2], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
          >
            {/* Surgical Theatre Lighting */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[6, 12, 8]} intensity={2.2} color="#ffffff" />
            <directionalLight position={[-6, 8, -6]} intensity={1.4} color="#bae6fd" />
            <directionalLight position={[0, -6, 4]} intensity={0.6} color="#e0f2fe" />
            <pointLight position={[0, 4, 2]} intensity={0.9} />

            {/* Subtle Clinical Floor Grid */}
            <gridHelper args={[20, 40, '#1e293b', '#0f172a']} position={[0, -1.2, 0]} />

            {/* Dynamic Camera Controller */}
            <SceneCameraController
              rootGroup={rootGroup}
              selectedMeshName={selectedStructure?.meshName || null}
              cameraPreset={cameraPreset}
              fitSignal={fitSignal}
              focusSignal={focusSignal}
              onPresetHandled={() => setCameraPreset(null)}
            />

            {/* Anatomical Model Loader */}
            <Suspense
              fallback={
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.5, 0.5, 0.5]} />
                  <meshStandardMaterial color="#0284c7" wireframe />
                </mesh>
              }
            >
              <AnatomyModelViewer
                modelUrl={modelUrl}
                selectedStructure={selectedStructure}
                hoveredMeshName={hoveredMeshName}
                hiddenMeshNames={hiddenMeshNames}
                isIsolated={isIsolated}
                showLabels={showLabels}
                onSelectStructure={onSelectStructure}
                onHoverMesh={onHoverMesh}
                onModelLoaded={handleModelLoaded}
              />
            </Suspense>
          </Canvas>
        )}

        {/* Floating Top-Left Clinical Camera Controls */}
        <div className="absolute top-4 left-4 z-20 max-w-[calc(100%-2rem)]">
          <CameraControls
            onSetPreset={setCameraPreset}
            onFitModel={handleFitModel}
            onFocusSelected={handleFocusSelected}
            hasSelectedStructure={Boolean(selectedStructure)}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((prev) => !prev)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>

        {/* Controls Info Badge */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 text-[11px] text-slate-400 hidden sm:block">
          <span className="font-semibold text-cyan-400">Interaction:</span> Left-Click: Rotate &bull; Right-Click: Pan &bull; Scroll: Zoom &bull; Click Structure: Select
        </div>

        {/* Hovered Mesh Tooltip Banner */}
        {hoveredMeshName && (
          <div className="absolute bottom-4 right-4 z-20 pointer-events-none bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/50 text-xs font-mono text-cyan-300 animate-slide-in">
            Hover: {hoveredMeshName}
          </div>
        )}
      </div>
    </div>
  );
};
