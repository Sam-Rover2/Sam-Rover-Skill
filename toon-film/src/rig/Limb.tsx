import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { G } from '../lib/geometry';
import { flat } from '../lib/materials';
import { LINE } from '../lib/style';
import type { V3 } from '../lib/Toon';

const v = (a: V3) => new THREE.Vector3(...a);
const r3 = (a: V3) => a.map((x) => Math.round(x * 1000) / 1000).join(',');

/**
 * A bendable limb on a quadratic Bezier curve ("rubber-hose" rig with a real joint).
 * The joint (elbow/knee) is placed so that the limb keeps its length: when the hand comes
 * closer to the shoulder, the curve bows out in `bendDir`. Both ends are rounded (sphere caps).
 */
export const Limb: React.FC<{ root: V3; tip: V3; length: number; bendDir: V3; radius?: number; color?: string }> = ({
  root,
  tip,
  length,
  bendDir,
  radius = 0.055,
  color = LINE.color,
}) => {
  const key = `${r3(root)}|${r3(tip)}|${r3(bendDir)}|${length}|${radius}`;
  const { geometry, end } = useMemo(() => {
    const a = v(root);
    let b = v(tip);
    const ab = b.clone().sub(a);
    let d = ab.length();
    if (d > length) {
      b = a.clone().add(ab.multiplyScalar(length / d)); // can't stretch: straight limb
      d = length;
    }
    const axis = b.clone().sub(a).normalize();
    const side = v(bendDir).sub(axis.clone().multiplyScalar(v(bendDir).dot(axis)));
    if (side.lengthSq() < 1e-6) side.set(0, 0, 1);
    side.normalize();
    // two segments of length L/2 → joint height h above the chord
    const h = Math.sqrt(Math.max(0, (length / 2) ** 2 - (d / 2) ** 2));
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const joint = mid.clone().add(side.multiplyScalar(h));
    // quadratic Bezier that passes through the joint at t=0.5
    const control = joint.clone().multiplyScalar(2).sub(mid);
    const curve = new THREE.QuadraticBezierCurve3(a, control, b);
    return { geometry: new THREE.TubeGeometry(curve, 24, radius, 10, false), end: b.toArray() as V3 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const m = flat(color);
  return (
    <group>
      <mesh geometry={geometry} material={m} />
      <mesh geometry={G.lowSphere} material={m} position={root} scale={radius} />
      <mesh geometry={G.lowSphere} material={m} position={end} scale={radius} />
    </group>
  );
};

/** Where the tip actually ends (clamped to the limb length). */
export function reach(root: V3, tip: V3, length: number): V3 {
  const a = v(root);
  const ab = v(tip).sub(a);
  const d = ab.length();
  return (d > length ? a.add(ab.multiplyScalar(length / d)) : v(tip)).toArray() as V3;
}
