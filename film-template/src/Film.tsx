import { AbsoluteFill, Series, useVideoConfig } from 'remotion';
import { PARTS } from './parts';

/** Full film = approved parts in order (drafts are included only while nothing is approved yet). */
export const filmParts = () => {
  const ok = PARTS.filter((p) => p.status === 'approved');
  return ok.length ? ok : PARTS;
};

export const Film: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
  <AbsoluteFill style={{ background: '#111' }}>
    <Series>
      {filmParts().map((p) => (
        <Series.Sequence key={p.id} durationInFrames={Math.round(p.seconds * fps)}>
          <p.C />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
  );
};
