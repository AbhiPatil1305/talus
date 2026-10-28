import {
  SimulationEvent,
  ProcedureConfig,
  AssessmentResult,
  FeedbackMessage,
  SessionSummary,
} from '../../shared/types';

const STORAGE_KEY_PREFIX = 'talus_session_history_v1';

/**
 * Validates a newly incoming simulation event against the procedure configuration
 * and current completed checkpoints.
 */
export function validateEvent(
  event: SimulationEvent,
  config: ProcedureConfig,
  completedCheckpointIds: string[]
): { isValid: boolean; reason?: string; checkpointId?: string } {
  if (event.type !== 'CHECKPOINT_COMPLETED') {
    return { isValid: true };
  }

  const checkpointIndex = config.checkpoints.findIndex((cp) => cp.id === event.checkpointId);
  if (checkpointIndex === -1) {
    return {
      isValid: false,
      reason: `Unknown checkpoint ID: ${event.checkpointId}`,
      checkpointId: event.checkpointId,
    };
  }

  // Check for duplicates
  if (completedCheckpointIds.includes(event.checkpointId)) {
    return {
      isValid: false,
      reason: `Checkpoint ${event.checkpointId} was already completed. Duplicate submission ignored.`,
      checkpointId: event.checkpointId,
    };
  }

  // Check order: must complete checkpoints in sequence
  const expectedOrder = completedCheckpointIds.length + 1;
  const targetCheckpoint = config.checkpoints[checkpointIndex];

  if (targetCheckpoint.order !== expectedOrder) {
    return {
      isValid: false,
      reason: `Checkpoint out of sequence: Expected step ${expectedOrder} (${config.checkpoints[expectedOrder - 1]?.title}), but received step ${targetCheckpoint.order} (${targetCheckpoint.title}).`,
      checkpointId: event.checkpointId,
    };
  }

  return { isValid: true, checkpointId: event.checkpointId };
}

/**
 * Deterministically evaluates a sequence of simulation events and returns
 * a comprehensive assessment result according to the procedure rubric.
 */
export function evaluateSession(
  events: SimulationEvent[],
  config: ProcedureConfig,
  startTime: number,
  endTime: number
): AssessmentResult {
  const completedCheckpointIds: string[] = [];
  const feedback: FeedbackMessage[] = [];
  let rawScore = 0;
  let errorCount = 0;

  for (const event of events) {
    if (event.type === 'CHECKPOINT_COMPLETED') {
      const validation = validateEvent(event, config, completedCheckpointIds);
      if (validation.isValid) {
        completedCheckpointIds.push(event.checkpointId);
        rawScore += config.rubric.baseCheckpointPoints;
        const cp = config.checkpoints.find((c) => c.id === event.checkpointId);
        feedback.push({
          id: `fb_${feedback.length + 1}`,
          type: 'success',
          message: `Checkpoint ${completedCheckpointIds.length}/${config.checkpoints.length} completed: ${cp?.title ?? event.checkpointId}.`,
          timestamp: event.timestamp,
          checkpointId: event.checkpointId,
        });
      } else {
        errorCount++;
        rawScore = Math.max(0, rawScore - config.rubric.outOfOrderPenalty);
        feedback.push({
          id: `fb_${feedback.length + 1}`,
          type: 'error',
          message: validation.reason || 'Out of order action attempted.',
          timestamp: event.timestamp,
          checkpointId: event.checkpointId,
        });
      }
    } else if (event.type === 'INVALID_ACTION') {
      errorCount++;
      rawScore = Math.max(0, rawScore - config.rubric.invalidActionPenalty);
      feedback.push({
        id: `fb_${feedback.length + 1}`,
        type: 'warning',
        message: `Boundary violation or invalid gesture: ${event.reason}. Penalty applied (-${config.rubric.invalidActionPenalty} pts).`,
        timestamp: event.timestamp,
        checkpointId: event.checkpointId,
      });
    }
  }

  // Ensure score stays bounded [0, 100]
  const finalScore = Math.min(config.rubric.maxScore, Math.max(0, rawScore));
  const passed =
    completedCheckpointIds.length === config.checkpoints.length &&
    finalScore >= config.rubric.passingScore;

  if (completedCheckpointIds.length === config.checkpoints.length) {
    if (passed) {
      feedback.push({
        id: `fb_summary_pass`,
        type: 'success',
        message: `Exercise completed successfully! All ${config.checkpoints.length} checkpoints verified with satisfactory technique.`,
        timestamp: endTime,
      });
    } else {
      feedback.push({
        id: `fb_summary_retry`,
        type: 'warning',
        message: `All checkpoints reached, but score (${finalScore}%) fell below passing threshold (${config.rubric.passingScore}%). Focus on minimizing boundary violations.`,
        timestamp: endTime,
      });
    }
  } else {
    feedback.push({
      id: `fb_summary_incomplete`,
      type: 'info',
      message: `Incomplete session: ${completedCheckpointIds.length} of ${config.checkpoints.length} checkpoints verified.`,
      timestamp: endTime,
    });
  }

  return {
    procedureId: config.id,
    rubricVersion: config.rubric.version,
    score: finalScore,
    passed,
    completedCheckpointIds,
    totalCheckpoints: config.checkpoints.length,
    errorCount,
    feedback,
    events,
    startedAt: startTime,
    completedAt: endTime,
    durationMs: Math.max(0, endTime - startTime),
  };
}

// ==========================================
// Safe LocalStorage Persistence
// ==========================================

export function saveSessionSummary(summary: SessionSummary): void {
  try {
    const existing = loadSessionHistory();
    const updated = [summary, ...existing.filter((s) => s.sessionId !== summary.sessionId)].slice(
      0,
      20
    );
    localStorage.setItem(STORAGE_KEY_PREFIX, JSON.stringify(updated));
  } catch (err) {
    console.warn('Unable to persist session summary to localStorage:', err);
  }
}

export function loadSessionHistory(): SessionSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('Failed to parse session history from localStorage:', err);
    return [];
  }
}

export function clearSessionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX);
  } catch (err) {
    console.warn('Failed to clear session history:', err);
  }
}
