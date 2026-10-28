import React, { Suspense, useMemo } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import { HumanAnatomy, AnatomyLayer } from './HumanAnatomy';

export type RealOrganType = 'heart' | 'head' | 'kidney' | 'ankle';

interface RealAnatomyModelProps {
  organType: RealOrganType;
  layer: AnatomyLayer;
}

/**
 * Component to load and display real 3D anatomical models
 */
const GLTFOrganViewer: React.FC<{ url: string; scale: number; rotation?: [number, number, number]; position?: [number, number, number] }> = ({
  url,
  scale,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
}) => {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Boost material vibrance
        if (mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).roughness = 0.45;
          (mesh.material as THREE.MeshStandardMaterial).metalness = 0.1;
        }
      }
    });
    return clone;
  }, [scene]);

  return (
    <group position={position} rotation={rotation}>
      <Center top position={[0, 0.05, 0]}>
        <primitive object={clonedScene} scale={scale} />
      </Center>
    </group>
  );
};

export const RealAnatomyModel: React.FC<RealAnatomyModelProps> = ({ organType, layer }) => {
  return (
    <group>
      {/* 1. Operating Theatre Sterile Drapes & Table Background (Consistent across all organs) */}
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[11, 0.4, 7.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[10.2, 0.08, 6.8]} />
        <meshStandardMaterial color="#0284c7" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Sterile Drapes Sheet */}
      <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.5, 6.2]} />
        <meshStandardMaterial color="#0369a1" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Sterile Fenestration Aperture Ring */}
      <mesh position={[0.0, -0.05, 0.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 4.4, 32]} />
        <meshStandardMaterial color="#0284c7" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Povidone-Iodine Antiseptic Prep Ring on Operative Field */}
      <mesh position={[0.0, -0.04, 0.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 2.4, 32]} />
        <meshBasicMaterial color="#92400e" transparent opacity={0.3} />
      </mesh>

      {/* 2. Real Human Anatomy 3D Models */}
      <Suspense fallback={
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#e0a98b" wireframe />
        </mesh>
      }>
        {organType === 'heart' && (
          <GLTFOrganViewer
            url="/models/heart.glb"
            scale={0.038}
            rotation={[-Math.PI / 2 + 0.3, 0, 0.2]}
            position={[0, 0.1, 0]}
          />
        )}

        {organType === 'head' && (
          <GLTFOrganViewer
            url="/models/lee_perry_smith.glb"
            scale={0.85}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0.1, 0]}
          />
        )}

        {organType === 'kidney' && (
          <GLTFOrganViewer
            url="/models/kidney.glb"
            scale={0.035}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.1, 0]}
          />
        )}

        {organType === 'ankle' && (
          <HumanAnatomy layer={layer} />
        )}
      </Suspense>
    </group>
  );
};

// Preload 3D assets into cache
useGLTF.preload('/models/heart.glb');
useGLTF.preload('/models/lee_perry_smith.glb');
useGLTF.preload('/models/kidney.glb');
