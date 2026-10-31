/**
 * "Ink Diorama Toon" look (our own style, technique base: Lemo-Opuscar Memphis Diorama).
 * Takes over the render of a ThreeCanvas:
 *  1. colour pass (MSAA) → 2. normal + depth pass → 3. composite:
 *     ink outlines on EVERY edge (normal / depth discontinuities, ~3 px at 1080p),
 *     a printed "paper" mottling, fine film grain (boils at 12 fps),
 *     a gentle saturation lift and a deep violet vignette like the reference films.
 * Adapted from styles/memphis-diorama/demo/memphis.js (MIT, Lemo-Opuscar).
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

const FS = /* glsl */ `
uniform sampler2D tCol, tNor, tDep;
uniform vec2 res;
uniform float cn, cf, uSeed, uLine, uVig;
uniform vec3 uInk, uVigCol;
varying vec2 vUv;
#include <packing>
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 x) { vec2 i = floor(x), f = fract(x); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 x) { return vn(x) * 0.55 + vn(x * 2.1 + 5.0) * 0.3 + vn(x * 4.3 + 9.0) * 0.15; }
float wz(vec2 uv) { float d = texture2D(tDep, uv).x; return 1.0 / max(-perspectiveDepthToViewZ(d, cn, cf), 1e-4); }
vec3 nr(vec2 uv) { return texture2D(tNor, uv).xyz * 2.0 - 1.0; }
float edge(vec2 uv) {
  vec2 px = 1.0 / res; float r = uLine;
  float w = wz(uv); vec3 n = nr(uv);
  float e = 0.0;
  for (int i = 0; i < 4; i++) {
    vec2 d = i == 0 ? vec2(1, 0) : i == 1 ? vec2(0, 1) : i == 2 ? vec2(0.7, 0.7) : vec2(0.7, -0.7);
    vec2 o = d * px * r;
    float wa = wz(uv + o), wb = wz(uv - o);
    float lap = abs(wa + wb - 2.0 * w) / max(w, 1e-5);
    if (lap > 0.05) e = 1.0;
    if (dot(n, nr(uv + o)) < 0.78 || dot(n, nr(uv - o)) < 0.78) e = 1.0;
  }
  return e;
}
void main() {
  vec2 px = 1.0 / res;
  vec3 acc = vec3(0.0);
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    vec2 uv = vUv + (vec2(float(i), float(j)) - 0.5) * px;
    vec3 c = texture2D(tCol, uv).rgb;
    acc += mix(c, uInk, edge(uv));
  }
  vec3 col = acc * 0.25;
  vec2 p = vUv * res;
  // saturation lift
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, 1.12);
  // printed paper mottling (large, soft) + fine grain (boils at 12 fps)
  col *= 1.0 + (fbm(p / 140.0 + 3.0) - 0.5) * 0.06;
  float g = h21(p + uSeed * 17.31) - 0.5;
  col += g * 0.028;
  // deep violet vignette
  vec2 q = (vUv - 0.5) * vec2(1.0, 0.82);
  float v = smoothstep(0.26, 0.74, length(q));
  col = mix(col, col * uVigCol, v * uVig);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const linear = (hex: string) => new THREE.Color(hex);

export const InkPass: React.FC<{ seed: number; ink?: string; line?: number; vignette?: number; vigColor?: string }> = ({
  seed,
  ink = '#1d1830',
  line = 2.3,
  vignette = 1.0,
  vigColor = '#4a3a8c',
}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const st = useMemo(() => {
    const v = new THREE.Vector2();
    gl.getDrawingBufferSize(v);
    const W = Math.max(2, v.x);
    const H = Math.max(2, v.y);
    const opt = { type: THREE.HalfFloatType };
    const rtCol = new THREE.WebGLRenderTarget(W, H, { ...opt, samples: 4 });
    const rtNor = new THREE.WebGLRenderTarget(W, H, { ...opt, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthTexture: new THREE.DepthTexture(W, H) });
    const normMat = new THREE.MeshNormalMaterial();
    const comp = new THREE.ShaderMaterial({
      uniforms: {
        tCol: { value: rtCol.texture },
        tNor: { value: rtNor.texture },
        tDep: { value: rtNor.depthTexture },
        res: { value: new THREE.Vector2(W, H) },
        cn: { value: 0.1 },
        cf: { value: 400 },
        uSeed: { value: 0 },
        uLine: { value: (line * W) / 1080 },
        uVig: { value: vignette },
        uInk: { value: linear(ink) },
        uVigCol: { value: linear(vigColor) },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: FS,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), comp);
    const quadScene = new THREE.Scene();
    quadScene.add(quad);
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return { rtCol, rtNor, normMat, comp, quadScene, quadCam };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, size.width, size.height]);

  useEffect(
    () => () => {
      st.rtCol.dispose();
      st.rtNor.dispose();
    },
    [st],
  );

  useFrame(() => {
    camera.updateMatrixWorld();
    gl.setRenderTarget(st.rtCol);
    gl.clear();
    gl.render(scene, camera);
    // normals + depth (glows / translucent things draw no outline)
    const hidden: THREE.Object3D[] = [];
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (o.visible && (o.userData.noOutline || (m && (m as THREE.MeshBasicMaterial).transparent))) {
        o.visible = false;
        hidden.push(o);
      }
    });
    const bg = scene.background;
    const fog = scene.fog;
    scene.background = null;
    scene.fog = null;
    scene.overrideMaterial = st.normMat;
    const prev = new THREE.Color();
    gl.getClearColor(prev);
    const pa = gl.getClearAlpha();
    gl.setClearColor(0x8080ff, 1);
    gl.setRenderTarget(st.rtNor);
    gl.clear();
    gl.render(scene, camera);
    gl.setClearColor(prev, pa);
    scene.overrideMaterial = null;
    scene.background = bg;
    scene.fog = fog;
    for (const o of hidden) o.visible = true;
    const u = st.comp.uniforms;
    u.cn.value = camera.near;
    u.cf.value = camera.far;
    u.uSeed.value = seed;
    gl.setRenderTarget(null);
    gl.render(st.quadScene, st.quadCam);
  }, 1);
  return null;
};
