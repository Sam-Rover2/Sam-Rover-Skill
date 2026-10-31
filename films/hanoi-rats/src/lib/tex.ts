import * as THREE from 'three';

/**
 * Procedural textures drawn on a canvas (wood, metal, labels, posters).
 * Works both in Remotion (headless Chrome) and in review.html. Cached by key.
 */
const cache = new Map<string, THREE.CanvasTexture>();

export function canvasTex(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) {
  const k = `${key}|${repeat?.join('x') ?? ''}`;
  let t = cache.get(k);
  if (!t) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    draw(g, w, h);
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    if (repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(...repeat);
    }
    cache.set(k, t);
  }
  return t;
}

let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/** Wooden planks with grain and knots. */
export const woodTex = (base = '#b9804c', dark = '#8e5d33', planks = 4, repeat?: [number, number]) =>
  canvasTex(`wood-${base}-${planks}`, 256, 256, (g, w, h) => {
    seed = 7;
    const ph = h / planks;
    for (let i = 0; i < planks; i++) {
      g.fillStyle = i % 2 ? base : shade(base, -8);
      g.fillRect(0, i * ph, w, ph);
      g.strokeStyle = dark;
      g.globalAlpha = 0.35;
      g.lineWidth = 1;
      for (let k = 0; k < 6; k++) {
        const y = i * ph + rnd() * ph;
        g.beginPath();
        g.moveTo(0, y);
        g.bezierCurveTo(w * 0.3, y + (rnd() - 0.5) * 6, w * 0.7, y + (rnd() - 0.5) * 6, w, y + (rnd() - 0.5) * 4);
        g.stroke();
      }
      g.globalAlpha = 0.5;
      g.beginPath();
      g.ellipse(rnd() * w, i * ph + ph / 2, 6, 3, 0, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
      g.fillStyle = dark;
      g.fillRect(0, i * ph, w, 2);
    }
  }, repeat);

/** Label / poster: background, border and lines of text. */
export const labelTex = (key: string, lines: { text: string; size: number; color?: string; font?: string }[], bg = '#f3e6c4', border = '#5a3a24', w = 512, h = 512) =>
  canvasTex(`label-${key}`, w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    // paper grain
    seed = 3;
    for (let i = 0; i < 400; i++) {
      g.fillStyle = `rgba(90,60,30,${rnd() * 0.06})`;
      g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 2 + rnd() * 3);
    }
    g.strokeStyle = border;
    g.lineWidth = w * 0.025;
    g.strokeRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92);
    const total = lines.reduce((s, l) => s + l.size * 1.25, 0);
    let y = h / 2 - total / 2;
    g.textAlign = 'center';
    g.textBaseline = 'top';
    for (const l of lines) {
      g.fillStyle = l.color ?? border;
      g.font = `${l.font ?? '900'} ${l.size}px Georgia, 'Times New Roman', serif`;
      g.fillText(l.text, w / 2, y, w * 0.86);
      y += l.size * 1.25;
    }
  });

/** Rusty / dark metal with subtle noise. */
export const metalTex = (base = '#6e7380') =>
  canvasTex(`metal-${base}`, 128, 128, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    seed = 11;
    for (let i = 0; i < 300; i++) {
      g.fillStyle = rnd() > 0.7 ? 'rgba(150,80,40,0.18)' : `rgba(0,0,0,${rnd() * 0.12})`;
      g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 4, 2 + rnd() * 4);
    }
  });

export function shade(hex: string, d: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + d));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join('')}`;
}
