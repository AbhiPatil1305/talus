import { describe, it, expect } from 'vitest';
import { BASIC_INCISION_PROCEDURE } from './procedureConfig';
import { validateEvent, evaluateSession } from './assessment';
import { SimulationEvent } from '../../shared/types';

describe('TALUS Assessment & Procedure Logic', () => {
  const startTime = 1000;
  const endTime = 45000; // 44 seconds

  it('correctly validates a sequential checkpoint progression', () => {
    const completed: string[] = [];

    // Step 1
    const res1 = validateEvent(
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_01_PREP', timestamp: 2000 },
      BASIC_INCISION_PROCEDURE,
      completed
    );
    expect(res1.isValid).toBe(true);
    completed.push('CP_01_PREP');

    // Step 2
    const res2 = validateEvent(
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_02_ENGAGE', timestamp: 4000 },
      BASIC_INCISION_PROCEDURE,
      completed
    );
    expect(res2.isValid).toBe(true);
    completed.push('CP_02_ENGAGE');

    // Step 3
    const res3 = validateEvent(
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_03_TRAVERSE', timestamp: 8000 },
      BASIC_INCISION_PROCEDURE,
      completed
    );
    expect(res3.isValid).toBe(true);
    completed.push('CP_03_TRAVERSE');

    // Step 4
    const res4 = validateEvent(
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_04_COMPLETE', timestamp: 12000 },
      BASIC_INCISION_PROCEDURE,
      completed
    );
    expect(res4.isValid).toBe(true);
  });

  it('rejects out-of-order checkpoint attempts', () => {
    const completed: string[] = ['CP_01_PREP'];

    // Attempting step 3 before step 2
    const res = validateEvent(
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_03_TRAVERSE', timestamp: 3000 },
      BASIC_INCISION_PROCEDURE,
      completed
    );
    expect(res.isValid).toBe(false);
    expect(res.reason).toContain('Checkpoint out of sequence');
  });

  it('rejects duplicate checkpoint submissions', () => {
    const completed: string[] = ['CP_01_PREP'];

    const res = validateEvent(
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_01_PREP', timestamp: 3000 },
      BASIC_INCISION_PROCEDURE,
      completed
    );
    expect(res.isValid).toBe(false);
    expect(res.reason).toContain('Duplicate submission ignored');
  });

  it('scores a flawless 4-checkpoint run with 100% and passing status', () => {
    const events: SimulationEvent[] = [
      { type: 'SIMULATION_STARTED', procedureId: BASIC_INCISION_PROCEDURE.id, timestamp: 1000 },
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_01_PREP', timestamp: 5000 },
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_02_ENGAGE', timestamp: 10000 },
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_03_TRAVERSE', timestamp: 20000 },
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_04_COMPLETE', timestamp: 30000 },
    ];

    const result = evaluateSession(events, BASIC_INCISION_PROCEDURE, startTime, endTime);

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.errorCount).toBe(0);
    expect(result.completedCheckpointIds.length).toBe(4);
    expect(result.feedback.some((f) => f.id === 'fb_summary_pass')).toBe(true);
  });

  it('penalizes invalid actions and out-of-order attempts deterministically', () => {
    const events: SimulationEvent[] = [
      { type: 'SIMULATION_STARTED', procedureId: BASIC_INCISION_PROCEDURE.id, timestamp: 1000 },
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_01_PREP', timestamp: 5000 },
      // Invalid boundary jump
      { type: 'INVALID_ACTION', reason: 'Excessive lateral deviation from guide line', timestamp: 7000 },
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_02_ENGAGE', timestamp: 10000 },
      // Out of order attempt: step 4 before step 3
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_04_COMPLETE', timestamp: 15000 },
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_03_TRAVERSE', timestamp: 20000 },
      { type: 'CHECKPOINT_COMPLETED', checkpointId: 'CP_04_COMPLETE', timestamp: 25000 },
    ];

    const result = evaluateSession(events, BASIC_INCISION_PROCEDURE, startTime, endTime);

    // 4 valid checkpoints = 100 pts
    // 1 invalid action = -15 pts
    // 1 out-of-order attempt = -20 pts
    // Total = 65 pts
    expect(result.score).toBe(65);
    expect(result.errorCount).toBe(2);
    expect(result.passed).toBe(false); // below 70 threshold
    expect(result.completedCheckpointIds.length).toBe(4);
  });
});
