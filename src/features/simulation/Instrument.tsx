import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SingleHandState } from '../../shared/types';

export type InstrumentMode = 'scalpel' | 'probe';

interface InstrumentProps {
  hand: SingleHandState;
  mode?: InstrumentMode;
  isHoveringTarget: boolean;
  isEngaged: boolean;
  isTracing: boolean;
}

/**
 * Dedicated Right-Hand Virtual Active Instrument (Scalpel #10 or Surgical Probe)
 * Features dual tool modes, realistic stainless-steel geometry, responsive movement,
 * and visual engagement feedback.
 */
export const Instrument: React.FC<InstrumentProps> = ({
  hand,
  mode = 'scalpel',
  isHoveringTarget,
  isEngaged,
  isTracing,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(0.3, 0.45, 0));

  // Map normalized coordinates [-1, 1] to world space over the operative field
  const targetX = hand.x * 3.2;
  const targetZ = -hand.y * 2.2;
  // Instrument lowers into tissue when pinching / engaged
  const targetY = isEngaged ? 0.08 : 0.45;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    targetPos.current.set(targetX, targetY, targetZ);

    const lerpSpeed = 16 * delta;
    groupRef.current.position.lerp(targetPos.current, THREE.MathUtils.clamp(lerpSpeed, 0, 1));
  });

  const activeEmissive = isTracing
    ? '#10b981' // Active incision emerald
    : isEngaged
    ? '#06b6d4' // Engaged cyan
    : isHoveringTarget
    ? '#38bdf8' // Target aligned
    : '#000000';

  return (
    <group ref={groupRef} position={[0.3, 0.45, 0]}>
      {/* Right-Handed Ergonomic Angle */}
      <group rotation={[0.42, 0, -0.22]}>
        {mode === 'scalpel' ? (
          // ==============================
          // Scalpel #10 Configuration
          // ==============================
          <group>
            {/* Stainless Steel Handle Body */}
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[0.06, 1.8, 0.16]} />
              <meshStandardMaterial
                color="#94a3b8"
                metalness={0.92}
                roughness={0.18}
              />
            </mesh>

            {/* Ergonomic Ribbed Grip Zones */}
            {[-0.45, -0.22, 0.0, 0.22, 0.45].map((offset, i) => (
              <mesh key={i} position={[0, 1.2 + offset, 0]}>
                <boxGeometry args={[0.064, 0.06, 0.17]} />
                <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.4} />
              </mesh>
            ))}

            {/* Blade Collar Mount */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.04, 0.25, 0.12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>

            {/* Surgical Blade #10 (Curved Belly Cutting Edge) */}
            <mesh position={[0, -0.05, 0.015]} rotation={[0, 0, 0.08]}>
              <coneGeometry args={[0.065, 0.32, 4]} />
              <meshStandardMaterial
                color="#f8fafc"
                emissive={activeEmissive}
                emissiveIntensity={isEngaged || isTracing ? 0.8 : isHoveringTarget ? 0.3 : 0.0}
                metalness={0.98}
                roughness={0.06}
              />
            </mesh>
          </group>
        ) : (
          // ==============================
          // Surgical Probe Configuration
          // ==============================
          <group>
            {/* Probe Handle */}
            <mesh position={[0, 1.3, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 1.8, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.88} roughness={0.25} />
            </mesh>

            {/* Probe Tapered Shaft */}
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.015, 0.035, 0.5, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>

            {/* Atraumatic Ball Tip */}
            <mesh position={[0, -0.02, 0]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshStandardMaterial
                color="#e2e8f0"
                emissive={activeEmissive}
                emissiveIntensity={isEngaged ? 0.8 : isHoveringTarget ? 0.4 : 0.0}
                metalness={0.98}
                roughness={0.08}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* Surface Reticle / Incision Guideline Indicator */}
      <mesh position={[0, -targetY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial
          color={isTracing ? '#10b981' : isEngaged ? '#06b6d4' : isHoveringTarget ? '#38bdf8' : '#64748b'}
          transparent
          opacity={isEngaged ? 0.9 : isHoveringTarget ? 0.6 : 0.3}
        />
      </mesh>
    </group>
  );
};
