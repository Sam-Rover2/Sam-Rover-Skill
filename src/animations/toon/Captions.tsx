import '@fontsource/fredoka/700.css';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CAPTION } from './style';

export interface Word {
  text: string;
  start: number; // seconds
  end: number; // seconds
}

/** One word at a time, centred low, white with a thick dark outline — cartoon-explainer captions. */
export const Captions: React.FC<{ words: Word[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const word = words.find((w) => t >= w.start && t < w.end);
  if (!word) return null;
  const pop = spring({ frame: frame - Math.round(word.start * fps), fps, config: { damping: 12, stiffness: 220 } });
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
          letterSpacing: 1,
          transform: `scale(${0.7 + 0.3 * pop})`,
          lineHeight: 1,
        }}
      >
        {word.text}
      </span>
    </AbsoluteFill>
  );
};
