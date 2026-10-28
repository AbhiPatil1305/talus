import React from 'react';
import { Checkpoint } from '../../shared/types';

interface TargetProps {
  checkpoints: Checkpoint[];
  completedIds: string[];
  currentCheckpointId: string | null;
}

/**
 * 3D Representation of surgical training targets and incision guideline.
 */
export const Targets: React.FC<TargetProps> = ({
  checkpoints,
  completedIds,
  currentCheckpointId,
}) => {
  return (
    <group>
      {/* Practice Pad Incision Guideline Track */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 0.08]} />
        <meshBasicMaterial color="#475569" />
      </mesh>

      {/* Trajectory Dashed Center Mark */}
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.0, 0.02]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {/* Target Nodes */}
      {checkpoints.map((cp) => {
        const isCompleted = completedIds.includes(cp.id);
        const isCurrent = currentCheckpointId === cp.id;

        let nodeColor = '#64748b'; // Pending
        let emissiveIntensity = 0.1;

        if (isCompleted) {
          nodeColor = '#10b981'; // Completed emerald
          emissiveIntensity = 0.5;
        } else if (isCurrent) {
          nodeColor = '#06b6d4'; // Current active cyan
          emissiveIntensity = 0.8;
        }

        const [tx, ty, tz] = cp.targetPosition;

        return (
          <group key={cp.id} position={[tx, ty, tz]}>
            {/* Target Core Bead */}
            <mesh position={[0, 0.06, 0]}>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={emissiveIntensity}
                roughness={0.2}
              />
            </mesh>

            {/* Tolerance Boundary Ring on Surface */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[cp.toleranceRadius - 0.04, cp.toleranceRadius, 32]} />
              <meshBasicMaterial
                color={nodeColor}
                transparent
                opacity={isCurrent ? 0.8 : isCompleted ? 0.3 : 0.15}
              />
            </mesh>

            {/* Order Marker Tag */}
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
              <meshStandardMaterial color={isCurrent ? '#06b6d4' : '#1e293b'} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
