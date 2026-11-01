import '@fontsource/nunito/900.css';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CAPTION } from './style';

export interface Phrase {
  text: string;
  start: number; // seconds
  end: number;
}

/** Split a phrase into words; each word's time is proportional to its length. */
export function toWords(phrases: Phrase[]) {
  return phrases.flatMap((p) => {
    const words = p.text.split(' ');
    const total = words.reduce((s, w) => s + w.length + 2, 0);
    let t = p.start;
    return words.map((w, i) => {
      const d = ((w.length + 2) / total) * (p.end - p.start);
      const word = { text: w, start: t, end: i === words.length - 1 ? p.end : t + d };
      t += d;
      return word;
    });
  });
}

/** One word at a time, centred low, white with a thick dark outline. */
export const Captions: React.FC<{ phrases: Phrase[] }> = ({ phrases }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const word = toWords(phrases).find((w) => t >= w.start && t < w.end);
  if (!word) return null;
  const pop = spring({ frame: frame - Math.round(word.start * fps), fps, config: { damping: 12, stiffness: 240 } });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: CAPTION.bottom }}>
      <span
        style={{
          fontFamily: CAPTION.font,
          fontWeight: CAPTION.weight,
          fontSize: CAPTION.size,
          color: CAPTION.color,
          WebkitTextStroke: `${CAPTION.strokeWidth}px ${CAPTION.stroke}`,
          paintOrder: 'stroke fill',
          transform: `scale(${0.7 + 0.3 * pop})`,
          lineHeight: 1,
          textShadow: '0 6px 0 rgba(0,0,0,0.25)',
        }}
      >
        {word.text}
      </span>
    </AbsoluteFill>
  );
};
