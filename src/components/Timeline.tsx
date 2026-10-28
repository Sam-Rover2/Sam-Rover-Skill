import { useRef } from 'react';
import type { Segment } from '../types';
import { formatTime } from '../lib/time';

interface Props {
  duration: number;
  currentTime: number;
  segments: Segment[];
  selectedId: string | null;
  draft: [number, number];
  onSeek: (sec: number) => void;
  onSelect: (id: string) => void;
}

/** Horizontal bar: segments as colored blocks, draft range as outline, red playhead. */
export function Timeline({ duration, currentTime, segments, selectedId, draft, onSeek, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = (t: number) => `${(duration ? t / duration : 0) * 100}%`;

  const seekFromEvent = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    onSeek(((e.clientX - rect.left) / rect.width) * duration);
  };

  return (
    <div className="timeline">
      <div className="timeline-track" ref={ref} onMouseDown={seekFromEvent}>
        <div className="timeline-draft" style={{ left: pct(draft[0]), width: pct(draft[1] - draft[0]) }} />
        {segments.map((s, i) => (
          <div
            key={s.id}
            className={`timeline-seg ${s.id === selectedId ? 'selected' : ''}`}
            style={{ left: pct(s.start), width: pct(s.end - s.start) }}
            title={s.prompt}
            onMouseDown={(e) => {
              e.stopPropagation();
              onSelect(s.id);
            }}
          >
            {i + 1}
          </div>
        ))}
        <div className="timeline-playhead" style={{ left: pct(currentTime) }} />
      </div>
      <div className="timeline-labels">
        <span>{formatTime(0)}</span>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
