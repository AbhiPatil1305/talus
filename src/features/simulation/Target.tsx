import React from 'react';
import { Checkpoint } from '../../shared/types';

interface TargetProps {
  checkpoints: Checkpoint[];
  completedIds: string[];
  currentCheckpointId: string | null;
}

/**
 * 3D Representation of Surgical Skin Markings (Gentian-Violet Pen)
 * and anatomical landmark guidance crosshairs on the operative field.
 */
export const Targets: React.FC<TargetProps> = ({
  checkpoints,
  completedIds,
  currentCheckpointId,
}) => {
  return (
    <group>
      {/* Surgical Skin Pen Marking (Dashed Gentian Violet Incision Line) */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 0.04]} />
        <meshBasicMaterial color="#581c87" /> {/* Surgical violet marker */}
      </mesh>

      {/* Crosshatch Guideline Marks across incision */}
      {[-1.5, -0.75, 0.0, 0.75, 1.5].map((xPos, idx) => (
        <mesh key={idx} position={[xPos, 0.082, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.22, 0.02]} />
          <meshBasicMaterial color="#6b21a8" />
        </mesh>
      ))}

      {/* Landmark Nodes */}
      {checkpoints.map((cp) => {
        const isCompleted = completedIds.includes(cp.id);
        const isCurrent = currentCheckpointId === cp.id;

        let nodeColor = '#6b21a8'; // Surgical violet default
        let emissiveIntensity = 0.2;

        if (isCompleted) {
          nodeColor = '#10b981'; // Completed emerald
          emissiveIntensity = 0.6;
        } else if (isCurrent) {
          nodeColor = '#06b6d4'; // Current active cyan
          emissiveIntensity = 0.9;
        }

        const [tx, ty, tz] = cp.targetPosition;

        return (
          <group key={cp.id} position={[tx, ty + 0.08, tz]}>
            {/* Surgical Marking Crosshair Bead */}
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={emissiveIntensity}
                roughness={0.2}
              />
            </mesh>

            {/* Tolerance Boundary Circle */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[cp.toleranceRadius - 0.03, cp.toleranceRadius, 32]} />
              <meshBasicMaterial
                color={nodeColor}
                transparent
                opacity={isCurrent ? 0.8 : isCompleted ? 0.35 : 0.2}
              />
            </mesh>

            {/* Anatomical Landmark Step Badge */}
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
              <meshStandardMaterial
                color={isCurrent ? '#06b6d4' : isCompleted ? '#10b981' : '#334155'}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
