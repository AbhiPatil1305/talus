import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NormalizedInput } from '../../shared/types';

interface InstrumentProps {
  input: NormalizedInput;
  isHoveringTarget: boolean;
}

/**
 * 3D Virtual Surgical Instrument (Stylized Scalpel / Probe)
 * Interpolates smoothly to normalized input coordinates across the surgical pad.
 */
export const Instrument: React.FC<InstrumentProps> = ({ input, isHoveringTarget }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0.5, 0));

  // Map [-1, 1] normalized coordinates to 3D world space coordinates on the surgical pad
  // X: [-3.5, 3.5], Z: [-2.5, 2.5]
  const targetX = input.x * 3.5;
  const targetZ = -input.y * 2.5;
  // Lower tip when selecting/pinching
  const targetY = input.isSelecting ? 0.08 : 0.45;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    targetPos.current.set(targetX, targetY, targetZ);

    // Smooth lerp damping
    const lerpSpeed = 15 * delta;
    groupRef.current.position.lerp(targetPos.current, THREE.MathUtils.clamp(lerpSpeed, 0, 1));
  });

  const tipColor = input.isSelecting
    ? '#10b981' // Active emerald
    : isHoveringTarget
    ? '#06b6d4' // Hover cyan
    : '#94a3b8'; // Idle steel

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Instrument Shaft / Handle */}
      <mesh position={[0, 1.2, 0]} rotation={[0.2, 0, -0.2]}>
        <cylinderGeometry args={[0.06, 0.08, 2.2, 16]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Grip Texture Band */}
      <mesh position={[0, 1.0, 0]} rotation={[0.2, 0, -0.2]}>
        <cylinderGeometry args={[0.085, 0.085, 0.6, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Scalpel Blade / Instrument Tip */}
      <mesh position={[0, 0.05, 0]}>
        <coneGeometry args={[0.07, 0.35, 12]} />
        <meshStandardMaterial
          color={tipColor}
          emissive={tipColor}
          emissiveIntensity={input.isSelecting || isHoveringTarget ? 0.6 : 0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Precision Reticle / Ground Indicator */}
      <mesh position={[0, -targetY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.16, 24]} />
        <meshBasicMaterial
          color={tipColor}
          transparent
          opacity={input.isSelecting ? 0.8 : 0.4}
        />
      </mesh>
    </group>
  );
};
