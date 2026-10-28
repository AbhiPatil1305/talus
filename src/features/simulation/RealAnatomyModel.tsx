import React, { Suspense, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { HumanAnatomy, AnatomyLayer } from './HumanAnatomy';
import { computeObjectBounds } from '../../shared/cameraUtils';

export type RealOrganType = 'heart' | 'head' | 'kidney' | 'ankle' | 'pelvis';

interface RealAnatomyModelProps {
  organType: RealOrganType;
  layer: AnatomyLayer;
  highlightedMeshName?: string | null;
}

/**
 * Renders verified GLTF organ models, auto-centering geometry and highlighting active target structures
 */
const GLTFOrganViewer: React.FC<{
  url: string;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  targetMeshName?: string | null;
}> = ({
  url,
  scale = 1.0,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  targetMeshName,
}) => {
  const { scene } = useGLTF(url);

  const { clonedScene } = useMemo(() => {
    const clone = scene.clone(true);
    const rawBounds = computeObjectBounds(clone);
    const origCenter = rawBounds.center.clone();

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = (mesh.material as THREE.Material).clone();
          }
        }
      }
    });

    // Auto-center geometry at group origin
    clone.position.set(-origCenter.x, -origCenter.y, -origCenter.z);

    return { clonedScene: clone };
  }, [scene]);

  // Highlight active target mesh if specified
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat) return;

        if (targetMeshName && mesh.name === targetMeshName) {
          mat.emissive = new THREE.Color('#06b6d4'); // Cyan target highlight
          mat.emissiveIntensity = 0.9;
        } else {
          mat.emissive = new THREE.Color('#000000');
          mat.emissiveIntensity = 0.0;
        }
      }
    });
  }, [clonedScene, targetMeshName]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

export const RealAnatomyModel: React.FC<RealAnatomyModelProps> = ({
  organType,
  layer,
  highlightedMeshName,
}) => {
  return (
    <group>
      {/* 1. Operating Theatre Sterile Drapes & Table Background */}
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

      {/* 2. Genuine 3D Anatomy Models */}
      <Suspense
        fallback={
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#e0a98b" wireframe />
          </mesh>
        }
      >
        {organType === 'heart' && (
          <GLTFOrganViewer
            url="/models/human_heart_nih.glb"
            scale={4.2}
            rotation={[-Math.PI / 2 + 0.2, 0, 0]}
            position={[0, 0.1, 0]}
            targetMeshName={highlightedMeshName}
          />
        )}

        {organType === 'head' && (
          <GLTFOrganViewer
            url="/models/lee_perry_smith.glb"
            scale={0.4}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0.1, 0]}
            targetMeshName={highlightedMeshName}
          />
        )}

        {organType === 'pelvis' && (
          <GLTFOrganViewer
            url="/models/human_pelvis.glb"
            scale={6.5}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.1, 0]}
            targetMeshName={highlightedMeshName}
          />
        )}

        {organType === 'kidney' && (
          <GLTFOrganViewer
            url="/models/kidney.glb"
            scale={0.7}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.1, 0]}
            targetMeshName={highlightedMeshName}
          />
        )}

        {organType === 'ankle' && <HumanAnatomy layer={layer} />}
      </Suspense>
    </group>
  );
};

// Preload 3D assets
useGLTF.preload('/models/human_heart_nih.glb');
useGLTF.preload('/models/human_pelvis.glb');
useGLTF.preload('/models/lee_perry_smith.glb');
useGLTF.preload('/models/kidney.glb');
