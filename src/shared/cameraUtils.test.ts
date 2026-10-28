import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  computeObjectBounds,
  calculateFramingDistance,
  getPresetDirection,
  fitCameraToObject,
  focusCameraOnMesh,
} from './cameraUtils';

describe('Camera & Viewport Framing Utilities', () => {
  it('correctly calculates bounding box, center, and dimensions for an Object3D', () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 4, 6),
      new THREE.MeshBasicMaterial()
    );
    mesh.position.set(10, 20, 30);

    const bounds = computeObjectBounds(mesh);
    expect(bounds.isValid).toBe(true);
    expect(bounds.center.x).toBeCloseTo(10);
    expect(bounds.center.y).toBeCloseTo(20);
    expect(bounds.center.z).toBeCloseTo(30);
    expect(bounds.size.x).toBeCloseTo(2);
    expect(bounds.size.y).toBeCloseTo(4);
    expect(bounds.size.z).toBeCloseTo(6);
    expect(bounds.maxDim).toBeCloseTo(6);
    expect(bounds.radius).toBeGreaterThan(3);
  });

  it('handles empty or non-finite objects gracefully without crashing', () => {
    const emptyGroup = new THREE.Group();
    const bounds = computeObjectBounds(emptyGroup);
    expect(bounds.isValid).toBe(false);
    expect(bounds.center.x).toBe(0);
    expect(bounds.size.x).toBe(1);
  });

  it('computes proportional camera distance across different FOVs and aspect ratios', () => {
    const size = new THREE.Vector3(1, 1, 1);
    const distNarrow = calculateFramingDistance(size, 30, 1.0);
    const distWide = calculateFramingDistance(size, 60, 1.0);

    // Narrow FOV requires further camera distance to frame the same object
    expect(distNarrow).toBeGreaterThan(distWide);

    // Landscape vs portrait aspect ratio
    const distLandscape = calculateFramingDistance(size, 45, 2.0);
    const distPortrait = calculateFramingDistance(size, 45, 0.5);
    expect(distPortrait).toBeGreaterThan(distLandscape);
  });

  it('returns valid unit vectors for all anatomical camera presets', () => {
    const anterior = getPresetDirection('anterior');
    expect(anterior.z).toBe(1);
    expect(anterior.x).toBe(0);

    const posterior = getPresetDirection('posterior');
    expect(posterior.z).toBe(-1);

    const left = getPresetDirection('lateral-left');
    expect(left.x).toBe(-1);

    const right = getPresetDirection('lateral-right');
    expect(right.x).toBe(1);

    const superior = getPresetDirection('superior');
    expect(superior.y).toBeCloseTo(1);

    const isometric = getPresetDirection('isometric');
    expect(isometric.length()).toBeCloseTo(1.0);
  });

  it('fits camera to object adjusting position and clipping planes', () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshBasicMaterial()
    );
    const camera = new THREE.PerspectiveCamera(45, 1.5, 0.1, 1000);

    fitCameraToObject(camera, null, mesh, 'anterior');

    expect(camera.position.z).toBeGreaterThan(0.5);
    expect(camera.near).toBeLessThan(0.01);
  });

  it('focuses camera onto a small submesh without mutating world matrices', () => {
    const root = new THREE.Group();
    const submesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1),
      new THREE.MeshBasicMaterial()
    );
    submesh.position.set(0.2, 0.4, 0.1);
    root.add(submesh);

    const camera = new THREE.PerspectiveCamera(45, 1.0, 0.01, 100);
    camera.position.set(0, 0, 2);

    focusCameraOnMesh(camera, null, submesh);

    expect(camera.position.distanceTo(submesh.position)).toBeGreaterThan(0.1);
    expect(camera.position.distanceTo(submesh.position)).toBeLessThan(1.5);
  });
});
