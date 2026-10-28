/**
 * TALUS Shared Technical Contracts
 * 
 * Crucial contract definitions agreed upon by all team members:
 * - Member 1: Frontend & Integration Lead
 * - Member 2: 3D Simulation Engineer
 * - Member 3: Computer Vision / Input Engineer
 * - Member 4: Procedure Logic & Assessment Engineer
 */

// ==========================================
// 1. Simulation Events Contract
// ==========================================

export type SimulationEventType =
  | 'TARGET_SELECTED'
  | 'CHECKPOINT_COMPLETED'
  | 'INVALID_ACTION'
  | 'SIMULATION_STARTED'
  | 'SIMULATION_RESET';

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
// 2. Normalized Input Adapter Contract
// ==========================================

export type InputSource = 'mouse' | 'hand';

export interface NormalizedInput {
  /** Normalized X in range [-1, 1] across the viewport/canvas */
  x: number;
  /** Normalized Y in range [-1, 1] across the viewport/canvas */
  y: number;
  /** Whether the tool is actively engaged (mouse pressed or hand pinch detected) */
  isSelecting: boolean;
  /** Origin input device */
  source: InputSource;
  /** High precision millisecond timestamp */
  timestamp: number;
  /** Optional depth or pinch confidence factor [0, 1] */
  confidence?: number;
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

export type ViewState = 'dashboard' | 'simulation' | 'summary';
