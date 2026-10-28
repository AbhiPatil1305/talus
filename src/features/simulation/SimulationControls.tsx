import React, { useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { globalHandTracker } from '../hand-tracking/HandTracking';
import { globalInputAdapter } from '../hand-tracking/InputAdapter';

interface SimulationControlsProps {
  onTriggerInvalidAction: (reason: string) => void;
  onReset: () => void;
  onFinishSession: () => void;
  isComplete: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  onTriggerInvalidAction,
  onReset,
  onFinishSession,
  isComplete,
}) => {
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamLoading, setWebcamLoading] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleWebcam = async () => {
    if (webcamActive) {
      globalHandTracker.stopWebcam();
      setWebcamActive(false);
      setWebcamError(null);
    } else {
      if (!videoRef.current) return;
      setWebcamLoading(true);
      setWebcamError(null);

      const success = await globalHandTracker.startWebcam(
        videoRef.current,
        (normX, normY, isPinching, confidence) => {
          globalInputAdapter.updateHandInput(normX, normY, isPinching, confidence);
        }
      );

      setWebcamLoading(false);
      if (success) {
        setWebcamActive(true);
      } else {
        setWebcamError(
          globalHandTracker.status.error ||
            'Webcam unavailable. Mouse fallback remains 100% active.'
        );
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
      {/* Hidden/Pip video element for MediaPipe local frame processing */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <video
            ref={videoRef}
            className={`w-28 h-20 bg-slate-950 rounded-lg object-cover border ${
              webcamActive ? 'border-cyan-500' : 'border-slate-800 hidden'
            }`}
            playsInline
            muted
          />
          {webcamActive && (
            <span className="absolute bottom-1 right-1 bg-cyan-900/90 text-cyan-200 text-[10px] px-1.5 py-0.5 rounded font-mono">
              Live Pinch
            </span>
          )}
        </div>

        <div>
          <button
            onClick={toggleWebcam}
            disabled={webcamLoading}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              webcamActive
                ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {webcamActive ? (
              <>
                <CameraOff className="w-4 h-4 text-rose-400" />
                <span>Disable Hand Tracking</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>{webcamLoading ? 'Starting Camera...' : 'Enable Hand Tracking (Webcam)'}</span>
              </>
            )}
          </button>
          {webcamError && (
            <p className="text-[11px] text-amber-400 mt-1 max-w-xs">{webcamError}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-3">
        {/* Intentional Invalid Action Demonstration button for hackathon demo */}
        <button
          onClick={() =>
            onTriggerInvalidAction('Lateral tremor / rapid excursion beyond incision boundary')
          }
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-medium rounded-lg border border-amber-800/80 transition-colors"
          title="Demo rule penalty: inject an invalid movement event to test deterministic scoring"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Demo Invalid Action</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {/* Finish & View Summary */}
        <button
          onClick={onFinishSession}
          className={`inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
            isComplete
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isComplete ? 'Complete & View Assessment' : 'Conclude Session'}</span>
        </button>
      </div>
    </div>
  );
};
