import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Shared geometries: smooth normals everywhere, so outlines never crack at corners.
export const G = {
  sphere: new THREE.SphereGeometry(1, 48, 32),
  hairCap: new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.42),
  capsule: new THREE.CapsuleGeometry(1, 1, 12, 32),
  stick: new THREE.CylinderGeometry(1, 1, 1, 12),
  smile: new THREE.TorusGeometry(1, 0.16, 8, 24, Math.PI),
  ring: new THREE.TorusGeometry(1, 0.2, 12, 40),
  disc: new THREE.CircleGeometry(1, 32),
  plane: new THREE.PlaneGeometry(1, 1),
  box: new RoundedBoxGeometry(1, 1, 1, 4, 0.08),
  softBox: new RoundedBoxGeometry(1, 1, 1, 6, 0.25),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 32),
  pot: new THREE.CylinderGeometry(1, 0.75, 1, 32),
};
