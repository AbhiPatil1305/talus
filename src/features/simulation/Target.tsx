import React from 'react';
import { Checkpoint } from '../../shared/types';
import * as THREE from 'three';

interface TargetProps {
  checkpoints: Checkpoint[];
  completedIds: string[];
  currentCheckpointId: string | null;
  isLeftStabilized?: boolean;
  activeTipPosition?: [number, number, number] | null;
}

/**
 * Authentic Surgical Guidance Markers & Trajectory Indicators
 * Replaces primitive spheres and bars with refined surgical incision guides,
 * sterile landmark reticles, stabilization brackets, and dynamic cut path feedback.
 */
export const Targets: React.FC<TargetProps> = ({
  checkpoints,
  completedIds,
  currentCheckpointId,
  isLeftStabilized = false,
}) => {
  // Compute surgical trajectory path lines between sequential checkpoints
  const trajectorySegments = React.useMemo(() => {
    const segments: { start: [number, number, number]; end: [number, number, number]; isCurrent: boolean }[] = [];
    for (let i = 0; i < checkpoints.length - 1; i++) {
      const cpA = checkpoints[i];
      const cpB = checkpoints[i + 1];
      const isCurrent = currentCheckpointId === cpA.id || currentCheckpointId === cpB.id;
      segments.push({
        start: cpA.targetPosition,
        end: cpB.targetPosition,
        isCurrent,
      });
    }
    return segments;
  }, [checkpoints, currentCheckpointId]);

  return (
    <group>
      {/* 1. Surgical Incision Trajectory Path Guidelines */}
      {trajectorySegments.map((seg, idx) => {
        const startVec = new THREE.Vector3(...seg.start);
        const endVec = new THREE.Vector3(...seg.end);
        const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const distance = startVec.distanceTo(endVec);
        const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize();
        const orientation = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir
        );

        return (
          <group key={idx} position={[midPoint.x, 0.08, midPoint.z]} quaternion={orientation}>
            {/* Fine gentian violet surgical guideline */}
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, distance, 8]} />
              <meshBasicMaterial
                color={seg.isCurrent ? '#38bdf8' : '#7c3aed'}
                transparent
                opacity={seg.isCurrent ? 0.9 : 0.45}
              />
            </mesh>
          </group>
        );
      })}

      {/* 2. Anatomical Landmark Checkpoints */}
      {checkpoints.map((cp) => {
        const isCompleted = completedIds.includes(cp.id);
        const isCurrent = currentCheckpointId === cp.id;
        const [tx, ty, tz] = cp.targetPosition;

        let reticleColor = '#64748b'; // Inactive slate
        if (isCompleted) {
          reticleColor = '#10b981'; // Completed emerald
        } else if (isCurrent) {
          reticleColor = isLeftStabilized ? '#10b981' : '#06b6d4'; // Stabilized emerald or target cyan
        }

        return (
          <group key={cp.id} position={[tx, ty + 0.08, tz]}>
            {/* Precision Landmark Ground Reticle */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[cp.toleranceRadius - 0.03, cp.toleranceRadius, 32]} />
              <meshBasicMaterial
                color={reticleColor}
                transparent
                opacity={isCurrent ? 0.85 : isCompleted ? 0.35 : 0.2}
              />
            </mesh>

            {/* Inner Landmark Anchor Crosshair */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.03, 0.06, 16]} />
              <meshBasicMaterial
                color={reticleColor}
                transparent
                opacity={isCurrent ? 0.95 : 0.4}
              />
            </mesh>

            {/* Crosshair ticks */}
            {isCurrent && (
              <>
                <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[cp.toleranceRadius * 2.2, 0.012]} />
                  <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
                </mesh>
                <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                  <planeGeometry args={[cp.toleranceRadius * 2.2, 0.012]} />
                  <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
                </mesh>
              </>
            )}

            {/* Left-Hand Stabilization Bracket (When this landmark requires hold) */}
            {isCurrent && cp.requiresStabilization && (
              <group position={[0, 0.12, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[cp.toleranceRadius + 0.04, cp.toleranceRadius + 0.08, 16]} />
                  <meshBasicMaterial
                    color={isLeftStabilized ? '#10b981' : '#fbbf24'}
                    transparent
                    opacity={isLeftStabilized ? 0.9 : 0.6}
                  />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
