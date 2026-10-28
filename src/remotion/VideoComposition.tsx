import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, useCurrentFrame, Video } from 'remotion';
import type { Segment } from '../types';
import { toFrames } from '../lib/time';
import { Overlay } from './Overlay';

export interface CompositionProps {
  videoUrl: string;
  segments: Segment[];
}

/** Zoom factor of the base video: "zoom" segments slowly push in. */
function useZoom(segments: Segment[]): number {
  const frame = useCurrentFrame();
  for (const s of segments) {
    if (s.effect !== 'zoom') continue;
    const a = toFrames(s.start);
    const b = toFrames(s.end);
    if (frame >= a && frame < b) {
      return interpolate(frame, [a, a + (b - a) / 2, b], [1, 1.3, 1]);
    }
  }
  return 1;
}

export const VideoComposition: React.FC<CompositionProps> = ({ videoUrl, segments }) => {
  const zoom = useZoom(segments);
  // In the browser Player <Video> is used; OffthreadVideo is only for server rendering.
  const Base = typeof window !== 'undefined' ? Video : OffthreadVideo;
  return (
    <AbsoluteFill style={{ background: 'black' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Base src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </AbsoluteFill>
      {segments.map((s) => {
        const from = toFrames(s.start);
        const len = Math.max(1, toFrames(s.end) - from);
        return (
          <Sequence key={s.id} from={from} durationInFrames={len} layout="none">
            <Overlay segment={s} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
