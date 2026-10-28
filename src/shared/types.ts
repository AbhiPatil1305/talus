/**
 * TALUS Shared Technical Contracts
 *
 * Crucial contract definitions for 3D Surgical Simulation,
 * Bimanual Hand Tracking, Real Anatomy Models, and Deterministic Assessment.
 */

// ==========================================
// 1. Simulation Events Contract
// ==========================================

export type SimulationEventType =
  | 'TARGET_SELECTED'
  | 'CHECKPOINT_COMPLETED'
  | 'INVALID_ACTION'
  | 'SIMULATION_STARTED'
  | 'SIMULATION_RESET'
  | 'LEFT_STABILIZATION_ACQUIRED'
  | 'LEFT_STABILIZATION_RELEASED'
  | 'RIGHT_ENGAGED'
  | 'RIGHT_RELEASED'
  | 'TRAJECTORY_DEVIATION';

export type SimulationEvent =
  | {
      type: 'SIMULATION_STARTED';
      procedureId: string;
      timestamp: number;
    }
  | {
      type: 'TARGET_SELECTED';
      targetId: string;
      position?: [number, number, number];
      timestamp: number;
    }
  | {
      type: 'LEFT_STABILIZATION_ACQUIRED';
      targetId: string;
      position?: [number, number, number];
      timestamp: number;
    }
  | {
      type: 'LEFT_STABILIZATION_RELEASED';
      targetId: string;
      timestamp: number;
    }
  | {
      type: 'RIGHT_ENGAGED';
      checkpointId: string;
      position?: [number, number, number];
      timestamp: number;
    }
  | {
      type: 'RIGHT_RELEASED';
      checkpointId: string;
      timestamp: number;
    }
  | {
      type: 'TRAJECTORY_DEVIATION';
      checkpointId: string;
      deviationDistance: number;
      timestamp: number;
    }
  | {
      type: 'CHECKPOINT_COMPLETED';
      checkpointId: string;
      precisionScore?: number;
      timestamp: number;
    }
  | {
      type: 'INVALID_ACTION';
      reason: string;
      checkpointId?: string;
      timestamp: number;
    }
  | {
      type: 'SIMULATION_RESET';
      timestamp: number;
    };

// ==========================================
// 2. Bimanual & Normalized Input Contracts
// ==========================================

export type InputSource = 'mouse' | 'hand' | 'hybrid';

export interface SingleHandState {
  tracked: boolean;
  x: number; // [-1, 1] normalized
  y: number; // [-1, 1] normalized
  z?: number;
  isPinching: boolean;
  pinchDistance: number;
  confidence: number;
  rawHandedness?: 'Left' | 'Right';
}

export type BimanualCoordinationState =
  | 'IDLE'
  | 'TARGET_SELECTED'
  | 'LEFT_TOOL_HOLDING'
  | 'RIGHT_TOOL_ENGAGED'
  | 'TRACING'
  | 'CHECKPOINT_COMPLETED'
  | 'INVALID_ACTION';

export interface BimanualTrackingState {
  leftHand: SingleHandState;
  rightHand: SingleHandState;
  coordinationState: BimanualCoordinationState;
  source: InputSource;
  timestamp: number;
}

export interface NormalizedInput {
  /** Normalized X in range [-1, 1] across viewport (active right-hand tool or primary cursor) */
  x: number;
  /** Normalized Y in range [-1, 1] across viewport (active right-hand tool or primary cursor) */
  y: number;
  /** Whether the active tool is actively engaged */
  isSelecting: boolean;
  /** Origin input device */
  source: InputSource;
  /** High precision millisecond timestamp */
  timestamp: number;
  /** Optional depth or pinch confidence factor [0, 1] */
  confidence?: number;
  /** Full bimanual tracking state */
  bimanual?: BimanualTrackingState;
}

// ==========================================
// 3. Procedure & Checkpoint Configuration
// ==========================================

export interface Checkpoint {
  id: string;
  order: number;
  title: string;
  description: string;
  targetPosition: [number, number, number]; // [x, y, z] in 3D world space
  toleranceRadius: number; // Radius in units for valid engagement
  requiredAction: 'position' | 'select' | 'traverse' | 'release';
  penaltyOnSkip: number;
  requiresStabilization?: boolean; // True if left-hand forceps hold is required
  targetMeshName?: string; // Optional real mesh node
  trajectoryStart?: [number, number, number];
  trajectoryEnd?: [number, number, number];
}

export interface ProcedureRubric {
  version: string;
  maxScore: number;
  passingScore: number;
  baseCheckpointPoints: number;
  invalidActionPenalty: number;
  outOfOrderPenalty: number;
  timeBonusThresholdMs?: number;
}

export interface ProcedureConfig {
  id: string;
  version: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  learningObjective: string;
  clinicalContext: string;
  checkpoints: Checkpoint[];
  rubric: ProcedureRubric;
}

// ==========================================
// 4. Assessment & Session Result Contract
// ==========================================

export interface FeedbackMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  checkpointId?: string;
}

export interface AssessmentResult {
  procedureId: string;
  rubricVersion: string;
  score: number; // Deterministic [0, 100]
  passed: boolean;
  completedCheckpointIds: string[];
  totalCheckpoints: number;
  errorCount: number;
  feedback: FeedbackMessage[];
  events: SimulationEvent[];
  startedAt: number;
  completedAt: number;
  durationMs: number;
}

export interface SessionSummary {
  sessionId: string;
  procedureId: string;
  procedureTitle: string;
  result: AssessmentResult;
  completedAt: string; // ISO string
}

// ==========================================
// 5. Application View Navigation State
// ==========================================

export type ViewState = 'dashboard' | 'simulation' | 'explorer' | 'summary';

// ==========================================
// 6. 3D Anatomy Explorer Contracts
// ==========================================

export type AnatomicalSystem =
  | 'cardiovascular'
  | 'respiratory'
  | 'skeletal'
  | 'integumentary'
  | 'all';

export interface AnatomicalStructure {
  id: string;
  name: string;
  latinName: string;
  system: AnatomicalSystem;
  meshName: string;
  modelUrl: string;
  category: string;
  description: string;
  function: string;
  clinicalRelevance: string;
  surgicalProcedureId?: string;
}
