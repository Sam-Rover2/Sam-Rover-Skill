import * as THREE from 'three';

/**
 * Procedural low-poly human with a real skeleton (SkinnedMesh), facial morph targets and
 * parametric clothes. Everything is generated from numbers: body = stacked horizontal rings
 * (lofts) skinned to bones; clothes = ring colours + small radius bumps at hems.
 *
 * Units: 1 m = 2.2. Character faces +z, feet at y = 0. Bind pose: A-pose (arms ~10° out).
 */

export type Sex = 'm' | 'f';
export interface HumanSpec {
  sex: Sex;
  height?: number; // metres (default m 1.78, f 1.66)
  build?: number; // 0.85 slim … 1 average … 1.3 heavy
  skin: string;
  hair: { style: 'short' | 'buzz' | 'long' | 'bob' | 'ponytail' | 'bald'; color: string };
  brows?: string;
  top: { type: 'tshirt' | 'tank' | 'longsleeve' | 'none'; color: string };
  bottom: { type: 'shorts' | 'cargo' | 'pants' | 'skirt'; color: string };
  shoes: { type: 'sneaker' | 'boot'; color: string; sole?: string };
  watch?: string;
}

export interface Human {
  root: THREE.Group;
  mesh: THREE.SkinnedMesh;
  bones: Record<string, THREE.Bone>;
  eyes: THREE.Mesh[];
  browsMeshes: THREE.Mesh[];
  S: number;
  spec: HumanSpec;
}

const U = 2.2;
const TAU = Math.PI * 2;

type W = [number, number, number, number]; // bone indices
type V3 = [number, number, number];

interface Ring {
  c: V3; // centre
  rx: number;
  rz: number;
  sides: number;
  color: string;
  bones: W;
  weights: [number, number, number, number];
  tweak?: (a: number, p: THREE.Vector3) => void;
  tag?: number; // head ring parameter t (for morphs); -1 otherwise
  off?: number; // angular offset (staggered rings → triangular facets)
}

class Builder {
  pos: number[] = [];
  col: number[] = [];
  si: number[] = [];
  sw: number[] = [];
  idx: number[] = [];
  tags: { t: number; a: number }[] = [];
  private c = new THREE.Color();

  vert(p: THREE.Vector3, color: string, bones: W, w: number[], tag = -1, a = 0) {
    this.pos.push(p.x, p.y, p.z);
    this.c.set(color);
    this.col.push(this.c.r, this.c.g, this.c.b);
    this.si.push(...bones);
    this.sw.push(...w);
    this.tags.push({ t: tag, a });
    return this.pos.length / 3 - 1;
  }

  ringVerts(r: Ring, color: string) {
    const ids: number[] = [];
    for (let i = 0; i < r.sides; i++) {
      const a = (i / r.sides) * TAU + (r.off ?? 0);
      const p = new THREE.Vector3(r.c[0] + Math.sin(a) * r.rx, r.c[1], r.c[2] + Math.cos(a) * r.rz);
      r.tweak?.(a, p);
      ids.push(this.vert(p, color, r.bones, r.weights, r.tag ?? -1, a));
    }
    return ids;
  }

  /** Bands between consecutive rings; each band gets the colour of its LOWER ring (hard colour edges). */
  loft(rings: Ring[], capBottom = false, capTop = false) {
    // stagger every other ring by half a step: quads become triangles → low-poly facet look
    rings.forEach((r, k) => {
      if ((r.tag ?? -1) < 0 && r.off === undefined) r.off = (k % 2) * (Math.PI / r.sides);
    });
    for (let k = 0; k < rings.length - 1; k++) {
      const A = rings[k];
      const B = rings[k + 1];
      const a = this.ringVerts(A, A.color);
      const b = this.ringVerts(B, A.color);
      const n = A.sides;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        this.idx.push(a[i], a[j], b[i], a[j], b[j], b[i]);
      }
    }
    if (capBottom) this.cap(rings[0], false);
    if (capTop) this.cap(rings[rings.length - 1], true);
  }

  cap(r: Ring, top: boolean) {
    const ids = this.ringVerts(r, r.color);
    const c = this.vert(new THREE.Vector3(...r.c), r.color, r.bones, r.weights, r.tag ?? -1, 0);
    for (let i = 0; i < ids.length; i++) {
      const j = (i + 1) % ids.length;
      if (top) this.idx.push(ids[i], ids[j], c);
      else this.idx.push(ids[j], ids[i], c);
    }
  }

  /** Merge an arbitrary geometry (already in bind space), rigidly skinned to one bone. */
  geo(g: THREE.BufferGeometry, m: THREE.Matrix4, color: string, bone: number) {
    const gg = g.index ? g : g;
    const p = gg.getAttribute('position');
    const base = this.pos.length / 3;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(m);
      this.vert(v, color, [bone, 0, 0, 0], [1, 0, 0, 0]);
    }
    const index = gg.index;
    if (index) for (let i = 0; i < index.count; i++) this.idx.push(base + index.getX(i));
    else for (let i = 0; i < p.count; i++) this.idx.push(base + i);
  }
}

