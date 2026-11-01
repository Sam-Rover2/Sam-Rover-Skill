import * as THREE from 'three';
import type { V3 } from '../lib/Toon';
import { ARM, HIPS_Y, relaxedHand } from './Character';
import { reach } from './Limb';

/**
 * World position of a hand for a character placed at `pos` with Y-rotation `rotY`
 * (simple poses: no lean/twist). Use it to hand objects from a character to the world
 * without a visible jump.
 */
export function handWorld(pos: V3, rotY: number, side: 1 | -1, target?: V3, hipsY = 0): V3 {
  const shoulder: V3 = [side * 0.45, HIPS_Y + hipsY + 1.0, 0];
  const h = reach(shoulder, target ?? relaxedHand(side, HIPS_Y + hipsY), ARM);
  const v = new THREE.Vector3(...h).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  return [v.x + pos[0], v.y + pos[1], v.z + pos[2]];
}
