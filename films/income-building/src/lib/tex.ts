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

/** Weathered lime plaster: base colour, soft stains and drips. */
export const plasterTex = (base: string, repeat: [number, number] = [1, 1]) =>
  canvasTex(`plaster-${base}`, 256, 256, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    seed = 17;
    for (let i = 0; i < 26; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const r = 10 + rnd() * 40;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rnd() > 0.5 ? 'rgba(80,50,20,0.12)' : 'rgba(255,255,255,0.10)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.strokeStyle = 'rgba(70,45,20,0.15)';
    for (let i = 0; i < 10; i++) {
      const x = rnd() * w;
      g.lineWidth = 1 + rnd() * 2;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + (rnd() - 0.5) * 6, 30 + rnd() * 70);
      g.stroke();
    }
  }, repeat);

/** Terracotta roof tiles (rows of curved tiles). */
export const roofTex = (repeat: [number, number] = [4, 4]) =>
  canvasTex('roof', 128, 128, (g, w, h) => {
    g.fillStyle = '#a8492e';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16)
      for (let x = (y / 16) % 2 ? -8 : 0; x < w; x += 16) {
        const gr = g.createLinearGradient(x, 0, x + 16, 0);
        gr.addColorStop(0, '#8e3a22');
        gr.addColorStop(0.5, '#c4603e');
        gr.addColorStop(1, '#8e3a22');
        g.fillStyle = gr;
        g.fillRect(x + 1, y, 14, 15);
        g.fillStyle = 'rgba(40,15,5,0.45)';
        g.fillRect(x, y + 14, 16, 2);
      }
  }, repeat);

/** Packed dirt road with ruts and pebbles. */
export const dirtTex = (repeat: [number, number] = [8, 8]) =>
  canvasTex('dirt', 256, 256, (g, w, h) => {
    g.fillStyle = '#b59a72';
    g.fillRect(0, 0, w, h);
    seed = 23;
    for (let i = 0; i < 700; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(90,65,35,0.18)' : 'rgba(240,225,195,0.18)';
      const s = 1 + rnd() * 4;
      g.fillRect(rnd() * w, rnd() * h, s, s);
    }
    g.strokeStyle = 'rgba(90,65,35,0.18)';
    g.lineWidth = 6;
    for (const x of [w * 0.3, w * 0.7]) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 6, h);
      g.stroke();
    }
  }, repeat);

/** Stone slabs / cobbles. */
export const stoneTex = (base = '#a9a294', repeat: [number, number] = [6, 6], cell = 32) =>
  canvasTex(`stone-${base}-${cell}`, 128, 128, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    seed = 29;
    for (let y = 0; y < h; y += cell)
      for (let x = (y / cell) % 2 ? -cell / 2 : 0; x < w; x += cell) {
        g.fillStyle = shade(base, Math.round((rnd() - 0.5) * 24));
        g.fillRect(x + 2, y + 2, cell - 4, cell - 4);
      }
  }, repeat);

/** Vertical shop sign (Vietnamese characters on red or black lacquer). */
export const signTex = (key: string, lines: string[], bg = '#8a1c14', fg = '#f2c94c') =>
  canvasTex(`sign-${key}`, 128, 512, (g, w, h) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = fg;
    g.lineWidth = 8;
    g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = fg;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const step = (h - 60) / lines.length;
    lines.forEach((t, i) => {
      g.font = `900 ${Math.min(64, step * 0.8)}px Georgia, serif`;
      g.fillText(t, w / 2, 30 + step * (i + 0.5), w - 24);
    });
  });
