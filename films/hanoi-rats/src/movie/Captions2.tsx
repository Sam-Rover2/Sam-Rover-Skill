import '@fontsource/nunito/900.css';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface Word {
  text: string;
  start: number;
  end: number;
}

/** Group words into short chunks (1–3 words, ≤ 16 letters), breaking after punctuation — like the reference films. */
export function chunks(words: Word[]) {
  const out: Word[] = [];
  let cur: Word | null = null;
  for (const w of words) {
    const gap = cur ? w.start - cur.end : 0;
    if (cur && (cur.text.split(' ').length >= 3 || (cur.text + ' ' + w.text).length > 16 || /[.,?!…]$/.test(cur.text) || gap > 0.25)) {
      out.push(cur);
      cur = null;
    }
    cur = cur ? { text: cur.text + ' ' + w.text, start: cur.start, end: w.end } : { ...w };
  }
  if (cur) out.push(cur);
  // hold each chunk until the next one starts (no flicker in short gaps)
  return out.map((c, i) => ({ ...c, end: Math.max(c.end, Math.min(out[i + 1]?.start ?? c.end + 0.4, c.end + 0.4)) }));
}

/** Captions like the references: white heavy rounded type with a dark outline, a bit below the centre. */
export const Captions2: React.FC<{ words: Word[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c = chunks(words).find((w) => t >= w.start && t < w.end);
  if (!c) return null;
  const pop = spring({ frame: frame - Math.round(c.start * fps), fps, config: { damping: 14, stiffness: 260 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', top: '66%', height: 'auto' }}>
      <span
        style={{
          fontFamily: 'Nunito',
          fontWeight: 900,
          fontSize: 76,
          color: '#ffffff',
          WebkitTextStroke: '13px #15121f',
          paintOrder: 'stroke fill',
          textShadow: '0 6px 0 rgba(10,8,20,.55)',
          letterSpacing: -0.5,
          transform: `scale(${0.85 + 0.15 * pop})`,
          whiteSpace: 'nowrap',
        }}
      >
        {c.text}
      </span>
    </AbsoluteFill>
  );
};