const BONES = [
  'hips', 'spine', 'chest', 'neck', 'head',
  'shoulder.L', 'upperArm.L', 'foreArm.L', 'hand.L',
  'shoulder.R', 'upperArm.R', 'foreArm.R', 'hand.R',
  'thigh.L', 'shin.L', 'foot.L',
  'thigh.R', 'shin.R', 'foot.R',
] as const;
const B = Object.fromEntries(BONES.map((n, i) => [n, i])) as Record<(typeof BONES)[number], number>;

const w1 = (b: number): [W, [number, number, number, number]] => [[b, 0, 0, 0], [1, 0, 0, 0]];
const w2 = (a: number, b: number, k: number): [W, [number, number, number, number]] => [[a, b, 0, 0], [1 - k, k, 0, 0]];

export function buildHuman(spec: HumanSpec): Human {
  const f = spec.sex === 'f';
  const S = (spec.height ?? (f ? 1.66 : 1.78)) * U;
  const b = spec.build ?? 1;
  const skin = spec.skin;
  const top = spec.top;
  const bot = spec.bottom;
  const hairC = spec.hair.color;
  const browC = spec.brows ?? hairC;
  const bld = new Builder();

  // ---------- skeleton (bind positions, absolute) ----------
  const shW = (f ? 0.108 : 0.122) * S * (0.9 + 0.1 * b);
  const hipX = (f ? 0.058 : 0.052) * S * (0.92 + 0.08 * b);
  const armTilt = 0.17;
  const dArm = (s: number): V3 => [s * Math.sin(armTilt), -Math.cos(armTilt), 0];
  const abs: Record<string, V3> = {
    hips: [0, 0.52 * S, 0],
    spine: [0, 0.6 * S, 0],
    chest: [0, 0.7 * S, 0],
    neck: [0, 0.825 * S, -0.005 * S],
    head: [0, 0.87 * S, 0],
  };
  for (const [side, s] of [['L', 1], ['R', -1]] as const) {
    abs[`shoulder.${side}`] = [s * 0.035 * S, 0.8 * S, 0];
    abs[`upperArm.${side}`] = [s * shW, 0.808 * S, -0.005 * S];
    const e = abs[`upperArm.${side}`];
    const d = dArm(s);
    abs[`foreArm.${side}`] = [e[0] + d[0] * 0.186 * S, e[1] + d[1] * 0.186 * S, 0];
    const fa = abs[`foreArm.${side}`];
    abs[`hand.${side}`] = [fa[0] + d[0] * 0.146 * S, fa[1] + d[1] * 0.146 * S, 0.005 * S];
    abs[`thigh.${side}`] = [s * hipX, 0.5 * S, 0];
    abs[`shin.${side}`] = [s * hipX * 0.92, 0.285 * S, 0.004 * S];
    abs[`foot.${side}`] = [s * hipX * 0.9, 0.048 * S, -0.008 * S];
  }
  const parent: Record<string, string | null> = {
    hips: null, spine: 'hips', chest: 'spine', neck: 'chest', head: 'neck',
    'shoulder.L': 'chest', 'upperArm.L': 'shoulder.L', 'foreArm.L': 'upperArm.L', 'hand.L': 'foreArm.L',
    'shoulder.R': 'chest', 'upperArm.R': 'shoulder.R', 'foreArm.R': 'upperArm.R', 'hand.R': 'foreArm.R',
    'thigh.L': 'hips', 'shin.L': 'thigh.L', 'foot.L': 'shin.L',
    'thigh.R': 'hips', 'shin.R': 'thigh.R', 'foot.R': 'shin.R',
  };
  const bones: Record<string, THREE.Bone> = {};
  for (const n of BONES) {
    const bone = new THREE.Bone();
    bone.name = n;
    const p = parent[n];
    const a = abs[n];
    const pa = p ? abs[p] : [0, 0, 0];
    bone.position.set(a[0] - pa[0], a[1] - pa[1], a[2] - pa[2]);
    bones[n] = bone;
    if (p) bones[p].add(bone);
  }

  const R = (c: V3, rx: number, rz: number, color: string, bw: [W, number[]], sides = 8, tweak?: Ring['tweak'], tag?: number): Ring => ({
    c,
    rx,
    rz,
    sides,
    color,
    bones: bw[0],
    weights: bw[1] as [number, number, number, number],
    tweak,
    tag,
  });

  // colour regions
  const pantsTop = 0.565 * S; // waistband
  const shirtHem = 0.55 * S;
  const topC = top.type === 'none' ? skin : top.color;
  const torsoColor = (y: number) => (y < pantsTop && bot.type !== 'skirt' ? bot.color : y < shirtHem && bot.type === 'skirt' ? bot.color : y < 0.81 * S ? topC : skin);

  // ---------- torso ----------
  const bust = (y: number) => (a: number, p: THREE.Vector3) => {
    if (f && Math.cos(a) > 0.2) p.z += 0.022 * S * Math.cos(a) * (y > 0.69 && y < 0.75 ? 1 : 0.4);
  };
  const belly = (a: number, p: THREE.Vector3) => {
    if (Math.cos(a) > 0) p.z += Math.max(0, b - 1) * 0.12 * S * Math.cos(a);
  };
  const T: [number, number, number, [W, number[]], Ring['tweak']?][] = [
    // y, rx, rz, weights
    [0.465, f ? 0.1 : 0.085, 0.062, w1(B.hips)],
    [0.52, f ? 0.112 : 0.095, 0.07, w1(B.hips)],
    [0.565, f ? 0.098 : 0.09, 0.066, w2(B.hips, B.spine, 0.5)],
    [0.565, f ? 0.104 : 0.096, 0.071, w2(B.hips, B.spine, 0.5)], // shirt hem bump
    [0.62, f ? 0.088 : 0.092, 0.064, w1(B.spine), belly],
    [0.68, f ? 0.098 : 0.104, 0.068, w2(B.spine, B.chest, 0.6)],
    [0.72, f ? 0.104 : 0.115, 0.072, w1(B.chest), bust(0.72)],
    [0.775, f ? 0.1 : 0.11, 0.064, w1(B.chest)],
    [0.805, f ? 0.075 : 0.082, 0.05, w1(B.chest)],
    [0.83, 0.04, 0.038, w2(B.chest, B.neck, 0.5)],
  ];
  const torso: Ring[] = T.map(([y, rx, rz, bw, tw], i) =>
    R([0, y * S, i >= 8 ? -0.006 * S : 0], rx * S * (i > 0 && i < 8 ? b : 1), rz * S * (i > 0 && i < 8 ? (0.9 + 0.1 * b) : 1), torsoColor(y * S + (i === 2 ? -0.001 : 0.001)), bw, 10, tw),
  );
  if (top.type === 'none') torso[2].color = bot.color;
  bld.loft(torso, true, false);

  // neck
  bld.loft([
    R([0, 0.815 * S, -0.008 * S], 0.038 * S, 0.036 * S, skin, w2(B.chest, B.neck, 0.5), 8),
    R([0, 0.845 * S, -0.008 * S], 0.034 * S, 0.034 * S, skin, w1(B.neck), 8),
    R([0, 0.875 * S, -0.004 * S], 0.034 * S, 0.034 * S, skin, w2(B.neck, B.head, 0.6), 8),
  ]);

  // ---------- head (with face sculpt via per-vertex tweaks) ----------
  const hy0 = 0.862 * S; // chin
  const hh = 0.138 * S; // chin → top
  const hw = (f ? 0.062 : 0.066) * S;
  const hd = (f ? 0.088 : 0.094) * S;
  const face = (t: number) => (a: number, p: THREE.Vector3) => {
    const fr = Math.cos(a);
    const sideA = Math.abs(Math.sin(a));
    if (t > 0.36 && t < 0.46 && fr > 0.95) p.z += 0.26 * hd; // nose tip
    if (t > 0.3 && t < 0.36 && fr > 0.95) p.z += 0.08 * hd; // under the nose
    if (t > 0.46 && t < 0.56 && fr > 0.95) p.z += 0.16 * hd; // nose bridge
    if (t > 0.46 && t < 0.56 && fr > 0.5 && fr < 0.95 && sideA > 0.25) p.z -= 0.07 * hd; // eye sockets
    if (t > 0.58 && t < 0.66 && fr > 0.5) p.z += 0.05 * hd; // brow ridge
    if (t < 0.15 && fr > 0.6) p.z += 0.08 * hd; // chin forward
    if (t > 0.2 && t < 0.3 && fr > 0.95) p.z += 0.02 * hd; // lips
  };
  const HP: [number, number, number, number][] = [
    // t, rx, rz, zOffset (fractions)
    [0.0, 0.28, 0.36, 0.3],
    [0.1, 0.56, 0.68, 0.12],
    [0.22, 0.8, 0.84, 0.06],
    [0.259, 0.82, 0.86, 0.05], // lower lip (band above it = mouth opening)
    [0.26, 0.82, 0.86, 0.05], // upper lip
    [0.33, 0.86, 0.88, 0.04],
    [0.4, 0.9, 0.9, 0.02],
    [0.52, 0.96, 0.95, 0],
    [0.62, 1.0, 1.0, -0.02],
    [0.78, 0.97, 0.97, -0.04],
    [0.9, 0.78, 0.8, -0.06],
    [0.98, 0.42, 0.45, -0.06],
  ];
  const headRings = HP.map(([t, rx, rz, zo]) => R([0, hy0 + t * hh, zo * hd], rx * hw, rz * hd, skin, w1(B.head), 14, face(t), t));
  headRings[3].color = '#4a1c22'; // zero-height band between the lips: opens with jawOpen
  bld.loft(headRings, true, true);

  // ears
  const box = new THREE.BoxGeometry(1, 1, 1);
  for (const s of [1, -1]) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(s * hw * 0.93, hy0 + 0.46 * hh, -0.14 * hd), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s * 0.35, 0)), new THREE.Vector3(0.011 * S, 0.032 * S, 0.02 * S));
    bld.geo(box, m, skin, B.head);
  }

  // ---------- hair ----------
  const hs = spec.hair.style;
  if (hs !== 'bald') {
    const thick = hs === 'buzz' ? 1.03 : 1.08;
    const front = hs === 'buzz' ? 0.8 : 0.76;
    const back = hs === 'long' || hs === 'bob' ? 0.3 : 0.38;
    const hairRings: Ring[] = [];
    const steps = [0, 0.25, 0.5, 0.75, 1];
    for (const k of steps) {
      // bottom ring is tilted: high at the front (hairline), low at the back (nape)
      const tw = (a: number, p: THREE.Vector3) => {
        const fr = (Math.cos(a) + 1) / 2;
        const tb = back + (front - back) * fr;
        const tt = tb + (1 - tb) * k;
        // find head profile at tt
        let i = 0;
        while (i < HP.length - 2 && HP[i + 1][0] < tt) i++;
        const [t0, rx0, rz0, z0] = HP[i];
        const [t1, rx1, rz1, z1] = HP[i + 1];
        const u = Math.min(1, Math.max(0, (tt - t0) / (t1 - t0)));
        const rx = (rx0 + (rx1 - rx0) * u) * hw * thick;
        const rz = (rz0 + (rz1 - rz0) * u) * hd * thick;
        const zo = (z0 + (z1 - z0) * u) * hd;
        p.set(Math.sin(a) * rx, hy0 + tt * hh, zo + Math.cos(a) * rz);
        if (k === 1) p.set(p.x * 0.4, p.y + 0.01 * S, p.z * 0.4);
        if (hs === 'short' && k > 0.3 && k < 0.9) p.y += 0.008 * S; // volume
      };
      hairRings.push(R([0, 0, 0], 1, 1, hairC, w1(B.head), 14, tw));
    }
    bld.loft(hairRings, false, true);
    if (hs === 'long' || hs === 'bob') {
      const endY = hs === 'long' ? 0.74 * S : 0.84 * S;
      const curtain = (y: number, k: number) =>
        R([0, y, -0.012 * S], hw * (1.06 + 0.05 * k), hd * 0.92, hairC, w1(B.head), 10, (a, p) => {
          if (Math.cos(a) > 0.15) p.z = Math.min(p.z, -0.01 * S + (0.25 - k * 0.2) * hd); // open at the face
        });
      bld.loft([curtain(endY, 1), curtain((endY + hy0 + 0.45 * hh) / 2, 0.6), curtain(hy0 + 0.45 * hh, 0.2)], true, false);
    }
    if (hs === 'ponytail') {
      const px = 0;
      bld.loft(
        [
          R([px, hy0 + 0.25 * hh, -hd * 1.15], 0.012 * S, 0.012 * S, hairC, w1(B.head), 6),
          R([px, hy0 + 0.45 * hh, -hd * 1.18], 0.028 * S, 0.026 * S, hairC, w1(B.head), 6),
          R([px, hy0 + 0.62 * hh, -hd * 1.05], 0.022 * S, 0.02 * S, hairC, w1(B.head), 6),
        ],
        true,
        true,
      );
    }
  }

  // ---------- arms ----------
  for (const [side, s] of [['L', 1], ['R', -1]] as const) {
    const ua = abs[`upperArm.${side}`];
    const fa = abs[`foreArm.${side}`];
    const ha = abs[`hand.${side}`];
    const lerp = (p: V3, q: V3, k: number): V3 => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
    const bu = B[`upperArm.${side}`];
    const bf = B[`foreArm.${side}`];
    const bh = B[`hand.${side}`];
    const bs = B[`shoulder.${side}`];
    const sleeve = top.type === 'tshirt' ? 0.5 : top.type === 'longsleeve' ? 2 : -1;
    const ab = 0.55 + 0.45 * b;
    const armC = (u: number) => (u <= sleeve ? top.color : skin); // u: 0 shoulder … 1 elbow … 2 wrist
    const rings: Ring[] = [];
    const add = (u: number, rx: number, rz: number, bw: [W, number[]], bump = 1) => {
      const c = u <= 1 ? lerp(ua, fa, u) : lerp(fa, ha, u - 1);
      rings.push(R([c[0] - s * (u === 0 ? 0.012 * S : 0), c[1] + (u === 0 ? 0.012 * S : 0), c[2]], rx * S * ab * bump, rz * S * ab * bump, armC(u), bw, 7));
    };
    add(0, 0.038, 0.042, w2(bs, bu, 0.5));
    add(0.25, 0.04, 0.042, w1(bu));
    if (sleeve > 0 && sleeve < 1) {
      add(sleeve, 0.037, 0.039, w1(bu), 1.16);
      rings[rings.length - 1].color = top.color;
      const c = lerp(ua, fa, sleeve);
      rings.push(R([c[0], c[1] - 0.001 * S, c[2]], 0.034 * S * ab, 0.036 * S * ab, skin, w1(bu), 7));
    }
    add(0.75, 0.032, 0.034, w1(bu));
    add(1, 0.028, 0.03, w2(bu, bf, 0.5));
    add(1.3, 0.03, 0.03, w1(bf));
    add(1.95, 0.021, 0.017, w2(bf, bh, 0.3));
    if (sleeve >= 2) for (const r of rings) r.color = top.color;
    bld.loft(rings);
    // watch
    if (spec.watch && side === 'R') {
      const c = lerp(fa, ha, 0.9);
      bld.loft([R(c, 0.024 * S, 0.02 * S, spec.watch, w1(bf), 7), R([c[0], c[1] + 0.012 * S, c[2]], 0.024 * S, 0.02 * S, spec.watch, w1(bf), 7)]);
    }
    // hand: mitten loft + thumb
    const d = dArm(s);
    const hp = (k: number): V3 => [ha[0] + d[0] * k * S, ha[1] + d[1] * k * S, ha[2]];
    bld.loft(
      [
        R(hp(-0.005), 0.021 * S, 0.017 * S, skin, w1(bh), 7),
        R(hp(0.045), 0.026 * S, 0.012 * S, skin, w1(bh), 7),
        R(hp(0.075), 0.025 * S, 0.011 * S, skin, w1(bh), 7),
        R(hp(0.1), 0.018 * S, 0.009 * S, skin, w1(bh), 7),
      ],
      false,
      true,
    );
    const tm = new THREE.Matrix4().compose(new THREE.Vector3(...hp(0.04)).add(new THREE.Vector3(-s * 0.018 * S, 0, 0.014 * S)), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, s * 0.4)), new THREE.Vector3(0.012 * S, 0.04 * S, 0.012 * S));
    bld.geo(box, tm, skin, bh);
  }

  // ---------- legs ----------
  for (const [side, s] of [['L', 1], ['R', -1]] as const) {
    const th = abs[`thigh.${side}`];
    const sh = abs[`shin.${side}`];
    const ft = abs[`foot.${side}`];
    const bt = B[`thigh.${side}`];
    const bs = B[`shin.${side}`];
    const bfoot = B[`foot.${side}`];
    const lb = 0.55 + 0.45 * b;
    const hemY = bot.type === 'shorts' || bot.type === 'cargo' ? (bot.type === 'cargo' ? 0.33 : 0.36) * S : bot.type === 'pants' ? 0.06 * S : 1e9;
    const legC = (y: number) => (y >= hemY ? bot.color : skin);
    const P = (y: number): V3 => {
      // along thigh→shin→foot polyline
      if (y >= sh[1]) {
        const k = (th[1] - y) / (th[1] - sh[1]);
        return [th[0] + (sh[0] - th[0]) * k, y, th[2] + (sh[2] - th[2]) * k];
      }
      const k = (sh[1] - y) / (sh[1] - ft[1]);
      return [sh[0] + (ft[0] - sh[0]) * k, y, sh[2] + (ft[2] - sh[2]) * k];
    };
    const rings: Ring[] = [];
    const add = (yf: number, rx: number, rz: number, bw: [W, number[]], color?: string) =>
      rings.push(R(P(yf * S), rx * S * lb, rz * S * lb, color ?? legC(yf * S), bw, 8, (a, p) => {
        if (yf > 0.43) p.x += s * 0.004 * S * Math.max(0, Math.sin(a) * s); // outer hip
      }));
    add(0.5, f ? 0.062 : 0.058, 0.062, w2(B.hips, bt, 0.5));
    add(0.44, 0.064, 0.064, w1(bt));
    if (hemY < 0.45 * S && hemY > 0.25 * S) {
      add(hemY / S + 0.001, 0.056 * (bot.type === 'cargo' ? 1.18 : 1.12), 0.056 * 1.12, w1(bt), bot.color);
      add(hemY / S - 0.001, 0.05, 0.05, w2(bt, bs, 0.15), skin);
    }
    add(0.3, 0.045, 0.047, w2(bt, bs, 0.5));
    add(0.22, 0.047, 0.05, w1(bs));
    add(0.1, 0.03, 0.033, w1(bs));
    add(0.06, 0.027, 0.03, w2(bs, bfoot, 0.5));
    if (bot.type === 'pants') for (const r of rings) r.color = bot.color;
    bld.loft(rings);
    if (bot.type === 'cargo') {
      const pm = new THREE.Matrix4().compose(new THREE.Vector3(...P(0.38 * S)).add(new THREE.Vector3(s * 0.058 * S, 0, 0)), new THREE.Quaternion(), new THREE.Vector3(0.014 * S, 0.05 * S, 0.045 * S));
      bld.geo(box, pm, bot.color, bt);
    }
    // shoe: shaped box
    const shoe = new THREE.BoxGeometry(1, 1, 1, 1, 1, 2);
    const sp = shoe.getAttribute('position');
    for (let i = 0; i < sp.count; i++) {
      const y = sp.getY(i);
      const z = sp.getZ(i);
      if (z > 0.1 && y > 0) sp.setY(i, y - 0.35); // toe slope
      if (z > 0.4) sp.setX(i, sp.getX(i) * 0.8);
    }
    const sl = spec.shoes.type === 'boot' ? 1.4 : 1;
    const shoeM = new THREE.Matrix4().compose(new THREE.Vector3(ft[0], 0.024 * S * sl, ft[2] + 0.035 * S), new THREE.Quaternion(), new THREE.Vector3(0.05 * S, 0.048 * S * sl, 0.14 * S));
    bld.geo(shoe, shoeM, spec.shoes.color, bfoot);
    const soleM = new THREE.Matrix4().compose(new THREE.Vector3(ft[0], 0.005 * S, ft[2] + 0.035 * S), new THREE.Quaternion(), new THREE.Vector3(0.052 * S, 0.01 * S, 0.142 * S));
    bld.geo(box, soleM, spec.shoes.sole ?? (spec.shoes.type === 'sneaker' ? '#f4f4f4' : '#2b2622'), bfoot);
  }

  // skirt (flared loft on hips)
  if (bot.type === 'skirt') {
    bld.loft(
      [
        R([0, 0.36 * S, 0.004 * S], 0.15 * S * b, 0.13 * S, bot.color, w1(B.hips), 10),
        R([0, 0.47 * S, 0], 0.118 * S * b, 0.088 * S, bot.color, w1(B.hips), 10),
        R([0, 0.565 * S, 0], 0.1 * S * b, 0.072 * S, bot.color, w1(B.hips), 10),
      ],
      true,
      false,
    );
  }

  // ---------- geometry, morph targets ----------
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(bld.pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(bld.col, 3));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(bld.si, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(bld.sw, 4));
  g.setIndex(bld.idx);
  const morph = (fn: (t: number, a: number) => V3) => {
    const arr = new Float32Array(bld.pos.length);
    bld.tags.forEach(({ t, a }, i) => {
      if (t < 0) return;
      const [dx, dy, dz] = fn(t, a);
      arr[i * 3] = dx;
      arr[i * 3 + 1] = dy;
      arr[i * 3 + 2] = dz;
    });
    return new THREE.Float32BufferAttribute(arr, 3);
  };
  const fr = (a: number) => Math.max(0, Math.cos(a));
  g.morphAttributes.position = [
    // 0 jawOpen: everything below the upper lip drops and tucks back
    morph((t, a) => (t <= 0.2595 ? [0, -0.14 * hh * fr(a) ** 1.5, -0.05 * hd * fr(a)] : [0, 0, 0])),
    // 1 smile: mouth corners up and out
    morph((t, a) => (t >= 0.2 && t <= 0.3 && fr(a) > 0.3 && fr(a) < 0.97 ? [Math.sign(Math.sin(a)) * 0.06 * hw, 0.09 * hh, 0.02 * hd] : [0, 0, 0])),
    // 2 browUp
    morph((t, a) => (t >= 0.58 && t <= 0.8 && fr(a) > 0.3 ? [0, 0.04 * hh * (t < 0.7 ? 1 : 0.4), 0] : [0, 0, 0])),
  ];
  g.morphTargetsRelative = true; // morph arrays are offsets, not absolute positions
  g.computeVertexNormals();
  g.computeBoundingSphere();

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92, metalness: 0 });
  const mesh = new THREE.SkinnedMesh(g, mat);
  mesh.morphTargetDictionary = { jawOpen: 0, smile: 1, browUp: 2 };
  mesh.morphTargetInfluences = [0, 0, 0];
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  const hips = bones.hips;
  mesh.add(hips);
  mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(BONES.map((n) => bones[n])));

  // eyes, mouth interior and brows on the head bone (for blinking / brow animation)
  const headAbs = new THREE.Vector3(...abs.head);
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#1c1714', roughness: 0.4, flatShading: true });
  const eyes: THREE.Mesh[] = [];
  const browsMeshes: THREE.Mesh[] = [];
  const oct = new THREE.OctahedronGeometry(1, 0);
  for (const s of [1, -1]) {
    const e = new THREE.Mesh(oct, eyeMat);
    e.position.set(s * 0.3 * hw, hy0 + 0.51 * hh, 0.86 * hd).sub(headAbs);
    e.scale.set(0.013 * S, 0.0105 * S, 0.005 * S);
    e.userData.base = e.scale.y;
    bones.head.add(e);
    eyes.push(e);
    const br = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: browC, flatShading: true }));
    br.position.set(s * 0.3 * hw, hy0 + 0.6 * hh, 0.93 * hd).sub(headAbs);
    br.rotation.set(0, s * 0.25, s * -0.08);
    br.scale.set(0.022 * S, 0.004 * S, 0.004 * S);
    br.userData.baseY = br.position.y;
    bones.head.add(br);
    browsMeshes.push(br);
  }
  const mouthIn = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#3a1418' }));
  mouthIn.position.set(0, hy0 + 0.235 * hh, 0.55 * hd).sub(headAbs);
  mouthIn.scale.set(0.03 * S, 0.018 * S, 0.02 * S);
  bones.head.add(mouthIn);

  const root = new THREE.Group();
  root.add(mesh);
  return { root, mesh, bones, eyes, browsMeshes, S, spec };
}

