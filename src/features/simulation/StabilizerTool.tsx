import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SingleHandState } from '../../shared/types';

interface StabilizerToolProps {
  hand: SingleHandState;
  targetPosition: [number, number, number] | null;
  isHoldingTarget: boolean;
}

/**
 * Dedicated Left-Hand Virtual Stabilizing Instrument (Surgical Tissue Forceps)
 * Provides atraumatic anatomical stabilization before active incising or probing.
 */
export const StabilizerTool: React.FC<StabilizerToolProps> = ({
  hand,
  targetPosition,
  isHoldingTarget,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(-0.6, 0.45, 0));
  const lineGeometryRef = useRef<THREE.BufferGeometry>(null);

  // Map left-hand normalized coordinates [-1, 1] to 3D world space
  const worldX = hand.x * 3.2;
  const worldZ = -hand.y * 2.2;
  const worldY = hand.isPinching ? 0.08 : 0.42;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    targetPos.current.set(worldX, worldY, worldZ);

    const lerpSpeed = 16 * delta;
    groupRef.current.position.lerp(targetPos.current, THREE.MathUtils.clamp(lerpSpeed, 0, 1));

    // Update tension line connecting forceps tip to stabilized anatomical target
    if (lineGeometryRef.current && targetPosition && isHoldingTarget && groupRef.current) {
      const tipPos = groupRef.current.position;
      const points = new Float32Array([
        tipPos.x,
        tipPos.y,
        tipPos.z,
        targetPosition[0],
        targetPosition[1],
        targetPosition[2],
      ]);
      lineGeometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(points, 3)
      );
    }
  });

  const toolColor = isHoldingTarget
    ? '#10b981' // Secure emerald hold
    : hand.isPinching
    ? '#06b6d4' // Active pinch
    : '#94a3b8'; // Neutral surgical steel

  return (
    <group>
      {/* Dynamic Stabilizing Forceps Body */}
      <group ref={groupRef} position={[-0.6, 0.45, 0]}>
        {/* Forceps Bayonet Shaft (Left-handed ergonomic angle) */}
        <group rotation={[0.4, 0, 0.25]}>
          {/* Main Tine A */}
          <mesh position={[-0.03, 1.2, 0]}>
            <boxGeometry args={[0.04, 2.0, 0.12]} />
            <meshStandardMaterial
              color={toolColor}
              metalness={0.9}
              roughness={0.2}
              emissive={isHoldingTarget ? '#10b981' : '#000000'}
              emissiveIntensity={isHoldingTarget ? 0.5 : 0.0}
            />
          </mesh>

          {/* Main Tine B */}
          <mesh position={[0.03, 1.2, 0]}>
            <boxGeometry args={[0.04, 2.0, 0.12]} />
            <meshStandardMaterial
              color={toolColor}
              metalness={0.9}
              roughness={0.2}
              emissive={isHoldingTarget ? '#10b981' : '#000000'}
              emissiveIntensity={isHoldingTarget ? 0.5 : 0.0}
            />
          </mesh>

          {/* Spring Joint / Hasp at Top */}
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[0.1, 0.15, 0.14]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Atraumatic Grip Tines (Closing when pinched) */}
          <mesh
            position={[hand.isPinching ? -0.005 : -0.025, 0.1, 0]}
            rotation={[0, 0, hand.isPinching ? 0.02 : 0.08]}
          >
            <coneGeometry args={[0.03, 0.35, 4]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>

          <mesh
            position={[hand.isPinching ? 0.005 : 0.025, 0.1, 0]}
            rotation={[0, 0, hand.isPinching ? -0.02 : -0.08]}
          >
            <coneGeometry args={[0.03, 0.35, 4]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* Reticle / Ground Indicator under Stabilizer */}
        <mesh position={[0, -worldY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.12, 32]} />
          <meshBasicMaterial
            color={isHoldingTarget ? '#10b981' : '#38bdf8'}
            transparent
            opacity={isHoldingTarget ? 0.9 : 0.4}
          />
        </mesh>
      </group>

      {/* Dynamic Stabilizing Hold / Tension Line (World Space) */}
      {isHoldingTarget && targetPosition && (
        <line>
          <bufferGeometry ref={lineGeometryRef} />
          <lineBasicMaterial color="#10b981" linewidth={2} transparent opacity={0.85} />
        </line>
      )}
    </group>
  );
};
