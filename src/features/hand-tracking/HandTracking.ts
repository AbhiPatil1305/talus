import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export interface HandTrackingStatus {
  isInitialized: boolean;
  isRunning: boolean;
  hasPermission: boolean;
  error: string | null;
}

export type HandCoordinatesCallback = (
  normalizedX: number,
  normalizedY: number,
  isPinching: boolean,
  confidence: number
) => void;

/**
 * Local-only MediaPipe Hand Landmarker service.
 * Processes video frames entirely in browser memory; zero network streaming of video.
 */
export class HandTrackingService {
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private onCoordinates: HandCoordinatesCallback | null = null;

  public status: HandTrackingStatus = {
    isInitialized: false,
    isRunning: false,
    hasPermission: false,
    error: null,
  };

  /**
   * Initialize MediaPipe Vision Task
   */
  public async initialize(): Promise<boolean> {
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
        numHands: 1,
      });

      this.status.isInitialized = true;
      this.status.error = null;
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize MediaPipe Hand Landmarker';
      this.status.error = errorMsg;
      console.warn('MediaPipe initialization warning (mouse fallback remains active):', err);
      return false;
    }
  }

  /**
   * Start webcam video stream and continuous landmark detection
   */
  public async startWebcam(
    videoElement: HTMLVideoElement,
    callback: HandCoordinatesCallback
  ): Promise<boolean> {
    this.videoElement = videoElement;
    this.onCoordinates = callback;

    if (!this.status.isInitialized) {
      const ok = await this.initialize();
      if (!ok) return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      this.videoElement.srcObject = stream;
      await this.videoElement.play();

      this.status.hasPermission = true;
      this.status.isRunning = true;
      this.processVideoFrames();
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Camera access denied or unavailable';
      this.status.error = errorMsg;
      this.status.hasPermission = false;
      this.status.isRunning = false;
      return false;
    }
  }

  /**
   * Process individual video frames via requestAnimationFrame
   */
  private processVideoFrames = (): void => {
    if (!this.status.isRunning || !this.videoElement || !this.handLandmarker) return;

    if (this.videoElement.currentTime > 0 && !this.videoElement.paused && !this.videoElement.ended) {
      const startTimeMs = performance.now();
      try {
        const results = this.handLandmarker.detectForVideo(this.videoElement, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          // Landmark 8: Index fingertip
          const indexTip = landmarks[8];
          // Landmark 4: Thumb tip
          const thumbTip = landmarks[4];

          // Calculate pinch Euclidean distance
          const dx = indexTip.x - thumbTip.x;
          const dy = indexTip.y - thumbTip.y;
          const dz = indexTip.z - thumbTip.z;
          const pinchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Threshold for pinch engagement: < 0.08 normalized unit
          const isPinching = pinchDistance < 0.075;

          // Convert mirrored video coordinates to normalized [-1, 1]
          // Mirrored: 1 - x
          const normX = (1 - indexTip.x) * 2 - 1;
          const normY = -(indexTip.y * 2 - 1);

          if (this.onCoordinates) {
            this.onCoordinates(normX, normY, isPinching, 0.95);
          }
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
