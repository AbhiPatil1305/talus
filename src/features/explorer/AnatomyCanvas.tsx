import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AnatomyModelViewer } from './AnatomyModelViewer';
import { CameraControls, CameraPreset } from './CameraControls';
import { AnatomicalStructure } from '../../shared/types';

interface AnatomyCanvasProps {
  modelUrl: string;
  selectedStructure: AnatomicalStructure | null;
  hoveredMeshName: string | null;
  hiddenMeshNames: Set<string>;
  isIsolated: boolean;
  cameraPreset: CameraPreset | null;
  onSelectStructure: (structure: AnatomicalStructure | null) => void;
  onHoverMesh: (meshName: string | null) => void;
  onSetCameraPreset: (preset: CameraPreset) => void;
  onClearCameraPreset: () => void;
  scale?: number;
}

const CameraPresetHandler: React.FC<{
  preset: CameraPreset | null;
  onHandled: () => void;
}> = ({ preset, onHandled }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (!preset) return;
    if (preset === 'anterior') {
      camera.position.set(0, 0, 4.2);
    } else if (preset === 'posterior') {
      camera.position.set(0, 0, -4.2);
    } else if (preset === 'lateral-left') {
      camera.position.set(-4.2, 0, 0);
    } else if (preset === 'lateral-right') {
      camera.position.set(4.2, 0, 0);
    } else if (preset === 'superior') {
      camera.position.set(0, 4.2, 0.01);
    } else if (preset === 'reset') {
      camera.position.set(0, 1.8, 3.8);
    }
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    onHandled();
  }, [preset, camera, onHandled]);

  return null;
};

export const AnatomyCanvas: React.FC<AnatomyCanvasProps> = ({
  modelUrl,
  selectedStructure,
  hoveredMeshName,
  hiddenMeshNames,
  isIsolated,
  cameraPreset,
  onSelectStructure,
  onHoverMesh,
  onSetCameraPreset,
  onClearCameraPreset,
  scale = 1.0,
}) => {
  return (
    <div className="relative w-full h-[580px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.8, 3.8], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Anatomical Studio Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 12, 6]} intensity={2.0} color="#ffffff" />
        <directionalLight position={[-5, 8, -4]} intensity={1.2} color="#bae6fd" />
        <directionalLight position={[0, -5, 4]} intensity={0.5} color="#e0f2fe" />
        <pointLight position={[0, 3, 2]} intensity={0.8} />

        {/* Camera handler */}
        <CameraPresetHandler preset={cameraPreset} onHandled={onClearCameraPreset} />

        {/* Orbit Controls with Pan, Zoom, Rotate */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.2}
          maxDistance={9.0}
        />

        {/* Grid floor reference */}
        <gridHelper args={[12, 24, '#1e293b', '#0f172a']} position={[0, -1.2, 0]} />

        {/* Model Loader */}
        <Suspense
          fallback={
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
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
            onSelectStructure={onSelectStructure}
            onHoverMesh={onHoverMesh}
            scale={scale}
          />
        </Suspense>
      </Canvas>

      {/* Floating Camera Preset Controls in 3D View */}
      <div className="absolute top-4 left-4 z-20">
        <CameraControls onSetPreset={onSetCameraPreset} />
      </div>

      {/* Interaction Help Badge */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/70 text-[11px] text-slate-400">
        <span className="font-semibold text-cyan-400">Controls:</span> Left-Click + Drag: Rotate &bull; Right-Click: Pan &bull; Scroll: Zoom &bull; Click Mesh: Select
      </div>

      {/* Hovered Mesh Tooltip Banner */}
      {hoveredMeshName && (
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-cyan-500/50 text-xs font-mono text-cyan-300 animate-slide-in">
          Hover: {hoveredMeshName}
        </div>
      )}
    </div>
  );
};
