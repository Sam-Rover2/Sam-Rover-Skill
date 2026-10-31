import { useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { outline, toon } from '../lib/materials';
import { LINE } from '../lib/style';

/**
 * Imported 3D model (GLB/GLTF from the user). Options:
 *  - height: auto-scale so the model is this tall (units, 1 m = 2.2)
 *  - restyle: 'keep' = original materials · 'toon' = our toon shading + ink outline
 * The url is resolved by the caller: staticFile('models/x.glb') in Remotion, an embedded data-URL in review.html.
 */
export type ModelUrlResolver = (file: string) => string;
let resolveUrl: ModelUrlResolver = (f) => f;
export const setModelUrlResolver = (r: ModelUrlResolver) => {
  resolveUrl = r;
};
/** In Remotion the frame must wait for the model: delayRender / continueRender are plugged in here. */
let hold: (label: string) => () => void = () => () => {};
export const setModelLoadHold = (h: (label: string) => () => void) => {
  hold = h;
};

const cache = new Map<string, Promise<THREE.Group>>();
const load = (file: string) => {
  if (!cache.has(file)) cache.set(file, new GLTFLoader().loadAsync(resolveUrl(file)).then((g) => g.scene));
  return cache.get(file)!;
};

export const Model: React.FC<{ file: string; height?: number; restyle?: 'keep' | 'toon'; outlinePx?: number }> = ({ file, height, restyle = 'toon', outlinePx = LINE.bgWidth }) => {
  const [obj, setObj] = useState<THREE.Object3D | null>(null);
  const advance = useThree((s) => s.advance);
  const releaseRef = useRef<() => void>(() => {});
  // Remotion's canvas only redraws on frame changes: after the model appears, draw once more,
  // then let the frame be captured
  useEffect(() => {
    if (!obj) return;
    advance(performance.now());
    const id = requestAnimationFrame(() => {
      advance(performance.now());
      releaseRef.current();
    });
    return () => cancelAnimationFrame(id);
  }, [obj, advance]);
  useEffect(() => {
    let alive = true;
    const release = hold(`model ${file}`);
    releaseRef.current = release;
    load(file).then((src) => {
      if (!alive) return;
      const o = src.clone(true);
      // sit on the ground, centred, scaled to the requested height
      const box = new THREE.Box3().setFromObject(o);
      const size = box.getSize(new THREE.Vector3());
      const k = height ? height / Math.max(1e-6, size.y) : 1;
      o.scale.setScalar(k);
      const c = box.getCenter(new THREE.Vector3());
      o.position.set(-c.x * k, -box.min.y * k, -c.z * k);
      if (restyle === 'toon') {
        const add: [THREE.Mesh, THREE.Mesh][] = [];
        o.traverse((m) => {
          if (!(m instanceof THREE.Mesh)) return;
          const src = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
          // keep the model's own texture, but light it like our cartoons (3-tone toon) + ink outline
          m.material = src.map
            ? new THREE.MeshToonMaterial({ map: src.map, color: src.color ?? new THREE.Color('#ffffff'), gradientMap: (toon('#ffffff') as THREE.MeshToonMaterial).gradientMap })
            : toon('#' + (src.color?.getHexString?.() ?? 'cccccc'));
          const line = new THREE.Mesh(m.geometry, outline(outlinePx));
          add.push([m, line]);
        });
        add.forEach(([m, l]) => m.add(l));
      }
      const g = new THREE.Group();
      g.add(o);
      setObj(g); // released in the effect above, after the redraw
    }).catch(() => release());
    return () => {
      alive = false;
      release();
    };
  }, [file, height, restyle, outlinePx]);
  return obj ? <primitive object={obj} /> : null;
};
