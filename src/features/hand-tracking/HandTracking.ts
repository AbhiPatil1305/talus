import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { BimanualTrackingState, SingleHandState } from '../../shared/types';

export interface HandTrackingStatus {
  isInitialized: boolean;
  isRunning: boolean;
  hasPermission: boolean;
  error: string | null;
  handsDetectedCount: number;
  fps: number;
}

export type BimanualCoordinatesCallback = (state: BimanualTrackingState) => void;

/**
 * Local-only MediaPipe Bimanual Hand Landmarker service.
 * Tracks two hands concurrently (left stabilizer, right active tool).
 * All frame inference is processed locally inside WebAssembly; zero video frames are transmitted.
 */
export class HandTrackingService {
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private onCoordinates: BimanualCoordinatesCallback | null = null;

  // Smoothing states to eliminate high-frequency webcam landmark jitter
  private smoothedLeft = { x: -0.5, y: 0.0, pinchDist: 0.2 };
  private smoothedRight = { x: 0.5, y: 0.0, pinchDist: 0.2 };
  private frameCount = 0;
  private lastFpsUpdate = performance.now();
  private currentFps = 0;

  public status: HandTrackingStatus = {
    isInitialized: false,
    isRunning: false,
    hasPermission: false,
    error: null,
    handsDetectedCount: 0,
    fps: 0,
  };

  /**
   * Initialize MediaPipe Vision Task with two-hand support
   */
  public async initialize(): Promise<boolean> {
    if (this.status.isInitialized && this.handLandmarker) return true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2, // Bimanual detection!
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.status.isInitialized = true;
      this.status.error = null;
      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to initialize MediaPipe Hand Landmarker';
      this.status.error = errorMsg;
      console.warn('MediaPipe initialization warning (mouse fallback active):', err);
      return false;
    }
  }

  /**
   * Start webcam video stream and continuous landmark detection
   */
  public async startWebcam(
    videoElement: HTMLVideoElement,
    callback: BimanualCoordinatesCallback
  ): Promise<boolean> {
    this.videoElement = videoElement;
    this.onCoordinates = callback;

    if (!this.status.isInitialized) {
      const ok = await this.initialize();
      if (!ok) return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.videoElement.srcObject = stream;
      await this.videoElement.play();

      this.status.hasPermission = true;
      this.status.isRunning = true;
      this.status.error = null;
      this.processVideoFrames();
      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Webcam permission denied or camera device unavailable';
      this.status.error = errorMsg;
      this.status.hasPermission = false;
      this.status.isRunning = false;
      return false;
    }
  }

  /**
   * Process video frames via requestAnimationFrame
   */
  private processVideoFrames = (): void => {
    if (!this.status.isRunning || !this.videoElement || !this.handLandmarker) return;

    const now = performance.now();
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.status.fps = this.currentFps;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    if (
      this.videoElement.currentTime > 0 &&
      !this.videoElement.paused &&
      !this.videoElement.ended
    ) {
      try {
        const results = this.handLandmarker.detectForVideo(this.videoElement, now);

        const handsCount = results.landmarks ? results.landmarks.length : 0;
        this.status.handsDetectedCount = handsCount;

        const leftHandState: SingleHandState = {
          tracked: false,
          x: this.smoothedLeft.x,
          y: this.smoothedLeft.y,
          isPinching: false,
          pinchDistance: 1.0,
          confidence: 0,
        };

        const rightHandState: SingleHandState = {
          tracked: false,
          x: this.smoothedRight.x,
          y: this.smoothedRight.y,
          isPinching: false,
          pinchDistance: 1.0,
          confidence: 0,
        };

        if (results.landmarks && results.landmarks.length > 0) {
          const alpha = 0.45; // Smoothing factor (low pass filter)

          for (let i = 0; i < results.landmarks.length; i++) {
            const landmarks = results.landmarks[i];
            const handednessCategory = results.handednesses?.[i]?.[0];
            const rawCategory = handednessCategory?.categoryName || (i === 0 ? 'Right' : 'Left');
            const score = handednessCategory?.score || 0.85;

            // Landmark 8: Index fingertip
            const indexTip = landmarks[8];
            // Landmark 4: Thumb tip
            const thumbTip = landmarks[4];

            // Euclidean pinch distance in normalized hand coordinates
            const dx = indexTip.x - thumbTip.x;
            const dy = indexTip.y - thumbTip.y;
            const dz = indexTip.z - thumbTip.z;
            const rawPinchDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // In mirrored selfie video:
            // Mirrored X: (1 - indexTip.x) * 2 - 1
            // Inverted Y: -(indexTip.y * 2 - 1)
            const rawNormX = (1 - indexTip.x) * 2 - 1;
            const rawNormY = -(indexTip.y * 2 - 1);

            // Handedness in mirrored webcam view:
            // MediaPipe assigns 'Left' to the subject's anatomical left hand.
            // On a mirrored display, the user's left hand appears on the left side (normX < 0).
            const isLeft = rawCategory === 'Left' || rawNormX < 0;

            if (isLeft) {
              this.smoothedLeft.x = this.smoothedLeft.x * (1 - alpha) + rawNormX * alpha;
              this.smoothedLeft.y = this.smoothedLeft.y * (1 - alpha) + rawNormY * alpha;
              this.smoothedLeft.pinchDist =
                this.smoothedLeft.pinchDist * (1 - alpha) + rawPinchDist * alpha;

              leftHandState.tracked = true;
              leftHandState.x = Math.max(-1, Math.min(1, this.smoothedLeft.x));
              leftHandState.y = Math.max(-1, Math.min(1, this.smoothedLeft.y));
              leftHandState.pinchDistance = this.smoothedLeft.pinchDist;
              leftHandState.isPinching = this.smoothedLeft.pinchDist < 0.08;
              leftHandState.confidence = score;
              leftHandState.rawHandedness = 'Left';
            } else {
              this.smoothedRight.x = this.smoothedRight.x * (1 - alpha) + rawNormX * alpha;
              this.smoothedRight.y = this.smoothedRight.y * (1 - alpha) + rawNormY * alpha;
              this.smoothedRight.pinchDist =
                this.smoothedRight.pinchDist * (1 - alpha) + rawPinchDist * alpha;

              rightHandState.tracked = true;
              rightHandState.x = Math.max(-1, Math.min(1, this.smoothedRight.x));
              rightHandState.y = Math.max(-1, Math.min(1, this.smoothedRight.y));
              rightHandState.pinchDistance = this.smoothedRight.pinchDist;
              rightHandState.isPinching = this.smoothedRight.pinchDist < 0.08;
              rightHandState.confidence = score;
              rightHandState.rawHandedness = 'Right';
            }
          }
        }

        if (this.onCoordinates) {
          this.onCoordinates({
            leftHand: leftHandState,
            rightHand: rightHandState,
            coordinationState: 'IDLE',
            source: 'hand',
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        console.warn('Frame detection error:', err);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.processVideoFrames);
  };

  /**
   * Stop video stream and release webcam hardware
   */
  public stopWebcam(): void {
    this.status.isRunning = false;
    this.status.handsDetectedCount = 0;
    this.status.fps = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      this.videoElement.srcObject = null;
    }
  }
}

export const globalHandTracker = new HandTrackingService();
