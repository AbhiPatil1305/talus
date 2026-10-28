import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type CameraPreset =
  | 'anterior'
  | 'posterior'
  | 'lateral-left'
  | 'lateral-right'
  | 'superior'
  | 'isometric'
  | 'reset';

export interface ObjectBoundsResult {
  box: THREE.Box3;
  center: THREE.Vector3;
  size: THREE.Vector3;
  maxDim: number;
  radius: number;
  isValid: boolean;
}

/**
 * Calculates the bounding box, center, dimensions, and bounding sphere radius
 * for any THREE.Object3D hierarchy, safely validating finite coordinates.
 */
export function computeObjectBounds(object: THREE.Object3D): ObjectBoundsResult {
  const box = new THREE.Box3();
  box.setFromObject(object);

  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  // If object has no geometries or invalid bounds
  if (
    box.isEmpty() ||
    !Number.isFinite(box.min.x) ||
    !Number.isFinite(box.min.y) ||
    !Number.isFinite(box.min.z) ||
    !Number.isFinite(box.max.x) ||
    !Number.isFinite(box.max.y) ||
    !Number.isFinite(box.max.z)
  ) {
    return {
      box,
      center: new THREE.Vector3(0, 0, 0),
      size: new THREE.Vector3(1, 1, 1),
      maxDim: 1,
      radius: 0.5,
      isValid: false,
    };
  }

  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);
  const radius = sphere.radius > 0 ? sphere.radius : maxDim / 2;

  return {
    box,
    center,
    size,
    maxDim,
    radius,
    isValid: true,
  };
}

/**
 * Computes the optimal camera distance to frame an object of given size
 * within a perspective camera's field of view and aspect ratio.
 *
 * @param size Bounding box dimensions (X, Y, Z)
 * @param fovDegrees Vertical field of view in degrees (e.g. 45)
 * @param aspect Viewport aspect ratio (width / height)
 * @param padding Multiplier for breathing room (default 1.25)
 */
export function calculateFramingDistance(
  size: THREE.Vector3,
  fovDegrees: number,
  aspect: number,
  padding = 1.25
): number {
  const safeFov = Math.max(fovDegrees, 10) * (Math.PI / 180);
  const safeAspect = Math.max(aspect, 0.1);

  // Maximum dimension in X/Z horizontal plane vs Y vertical plane
  const horizontalSize = Math.max(size.x, size.z);
  const verticalSize = size.y;

  // Distance needed to fit vertical bounds: size.y / (2 * tan(fov / 2))
  const verticalDistance = verticalSize / (2 * Math.tan(safeFov / 2));

  // Distance needed to fit horizontal bounds: size.h / (2 * tan(horizontalFov / 2))
  // horizontalFov is 2 * atan(tan(fov / 2) * aspect)
  const horizontalDistance =
    horizontalSize / (2 * Math.tan(safeFov / 2) * safeAspect);

  const baseDistance = Math.max(verticalDistance, horizontalDistance, size.length() * 0.5);

  return Math.max(baseDistance * padding, 0.01);
}

/**
 * Returns a unit vector for a standard anatomical camera preset.
 */
export function getPresetDirection(preset: CameraPreset): THREE.Vector3 {
  switch (preset) {
    case 'anterior':
      return new THREE.Vector3(0, 0, 1); // Frontal
    case 'posterior':
      return new THREE.Vector3(0, 0, -1); // Dorsal
    case 'lateral-left':
      return new THREE.Vector3(-1, 0, 0); // Left side
    case 'lateral-right':
      return new THREE.Vector3(1, 0, 0); // Right side
    case 'superior':
      return new THREE.Vector3(0, 1, 0.0001).normalize(); // Top cranial view
    case 'isometric':
    case 'reset':
    default:
      return new THREE.Vector3(1.2, 0.9, 1.4).normalize(); // Standard 3/4 perspective
  }
}

/**
 * Frames a perspective camera directly onto a target object or group,
 * adjusting OrbitControls limits, near/far planes, and camera position.
 */
export function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControlsImpl | null,
  object: THREE.Object3D,
  preset: CameraPreset = 'reset',
  padding = 1.3
): void {
  const bounds = computeObjectBounds(object);
  if (!bounds.isValid) return;

  const aspect = camera.aspect || 1;
  const distance = calculateFramingDistance(bounds.size, camera.fov, aspect, padding);

  // Set intelligent near and far clipping planes based on model dimensions
  camera.near = Math.max(bounds.maxDim / 500, 0.005);
  camera.far = Math.max(bounds.maxDim * 50, 100);
  camera.updateProjectionMatrix();

  const direction = getPresetDirection(preset);
  const newPosition = new THREE.Vector3()
    .copy(bounds.center)
    .addScaledVector(direction, distance);

  camera.position.copy(newPosition);

  if (controls) {
    controls.target.copy(bounds.center);
    // Allow zooming in to 10% of model size, out to 8x model size
    controls.minDistance = Math.max(bounds.maxDim * 0.15, 0.01);
    controls.maxDistance = Math.max(bounds.maxDim * 8.0, distance * 3.5);
    controls.update();
  } else {
    camera.lookAt(bounds.center);
  }
}

/**
 * Focuses the camera directly onto a specific mesh or sub-structure within a model,
 * zooming in to make the structure prominent without mutating world geometry.
 */
export function focusCameraOnMesh(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControlsImpl | null,
  mesh: THREE.Object3D,
  padding = 1.4
): void {
  const meshBounds = computeObjectBounds(mesh);
  if (!meshBounds.isValid) return;

  const aspect = camera.aspect || 1;
  const distance = calculateFramingDistance(meshBounds.size, camera.fov, aspect, padding);

  // Maintain current viewing vector direction from camera to target
  const currentDirection = new THREE.Vector3()
    .subVectors(camera.position, controls ? controls.target : meshBounds.center)
    .normalize();

  if (currentDirection.lengthSq() < 0.001) {
    currentDirection.set(0, 0.5, 1).normalize();
  }

  const newPosition = new THREE.Vector3()
    .copy(meshBounds.center)
    .addScaledVector(currentDirection, distance);

  camera.position.copy(newPosition);

  if (controls) {
    controls.target.copy(meshBounds.center);
    // Adjust minDistance to inspect tiny sub-structures
    controls.minDistance = Math.max(meshBounds.maxDim * 0.1, 0.005);
    controls.update();
  } else {
    camera.lookAt(meshBounds.center);
  }
}
