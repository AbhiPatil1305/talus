import React, { useMemo } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { AnatomicalStructure } from '../../shared/types';
import { ANATOMICAL_STRUCTURES } from './anatomyMetadata';

interface AnatomyModelViewerProps {
  modelUrl: string;
  selectedStructure: AnatomicalStructure | null;
  hoveredMeshName: string | null;
  hiddenMeshNames: Set<string>;
  isIsolated: boolean;
  onSelectStructure: (structure: AnatomicalStructure | null) => void;
  onHoverMesh: (meshName: string | null) => void;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
}

export const AnatomyModelViewer: React.FC<AnatomyModelViewerProps> = ({
  modelUrl,
  selectedStructure,
  hoveredMeshName,
  hiddenMeshNames,
  isIsolated,
  onSelectStructure,
  onHoverMesh,
  scale = 1.0,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
}) => {
  const { scene } = useGLTF(modelUrl);

  // Clone scene and apply material shaders, interactivity and visibility
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Clone material so changes to one mesh don't affect others
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = (mesh.material as THREE.Material).clone();
          }
        }
      }
    });

    return clone;
  }, [scene]);

  // Apply real-time visual updates (isolation, highlighting, visibility) on the cloned hierarchy
  useMemo(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat) return;

        // Check visibility
        const isHidden = hiddenMeshNames.has(mesh.name);
        mesh.visible = !isHidden;

        const isSelected = selectedStructure?.meshName === mesh.name;
        const isHovered = hoveredMeshName === mesh.name;

        if (isSelected) {
          mat.emissive = new THREE.Color('#10b981'); // Vibrant emerald glow
          mat.emissiveIntensity = 0.85;
          mat.transparent = false;
          mat.opacity = 1.0;
        } else if (isHovered) {
          mat.emissive = new THREE.Color('#06b6d4'); // Cyan hover glow
          mat.emissiveIntensity = 0.55;
          mat.transparent = false;
          mat.opacity = 1.0;
        } else if (isIsolated && selectedStructure) {
          // Dim and ghost unselected meshes during isolation mode
          mat.emissive = new THREE.Color('#000000');
          mat.emissiveIntensity = 0.0;
          mat.transparent = true;
          mat.opacity = 0.08;
        } else {
          // Standard anatomical rendering
          mat.emissive = new THREE.Color('#000000');
          mat.emissiveIntensity = 0.0;
          mat.transparent = false;
          mat.opacity = 1.0;
        }
      }
    });
  }, [clonedScene, selectedStructure, hoveredMeshName, hiddenMeshNames, isIsolated]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const meshName = e.object.name;
    onHoverMesh(meshName);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHoverMesh(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const meshName = e.object.name;
    const structure = ANATOMICAL_STRUCTURES.find((s) => s.meshName === meshName) || null;
    onSelectStructure(structure);
  };

  return (
    <group position={position} rotation={rotation}>
      <Center top position={[0, 0, 0]}>
        <primitive
          object={clonedScene}
          scale={scale}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
      </Center>
    </group>
  );
};

// Preload models
useGLTF.preload('/models/human_heart_nih.glb');
useGLTF.preload('/models/human_pelvis.glb');
useGLTF.preload('/models/human_lung.glb');
useGLTF.preload('/models/human_body_skin.glb');
