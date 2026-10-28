import * as THREE from 'three';
import { LINE } from './style';

/** 3-tone ramp: hard steps like cel shading, but bright like the reference. */
const ramp = (() => {
  const data = new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
})();

const toonCache = new Map<string, THREE.MeshToonMaterial>();
export function toon(color: string): THREE.MeshToonMaterial {
  let m = toonCache.get(color);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
    toonCache.set(color, m);
  }
  return m;
}

const flatCache = new Map<string, THREE.MeshBasicMaterial>();
export function flat(color: string, opacity = 1): THREE.MeshBasicMaterial {
  const key = `${color}/${opacity}`;
  let m = flatCache.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, toneMapped: false });
    flatCache.set(key, m);
  }
  return m;
}

/**
 * Inverted-hull outline with a CONSTANT screen-space width:
 * the back faces are pushed out along the normal in clip space, so a line
 * is the same thickness close to and far from the camera.
 */
const outlineCache = new Map<number, THREE.ShaderMaterial>();
export function outline(widthPx = LINE.width, height = 1080): THREE.ShaderMaterial {
  let m = outlineCache.get(widthPx);
  if (!m) {
    m = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uWidth: { value: (widthPx * 2) / height },
        uAspect: { value: 16 / 9 },
        uColor: { value: new THREE.Color(LINE.color) },
      },
      vertexShader: /* glsl */ `
        uniform float uWidth;
        uniform float uAspect;
        void main() {
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec3 viewNormal = normalize(normalMatrix * normal);
          vec2 dir = (projectionMatrix * vec4(viewNormal, 0.0)).xy;
          dir.x *= uAspect;
          dir = normalize(dir + 1e-6);
          dir.x /= uAspect;
          clip.xy += dir * uWidth * clip.w;
          gl_Position = clip;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        void main() { gl_FragColor = vec4(uColor, 1.0); }`,
    });
    outlineCache.set(widthPx, m);
  }
  return m;
}
