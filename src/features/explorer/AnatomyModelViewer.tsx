import React, { useMemo, useEffect, useRef } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AnatomicalStructure } from '../../shared/types';
import { ANATOMICAL_STRUCTURES } from './anatomyMetadata';
import {
  computeObjectBounds,
  ObjectBoundsResult,
} from '../../shared/cameraUtils';

interface AnatomyModelViewerProps {
  modelUrl: string;
  selectedStructure: AnatomicalStructure | null;
  hoveredMeshName: string | null;
  hiddenMeshNames: Set<string>;
  isIsolated: boolean;
  showLabels?: boolean;
  onSelectStructure: (structure: AnatomicalStructure | null) => void;
  onHoverMesh: (meshName: string | null) => void;
  onModelLoaded?: (bounds: ObjectBoundsResult, rootGroup: THREE.Group) => void;
  focusMeshSignal?: number; // Increment to trigger focus on selected mesh
}

export const AnatomyModelViewer: React.FC<AnatomyModelViewerProps> = ({
  modelUrl,
  selectedStructure,
  hoveredMeshName,
  hiddenMeshNames,
  isIsolated,
  showLabels = false,
  onSelectStructure,
  onHoverMesh,
  onModelLoaded,
}) => {
  const { scene } = useGLTF(modelUrl);
  const rootGroupRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  // Clone scene and set up independent materials and shadow casting
  const { clonedScene, bounds } = useMemo(() => {
    const clone = scene.clone(true);

    // Compute original unshifted bounds
    const rawBounds = computeObjectBounds(clone);
    const origCenter = rawBounds.center.clone();

    // Traverse to clone materials and setup meshes
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

    // Re-center model geometry around (0, 0, 0) by shifting position
    clone.position.set(-origCenter.x, -origCenter.y, -origCenter.z);

    // Compute centered bounds
    const centeredBounds = computeObjectBounds(clone);

    return {
      clonedScene: clone,
      bounds: centeredBounds,
    };
  }, [scene]);

  // Notify parent of loaded bounds so camera can frame properly
  useEffect(() => {
    if (rootGroupRef.current && onModelLoaded) {
      onModelLoaded(bounds, rootGroupRef.current);
    }
  }, [bounds, onModelLoaded]);

  // Apply real-time visual updates (isolation, highlighting, visibility)
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat) return;

        // Visibility toggle
        const isHidden = hiddenMeshNames.has(mesh.name);
        mesh.visible = !isHidden;

        const isSelected = selectedStructure?.meshName === mesh.name;
        const isHovered = hoveredMeshName === mesh.name;

        if (isSelected) {
          // Vibrant cyan/teal clinical selection highlight
          mat.emissive = new THREE.Color('#06b6d4');
          mat.emissiveIntensity = 0.85;
          mat.transparent = false;
          mat.opacity = 1.0;
        } else if (isHovered) {
          // Subtle amber hover glow
          mat.emissive = new THREE.Color('#fbbf24');
          mat.emissiveIntensity = 0.55;
          mat.transparent = false;
          mat.opacity = 1.0;
        } else if (isIsolated && selectedStructure) {
          // Ghost/dim unselected structures during isolation mode
          mat.emissive = new THREE.Color('#000000');
          mat.emissiveIntensity = 0.0;
          mat.transparent = true;
          mat.opacity = 0.08;
        } else {
          // Standard anatomical rendering (reverted cleanly)
          mat.emissive = new THREE.Color('#000000');
          mat.emissiveIntensity = 0.0;
          mat.transparent = false;
          mat.opacity = 1.0;
        }
      }
    });

    invalidate();
  }, [clonedScene, selectedStructure, hoveredMeshName, hiddenMeshNames, isIsolated, invalidate]);

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

    // 1. Look up in verified metadata
    let structure = ANATOMICAL_STRUCTURES.find((s) => s.meshName === meshName);

    // 2. If not pre-indexed, construct an ad-hoc structure representation from mesh name
    if (!structure && meshName) {
      // Clean up human-readable name from node name (e.g. VHM_left_coronary_artery -> Left Coronary Artery)
      const cleanName = meshName
        .replace(/^VHM_/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      structure = {
        id: `mesh_${meshName}`,
        name: cleanName,
        latinName: 'Nomenclatura anatomica in verificatione',
        system: 'cardiovascular',
        meshName: meshName,
        modelUrl: modelUrl,
        category: 'Identified Structure Mesh',
        description: `Anatomical mesh structure identified from 3D asset node "${meshName}".`,
        function: 'Verified anatomical component within the organ spatial hierarchy.',
        clinicalRelevance: 'Reference structure for surgical orientation and boundary margins.',
      };
    }

    onSelectStructure(structure || null);
  };

  // Compute selected mesh world position for floating 3D label
  const selectedMeshPosition = useMemo(() => {
    if (!selectedStructure || !showLabels) return null;
    const mesh = clonedScene.getObjectByName(selectedStructure.meshName);
    if (!mesh) return null;

    const meshBounds = computeObjectBounds(mesh);
    if (!meshBounds.isValid) return null;

    return meshBounds.center;
  }, [selectedStructure, showLabels, clonedScene]);

  return (
    <group ref={rootGroupRef}>
      <primitive
        object={clonedScene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {/* Optional Floating 3D Label */}
      {showLabels && selectedStructure && selectedMeshPosition && (
        <Html
          position={[selectedMeshPosition.x, selectedMeshPosition.y + 0.05, selectedMeshPosition.z]}
          center
          distanceFactor={6}
        >
          <div className="bg-slate-900/95 border border-cyan-400 text-cyan-200 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xl backdrop-blur-md pointer-events-none whitespace-nowrap animate-fade-in flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{selectedStructure.name}</span>
          </div>
        </Html>
      )}
    </group>
  );
};

// Preload models for instant response
useGLTF.preload('/models/human_heart_nih.glb');
useGLTF.preload('/models/human_pelvis.glb');
useGLTF.preload('/models/human_lung.glb');
useGLTF.preload('/models/human_body_skin.glb');
