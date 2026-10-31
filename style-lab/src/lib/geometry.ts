import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const make = (lo: boolean) => {
  const s = lo ? 0.25 : 1; // low-poly: far fewer segments
  const n = (x: number, min = 3) => Math.max(min, Math.round(x * s));
  return {
    sphere: new THREE.SphereGeometry(1, n(48, 7), n(32, 5)),
    lowSphere: new THREE.SphereGeometry(1, 20, 14),
    hemi: new THREE.SphereGeometry(1, n(48, 7), n(24, 4), 0, Math.PI * 2, 0, Math.PI * 0.5),
    capsule: new THREE.CapsuleGeometry(1, 1, n(12, 3), n(32, 6)),
    stick: new THREE.CapsuleGeometry(1, 1, 6, 12),
    arc: new THREE.TorusGeometry(1, 0.16, 8, 24, Math.PI),
    ring: new THREE.TorusGeometry(1, 0.2, 12, 40),
    thinRing: new THREE.TorusGeometry(1, 0.08, 8, 40),
    disc: new THREE.CircleGeometry(1, 40),
    plane: new THREE.PlaneGeometry(1, 1),
    box: new RoundedBoxGeometry(1, 1, 1, lo ? 1 : 4, 0.08),
    bigBox: new RoundedBoxGeometry(1, 1, 1, 2, 0.006),
    softBox: new RoundedBoxGeometry(1, 1, 1, lo ? 1 : 6, 0.25),
    cyl: new THREE.CylinderGeometry(1, 1, 1, n(32, 6)),
    cone: new THREE.ConeGeometry(1, 1, n(32, 5)),
    pot: new THREE.CylinderGeometry(1, 0.75, 1, n(32, 6)),
    cup: new THREE.CylinderGeometry(1, 0.8, 1, n(32, 6)),
    prism: new THREE.CylinderGeometry(1, 1, 1, 3),
    torus: new THREE.TorusGeometry(1, 0.3, 12, 32),
  };
};
const HI = make(false);
const LO = make(true);

/** Shared geometries (mutable: the style lab swaps in low-poly versions). */
export const G = { ...HI };
export const useLowPoly = (on: boolean) => Object.assign(G, on ? LO : HI);
