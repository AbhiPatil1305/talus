import { NormalizedInput } from '../../shared/types';

export type InputCallback = (input: NormalizedInput) => void;

/**
 * InputAdapter provides a unified interface between physical input devices
 * (mouse / touchpad primary fallback and optional MediaPipe webcam hand gestures)
 * and the 3D surgical simulation scene.
 */
export class InputAdapter {
  private currentInput: NormalizedInput = {
    x: 0,
    y: 0,
    isSelecting: false,
    source: 'mouse',
    timestamp: Date.now(),
  };

  private listeners: Set<InputCallback> = new Set();
  private containerElement: HTMLElement | null = null;
  private isPointerDown = false;

  constructor() {
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  /**
   * Attach listener to the simulation container DOM element
   */
  public attach(element: HTMLElement): void {
    this.detach();
    this.containerElement = element;

    element.addEventListener('pointermove', this.handlePointerMove);
    element.addEventListener('pointerdown', this.handlePointerDown);
    element.addEventListener('pointerup', this.handlePointerUp);
    element.addEventListener('pointerleave', this.handlePointerUp);
  }

  /**
   * Detach all DOM event listeners
   */
  public detach(): void {
    if (!this.containerElement) return;
    this.containerElement.removeEventListener('pointermove', this.handlePointerMove);
    this.containerElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.containerElement.removeEventListener('pointerup', this.handlePointerUp);
    this.containerElement.removeEventListener('pointerleave', this.handlePointerUp);
    this.containerElement = null;
  }

  public subscribe(callback: InputCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public getCurrentInput(): NormalizedInput {
    return { ...this.currentInput };
  }

  /**
   * Method for MediaPipe or external gesture trackers to submit normalized hand positions
   */
  public updateHandInput(x: number, y: number, isPinching: boolean, confidence: number = 0.9): void {
    this.updateState({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
      isSelecting: isPinching,
      source: 'hand',
      timestamp: Date.now(),
      confidence,
    });
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.containerElement) return;
    const rect = this.containerElement.getBoundingClientRect();
    // Normalize to [-1, 1] range: left = -1, right = +1, bottom = -1, top = +1
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    this.updateState({
      x: normX,
      y: normY,
      isSelecting: this.isPointerDown,
      source: 'mouse',
      timestamp: Date.now(),
    });
  }

  private handlePointerDown(e: PointerEvent): void {
    this.isPointerDown = true;
    this.handlePointerMove(e);
  }

  private handlePointerUp(e: PointerEvent): void {
    this.isPointerDown = false;
    this.handlePointerMove(e);
  }

  private updateState(newInput: NormalizedInput): void {
    this.currentInput = newInput;
    for (const listener of this.listeners) {
      listener(newInput);
    }
  }
}

export const globalInputAdapter = new InputAdapter();
