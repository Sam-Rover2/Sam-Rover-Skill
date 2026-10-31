import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Shared geometries. Smooth normals everywhere so outlines never crack.
export const G = {
  sphere: new THREE.SphereGeometry(1, 48, 32),
  lowSphere: new THREE.SphereGeometry(1, 20, 14),
  hemi: new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5),
  capsule: new THREE.CapsuleGeometry(1, 1, 12, 32),
  stick: new THREE.CapsuleGeometry(1, 1, 6, 12), // rounded-end stick
  arc: new THREE.TorusGeometry(1, 0.16, 8, 24, Math.PI),
  ring: new THREE.TorusGeometry(1, 0.2, 12, 40),
  thinRing: new THREE.TorusGeometry(1, 0.08, 8, 40),
  disc: new THREE.CircleGeometry(1, 40),
  plane: new THREE.PlaneGeometry(1, 1),
  box: new RoundedBoxGeometry(1, 1, 1, 4, 0.08),
  /** Almost-sharp box for big architecture (corner radius stays small when scaled ×30). */
  bigBox: new RoundedBoxGeometry(1, 1, 1, 2, 0.006),
  softBox: new RoundedBoxGeometry(1, 1, 1, 6, 0.25),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 32),
  cone: new THREE.ConeGeometry(1, 1, 32),
  pot: new THREE.CylinderGeometry(1, 0.75, 1, 32),
  cup: new THREE.CylinderGeometry(1, 0.8, 1, 32),
  torus: new THREE.TorusGeometry(1, 0.3, 12, 32),
};
