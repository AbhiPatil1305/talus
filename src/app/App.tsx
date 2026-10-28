import React, { useState, useRef, useCallback } from 'react';
import { DisclaimerBanner } from '../components/feedback/DisclaimerBanner';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { DashboardView } from '../features/dashboard/DashboardView';
import { SimulationScene } from '../features/simulation/SimulationScene';
import { SimulationControls } from '../features/simulation/SimulationControls';
import { CompletionSummary } from '../features/assessment/CompletionSummary';
import {
  TALUS_ARTHROTOMY_PROCEDURE,
  MCBURNEY_APPENDECTOMY_PROCEDURE,
} from '../features/assessment/procedureConfig';
import {
  evaluateSession,
  saveSessionSummary,
  validateEvent,
} from '../features/assessment/assessment';
import {
  ViewState,
  SimulationEvent,
  AssessmentResult,
  SessionSummary,
  ProcedureConfig,
} from '../shared/types';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('dashboard');
  const [currentProcedure, setCurrentProcedure] = useState<ProcedureConfig>(TALUS_ARTHROTOMY_PROCEDURE);
  const [completedCheckpointIds, setCompletedCheckpointIds] = useState<string[]>([]);
  const [recordedEvents, setRecordedEvents] = useState<SimulationEvent[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (text: string, type: 'success' | 'warning' | 'error' | 'info') => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToastMessage({ text, type });
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    },
    []
  );

  const startSimulation = useCallback((procedureId: string = TALUS_ARTHROTOMY_PROCEDURE.id) => {
    const proc =
      procedureId === MCBURNEY_APPENDECTOMY_PROCEDURE.id
        ? MCBURNEY_APPENDECTOMY_PROCEDURE
        : TALUS_ARTHROTOMY_PROCEDURE;
    setCurrentProcedure(proc);
    const now = Date.now();
    setCompletedCheckpointIds([]);
    setRecordedEvents([
      {
        type: 'SIMULATION_STARTED',
        procedureId: proc.id,
        timestamp: now,
      },
    ]);
    setSessionStartTime(now);
    setAssessmentResult(null);
    setViewState('simulation');
    showToast(
      `${proc.title} initialized. Follow surgical landmark guidance.`,
      'info'
    );
  }, [showToast]);

  const handleSimulationEvent = useCallback(
    (event: SimulationEvent) => {
      setRecordedEvents((prev) => [...prev, event]);

      if (event.type === 'CHECKPOINT_COMPLETED') {
        const validation = validateEvent(
          event,
          currentProcedure,
          completedCheckpointIds
        );

        if (validation.isValid) {
          const updated = [...completedCheckpointIds, event.checkpointId];
          setCompletedCheckpointIds(updated);
          const cp = currentProcedure.checkpoints.find(
            (c) => c.id === event.checkpointId
          );
          showToast(
            `Step ${updated.length}/${currentProcedure.checkpoints.length} verified: ${cp?.title}`,
            'success'
          );

          if (updated.length === currentProcedure.checkpoints.length) {
            showToast(
              'All anatomical landmarks verified! Conclude session to view assessment.',
              'success'
            );
          }
        } else {
          showToast(validation.reason || 'Invalid sequence attempt.', 'warning');
        }
      } else if (event.type === 'INVALID_ACTION') {
        showToast(
          `Surgical safety violation: ${event.reason} (-15 pts)`,
          'error'
        );
      }
    },
    [completedCheckpointIds, currentProcedure, showToast]
  );

  const handleTriggerInvalidAction = (reason: string) => {
    const event: SimulationEvent = {
      type: 'INVALID_ACTION',
      reason,
      timestamp: Date.now(),
    };
    handleSimulationEvent(event);
  };

  const handleResetSimulation = () => {
    const now = Date.now();
    setCompletedCheckpointIds([]);
    setRecordedEvents([
      {
        type: 'SIMULATION_STARTED',
        procedureId: currentProcedure.id,
        timestamp: now,
      },
    ]);
    setSessionStartTime(now);
    showToast('Simulation state reset to beginning.', 'info');
  };

  const handleFinishSession = () => {
    const endTime = Date.now();
    const result = evaluateSession(
      recordedEvents,
      currentProcedure,
      sessionStartTime,
      endTime
    );

    setAssessmentResult(result);

    const summary: SessionSummary = {
      sessionId: `session_${Date.now()}`,
      procedureId: currentProcedure.id,
      procedureTitle: currentProcedure.title,
      result,
      completedAt: new Date().toISOString(),
    };
    saveSessionSummary(summary);

    setViewState('summary');
  };

  const isAllCheckpointsComplete =
    completedCheckpointIds.length === currentProcedure.checkpoints.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      <DisclaimerBanner />
      <Header currentView={viewState} onNavigate={(view) => setViewState(view)} />

      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in max-w-sm">
          <div
            className={`p-3.5 rounded-xl border shadow-xl flex items-start space-x-3 text-xs backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-800 text-rose-200'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950/90 border-amber-800 text-amber-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            {toastMessage.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {toastMessage.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            {toastMessage.type === 'warning' && (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            {toastMessage.type === 'info' && (
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewState === 'dashboard' && (
          <DashboardView onStartSimulation={startSimulation} />
        )}

        {viewState === 'simulation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  {currentProcedure.category} &bull; {currentProcedure.title}
                </span>
                <h1 className="text-xl font-bold text-white">
                  {currentProcedure.title}
                </h1>
              </div>
              <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Operating Theatre &bull; Deterministic Assessment</span>
              </div>
            </div>

            {/* 3D Canvas Scene */}
            <SimulationScene
              procedure={currentProcedure}
              completedCheckpointIds={completedCheckpointIds}
              onSimulationEvent={handleSimulationEvent}
              onReset={handleResetSimulation}
            />

            {/* Controls Toolbar */}
            <SimulationControls
              onTriggerInvalidAction={handleTriggerInvalidAction}
              onReset={handleResetSimulation}
              onFinishSession={handleFinishSession}
              isComplete={isAllCheckpointsComplete}
            />
          </div>
        )}

        {viewState === 'summary' && assessmentResult && (
          <CompletionSummary
            result={assessmentResult}
            procedure={currentProcedure}
            onRetry={() => startSimulation(currentProcedure.id)}
            onBackToDashboard={() => setViewState('dashboard')}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
