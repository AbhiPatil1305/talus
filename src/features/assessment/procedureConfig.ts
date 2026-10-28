import { ProcedureConfig } from '../../shared/types';

/**
 * Module 1: Basic Instrument Targeting & Incision Line Guidance
 * 
 * An educational prototype exercise focusing on steady-hand positioning,
 * entry point engagement, linear traversal along an anatomical marker,
 * and controlled exit release.
 */
export const BASIC_INCISION_PROCEDURE: ProcedureConfig = {
  id: 'proc_incision_guidance_01',
  version: '1.0.0',
  title: 'Basic Instrument Targeting & Incision Line Guidance',
  category: 'Foundation Skills',
  difficulty: 'Beginner',
  estimatedMinutes: 3,
  learningObjective: 'Master controlled instrument trajectory, entry-point targeting, and smooth linear incision tracking without excessive deviation.',
  clinicalContext: 'Proper instrument control and stable boundary respect are foundational to all open and laparoscopic surgical disciplines.',
  rubric: {
    version: '2026.1',
    maxScore: 100,
    passingScore: 70,
    baseCheckpointPoints: 25, // 4 checkpoints * 25 = 100
    invalidActionPenalty: 15,
    outOfOrderPenalty: 20,
    timeBonusThresholdMs: 60000,
  },
  checkpoints: [
    {
      id: 'CP_01_PREP',
      order: 1,
      title: 'Target Initial Entry Marker',
      description: 'Hover the virtual instrument tip over the green entry target at the start of the incision line.',
      targetPosition: [-2.0, 0.05, 0.0],
      toleranceRadius: 0.6,
      requiredAction: 'position',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_02_ENGAGE',
      order: 2,
      title: 'Engage Entry Point',
      description: 'Click and hold (or pinch) to initiate incision engagement at the entry target.',
      targetPosition: [-2.0, 0.05, 0.0],
      toleranceRadius: 0.6,
      requiredAction: 'select',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_03_TRAVERSE',
      order: 3,
      title: 'Trace Midpoint Trajectory',
      description: 'Maintain engagement while tracing steadily through the yellow midpoint guidance marker.',
      targetPosition: [0.0, 0.05, 0.0],
      toleranceRadius: 0.7,
      requiredAction: 'traverse',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_04_COMPLETE',
      order: 4,
      title: 'Terminal Boundary & Release',
      description: 'Reach the red terminal boundary marker and release engagement to complete the incision line.',
      targetPosition: [2.0, 0.05, 0.0],
      toleranceRadius: 0.6,
      requiredAction: 'release',
      penaltyOnSkip: 25,
    },
  ],
};
