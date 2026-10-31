import * as THREE from 'three';
import { LINE } from './style';

/**
 * Style-aware materials. One global "render style" decides how every fill, flat decal and
 * outline is drawn, so the same scene/characters can be rendered in many looks.
 */
export type Fill = 'toon3' | 'cel2' | 'clay' | 'vinyl' | 'lowpoly' | 'white' | 'basic' | 'night';
export interface RenderStyle {
  id: string;
  fill: Fill;
  /** Map any palette colour to this style's colour. */
  color?: (c: string) => string;
  ink: string; // colour of lines and black details
  line: number; // outline width multiplier (0 = no outline)
  boil?: number; // hand-drawn wobble of outlines, px
}

let S: RenderStyle = { id: 'toon', fill: 'toon3', ink: LINE.color, line: 1 };
export const setRenderStyle = (s: RenderStyle) => {
  S = s;
};
export const renderStyle = () => S;

const rampTex = (steps: number[]) => {
  const data = new Uint8Array(steps.flatMap((v) => [v, v, v, 255]));
  const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
};
const RAMP3 = rampTex([150, 205, 255]);
const RAMP2 = rampTex([165, 255]);
const RAMPN = rampTex([60, 120, 255]);

const lum = (c: string) => [1, 3, 5].reduce((a, i, k) => a + parseInt(c.slice(i, i + 2), 16) * [0.3, 0.59, 0.11][k], 0) / 255;
const mapC = (c: string) => (c.toLowerCase() === LINE.color ? S.ink : S.color ? S.color(c) : c);

const cache = new Map<string, THREE.Material>();
const memo = <T extends THREE.Material>(key: string, make: () => T): T => {
  const k = `${S.id}|${key}`;
  let m = cache.get(k) as T | undefined;
  if (!m) {
    m = make();
    cache.set(k, m);
  }
  return m;
};

export function toon(color: string): THREE.Material {
  const c = mapC(color);
  return memo(`fill:${c}`, () => {
    switch (S.fill) {
      case 'cel2':
        return new THREE.MeshToonMaterial({ color: c, gradientMap: RAMP2 });
      case 'night':
        return new THREE.MeshToonMaterial({ color: c, gradientMap: RAMPN });
      case 'clay':
        return new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, metalness: 0 });
      case 'vinyl':
        return new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 });
      case 'lowpoly':
        return new THREE.MeshLambertMaterial({ color: c, flatShading: true });
      case 'white':
        return new THREE.MeshBasicMaterial({ color: c === S.ink || lum(c) < 0.3 ? S.ink : '#fbf8f0' });
      case 'basic':
        return new THREE.MeshBasicMaterial({ color: c });
      default:
        return new THREE.MeshToonMaterial({ color: c, gradientMap: RAMP3 });
    }
  });
}

export function flat(color: string, opacity = 1): THREE.Material {
  const c = mapC(color);
  return memo(`flat:${c}/${opacity}`, () => {
    const col = S.fill === 'white' && c !== S.ink && opacity === 1 ? '#fbf8f0' : c;
    return new THREE.MeshBasicMaterial({ color: col, transparent: opacity < 1, opacity, toneMapped: false });
  });
}

/** Inverted-hull outline, constant width in screen pixels, optional hand-drawn boil. */
export function outline(widthPx = LINE.width, height = 1080): THREE.Material {
  const w = widthPx * S.line;
  return memo(`line:${w}`, () => {
    if (w <= 0) return new THREE.MeshBasicMaterial({ visible: false });
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uWidth: { value: (w * 2) / height },
        uBoil: { value: ((S.boil ?? 0) * 2) / height },
        uAspect: { value: 16 / 9 },
        uColor: { value: new THREE.Color(S.ink) },
      },
      vertexShader: /* glsl */ `
        uniform float uWidth;
        uniform float uBoil;
        uniform float uAspect;
        void main() {
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec3 viewNormal = normalize(normalMatrix * normal);
          vec2 dir = (projectionMatrix * vec4(viewNormal, 0.0)).xy;
          dir.x *= uAspect;
          dir = normalize(dir + 1e-6);
          dir.x /= uAspect;
          float wob = sin(position.x * 9.0 + position.y * 7.0) * cos(position.z * 8.0 - position.y * 5.0);
          clip.xy += dir * (uWidth + uBoil * wob) * clip.w;
          gl_Position = clip;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        void main() { gl_FragColor = vec4(uColor, 1.0); }`,
    });
  });
}
