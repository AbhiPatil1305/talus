import {
  BimanualTrackingState,
  NormalizedInput,
  SingleHandState,
} from '../../shared/types';

export type InputCallback = (input: NormalizedInput) => void;

/**
 * Unified InputAdapter supporting both bimanual webcam hand tracking
 * and comprehensive mouse + keyboard fallback controls.
 */
export class InputAdapter {
  private bimanualState: BimanualTrackingState = {
    leftHand: {
      tracked: false,
      x: -0.4,
      y: 0.1,
      isPinching: false,
      pinchDistance: 0.2,
      confidence: 1.0,
      rawHandedness: 'Left',
    },
    rightHand: {
      tracked: false,
      x: 0.2,
      y: 0.1,
      isPinching: false,
      pinchDistance: 0.2,
      confidence: 1.0,
      rawHandedness: 'Right',
    },
    coordinationState: 'IDLE',
    source: 'mouse',
    timestamp: Date.now(),
  };

  private listeners: Set<InputCallback> = new Set();
  private containerElement: HTMLElement | null = null;
  private isPointerDown = false;
  private isLeftStabilizerKeyHeld = false; // Spacebar or Shift

  constructor() {
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Attach listeners to container and window for keyboard/mouse interaction
   */
  public attach(element: HTMLElement): void {
    this.detach();
    this.containerElement = element;

    element.addEventListener('pointermove', this.handlePointerMove);
    element.addEventListener('pointerdown', this.handlePointerDown);
    element.addEventListener('pointerup', this.handlePointerUp);
    element.addEventListener('pointerleave', this.handlePointerUp);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  /**
   * Detach all event listeners
   */
  public detach(): void {
    if (this.containerElement) {
      this.containerElement.removeEventListener('pointermove', this.handlePointerMove);
      this.containerElement.removeEventListener('pointerdown', this.handlePointerDown);
      this.containerElement.removeEventListener('pointerup', this.handlePointerUp);
      this.containerElement.removeEventListener('pointerleave', this.handlePointerUp);
      this.containerElement = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  public subscribe(callback: InputCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public getCurrentInput(): NormalizedInput {
    return {
      x: this.bimanualState.rightHand.x,
      y: this.bimanualState.rightHand.y,
      isSelecting: this.bimanualState.rightHand.isPinching,
      source: this.bimanualState.source,
      timestamp: this.bimanualState.timestamp,
      confidence: this.bimanualState.rightHand.confidence,
      bimanual: { ...this.bimanualState },
    };
  }

  /**
   * Method for MediaPipe bimanual tracker to submit webcam hand coordinates
   */
  public updateBimanualInput(state: BimanualTrackingState): void {
    this.bimanualState = {
      ...state,
      source: 'hand',
      timestamp: Date.now(),
    };
    this.broadcast();
  }

  /**
   * Programmatic toggle for left stabilizer hold (useful for on-screen buttons)
   */
  public setLeftStabilizerHold(holding: boolean): void {
    this.isLeftStabilizerKeyHeld = holding;
    this.bimanualState.leftHand.isPinching = holding;
    this.bimanualState.leftHand.tracked = true;
    this.broadcast();
  }

  /**
   * Position left stabilizer tool over target landmark
   */
  public setLeftStabilizerPosition(normX: number, normY: number): void {
    this.bimanualState.leftHand.x = Math.max(-1, Math.min(1, normX));
    this.bimanualState.leftHand.y = Math.max(-1, Math.min(1, normY));
    this.bimanualState.leftHand.tracked = true;
    this.broadcast();
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.containerElement) return;
    const rect = this.containerElement.getBoundingClientRect();

    // Map pointer to normalized [-1, 1] range: left = -1, right = +1, bottom = -1, top = +1
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    const updatedRight: SingleHandState = {
      tracked: true,
      x: Math.max(-1, Math.min(1, normX)),
      y: Math.max(-1, Math.min(1, normY)),
      isPinching: this.isPointerDown,
      pinchDistance: this.isPointerDown ? 0.04 : 0.2,
      confidence: 1.0,
      rawHandedness: 'Right',
    };

    this.bimanualState = {
      ...this.bimanualState,
      rightHand: updatedRight,
      source: this.bimanualState.source === 'hand' ? 'hybrid' : 'mouse',
      timestamp: Date.now(),
    };

    this.broadcast();
  }

  private handlePointerDown(e: PointerEvent): void {
    if (e.button === 0) {
      this.isPointerDown = true;
      this.handlePointerMove(e);
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    if (e.button === 0) {
      this.isPointerDown = false;
      this.handlePointerMove(e);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Space or Shift engages left stabilizer hold
    if ((e.code === 'Space' || e.key === 'Shift') && !this.isLeftStabilizerKeyHeld) {
      this.isLeftStabilizerKeyHeld = true;
      this.bimanualState.leftHand.isPinching = true;
      this.bimanualState.leftHand.tracked = true;
      this.broadcast();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Space' || e.key === 'Shift') {
      this.isLeftStabilizerKeyHeld = false;
      this.bimanualState.leftHand.isPinching = false;
      this.broadcast();
    }
  }

  private broadcast(): void {
    const input = this.getCurrentInput();
    for (const listener of this.listeners) {
      listener(input);
    }
  }
}

export const globalInputAdapter = new InputAdapter();
