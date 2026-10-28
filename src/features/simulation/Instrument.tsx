import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NormalizedInput } from '../../shared/types';

interface InstrumentProps {
  input: NormalizedInput;
  isHoveringTarget: boolean;
}

/**
 * Photorealistic Surgical Scalpel #10
 * Features a stainless-steel scalpel handle, ribbed grip zone,
 * metric graduation lines, and polished surgical cutting blade.
 */
export const Instrument: React.FC<InstrumentProps> = ({ input, isHoveringTarget }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0.6, 0));

  // Map normalized coordinates [-1, 1] to world space over the operative field
  const targetX = input.x * 3.2;
  const targetZ = -input.y * 2.2;
  // Scalpel lowers into tissue when engaged
  const targetY = input.isSelecting ? 0.09 : 0.48;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    targetPos.current.set(targetX, targetY, targetZ);

    const lerpSpeed = 16 * delta;
    groupRef.current.position.lerp(targetPos.current, THREE.MathUtils.clamp(lerpSpeed, 0, 1));
  });

  const bladeEmissive = input.isSelecting
    ? '#10b981' // Active emerald cutting
    : isHoveringTarget
    ? '#06b6d4' // Target locked cyan
    : '#000000';

  return (
    <group ref={groupRef} position={[0, 0.6, 0]}>
      {/* Scalpel Handle (Stainless Steel #3 / #4 Handle) */}
      <group rotation={[0.45, 0, -0.2]}>
        {/* Main Handle Body */}
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[0.07, 2.4, 0.22]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.92}
            roughness={0.18}
          />
        </mesh>

        {/* Textured Ribbed Grip Bands */}
        {[-0.6, -0.3, 0.0, 0.3, 0.6].map((offset, i) => (
          <mesh key={i} position={[0, 1.4 + offset, 0]}>
            <boxGeometry args={[0.076, 0.08, 0.23]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.4} />
          </mesh>
        ))}

        {/* Scalpel Neck / Blade Bayonet Mount */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.045, 0.3, 0.14]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Detachable Surgical Blade #10 (Curved Belly Cutting Edge) */}
        <mesh position={[0, -0.06, 0.02]} rotation={[0, 0, 0.1]}>
          <coneGeometry args={[0.08, 0.38, 4]} />
          <meshStandardMaterial
            color="#f8fafc"
            emissive={bladeEmissive}
            emissiveIntensity={input.isSelecting || isHoveringTarget ? 0.7 : 0.0}
            metalness={0.98}
            roughness={0.08}
          />
        </mesh>
      </group>

      {/* Precision Reticle on Anatomical Surface */}
      <mesh position={[0, -targetY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.14, 32]} />
        <meshBasicMaterial
          color={input.isSelecting ? '#10b981' : isHoveringTarget ? '#06b6d4' : '#64748b'}
          transparent
          opacity={input.isSelecting ? 0.85 : 0.4}
        />
      </mesh>
    </group>
  );
};