/* ---------------- posing & face ---------------- */

export interface HumanPose {
  walk?: number; // phase in radians (undefined = standing)
  stride?: number;
  armsUp?: number;
  wave?: number; // right arm wave 0..1
  turnHead?: number;
  lookDown?: number;
}

export function poseHuman(h: Human, p: HumanPose = {}) {
  const b = h.bones;
  for (const n of Object.keys(b)) b[n].rotation.set(0, 0, 0);
  if (p.walk !== undefined) {
    const s = p.stride ?? 1;
    const φ = p.walk;
    const leg = (side: 'L' | 'R', ph: number) => {
      b[`thigh.${side}`].rotation.x = -0.42 * Math.sin(ph) * s;
      b[`shin.${side}`].rotation.x = Math.max(0, 0.9 * Math.sin(ph - 1.3)) * s + 0.05;
      b[`foot.${side}`].rotation.x = -0.15 * Math.sin(ph) * s;
    };
    leg('L', φ);
    leg('R', φ + Math.PI);
    const arm = (side: 'L' | 'R', ph: number) => {
      b[`upperArm.${side}`].rotation.x = 0.35 * Math.sin(ph) * s;
      b[`foreArm.${side}`].rotation.x = -0.25 - 0.2 * Math.max(0, Math.sin(ph)) * s;
    };
    arm('L', φ + Math.PI);
    arm('R', φ);
    b.hips.position.y = 0.52 * h.S + Math.abs(Math.cos(φ)) * 0.012 * h.S - 0.006 * h.S;
    b.hips.rotation.y = 0.08 * Math.sin(φ) * s;
    b.chest.rotation.y = -0.12 * Math.sin(φ) * s;
    b.spine.rotation.x = 0.04;
  }
  if (p.wave) {
    b['upperArm.R'].rotation.z = -2.4 * p.wave;
    b['foreArm.R'].rotation.z = -0.5 * p.wave;
    b['foreArm.R'].rotation.x = -0.3 * p.wave;
  }
  if (p.armsUp) {
    b['upperArm.L'].rotation.z = 2.6 * p.armsUp;
    b['upperArm.R'].rotation.z = -2.6 * p.armsUp;
  }
  b.head.rotation.y = p.turnHead ?? 0;
  b.head.rotation.x = p.lookDown ?? 0;
}

export interface Face {
  jaw?: number;
  smile?: number;
  brow?: number; // -1 frown … 1 raised
  blink?: number; // 0 open … 1 closed
}
export function setFace(h: Human, f: Face) {
  const inf = h.mesh.morphTargetInfluences!;
  inf[0] = f.jaw ?? 0;
  inf[1] = f.smile ?? 0;
  inf[2] = f.brow ?? 0;
  for (const e of h.eyes) e.scale.y = e.userData.base * Math.max(0.08, 1 - (f.blink ?? 0));
  h.browsMeshes.forEach((br, i) => {
    br.position.y = br.userData.baseY + (f.brow ?? 0) * 0.008 * h.S;
    br.rotation.z = (i === 0 ? -1 : 1) * (0.08 + Math.max(0, -(f.brow ?? 0)) * 0.25);
  });
}
