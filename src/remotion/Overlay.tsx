import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Segment } from '../types';

/** Programmatic 2D animation drawn on top of the video for one segment. */
export const Overlay: React.FC<{ segment: Segment }> = ({ segment }) => {
  const frame = useCurrentFrame(); // frame counted from the start of the segment
  const { fps, durationInFrames } = useVideoConfig();
  const appear = spring({ frame, fps, config: { damping: 14 } });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut, pointerEvents: 'none' }}>
      {segment.effect === 'title' && segment.prompt && (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '8%' }}>
          <div
            style={{
              transform: `translateY(${(1 - appear) * 80}px) scale(${0.8 + appear * 0.2})`,
              background: 'rgba(0,0,0,0.65)',
              color: 'white',
              fontFamily: 'system-ui, sans-serif',
              fontSize: 48,
              fontWeight: 700,
              padding: '16px 32px',
              borderRadius: 16,
              maxWidth: '80%',
              textAlign: 'center',
            }}
          >
            {segment.prompt}
          </div>
        </AbsoluteFill>
      )}

      {segment.effect === 'shapes' &&
        Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 + frame / 30;
          const r = 200 * appear;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `calc(50% + ${Math.cos(angle) * r}px - 20px)`,
                top: `calc(50% + ${Math.sin(angle) * r}px - 20px)`,
                width: 40,
                height: 40,
                borderRadius: i % 2 ? '50%' : 8,
                background: `hsl(${i * 30 + frame * 2}, 80%, 60%)`,
                transform: `rotate(${frame * 4}deg)`,
              }}
            />
          );
        })}

      {segment.images[0] && (
        <Img
          src={segment.images[0].url}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: '22%',
            borderRadius: 12,
            border: '3px solid white',
            transform: `scale(${appear})`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
