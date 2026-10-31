import type { Segment } from '../types';

export const FPS = 30;

export function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

/** Keep a range inside [0, duration] with start < end. */
export function clampRange(start: number, end: number, duration: number): [number, number] {
  const s = Math.min(Math.max(0, start), duration);
  const e = Math.min(Math.max(0, end), duration);
  return s <= e ? [s, e] : [e, s];
}

export function toFrames(sec: number): number {
  return Math.round(sec * FPS);
}

export function validateSegment(seg: Pick<Segment, 'start' | 'end'>, duration: number): string | null {
  if (seg.end - seg.start < 0.1) return 'Диапазон должен быть не короче 0.1 с';
  if (seg.start < 0 || seg.end > duration + 1e-6) return 'Диапазон выходит за пределы видео';
  return null;
}

/** FFmpeg arguments to cut [start, end] out of input.mp4 into output.mp4. */
export function buildTrimArgs(start: number, end: number, input = 'input.mp4', output = 'output.mp4'): string[] {
  return [
    '-ss', start.toFixed(3),
    '-i', input,
    '-t', (end - start).toFixed(3),
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23',
    '-c:a', 'aac',
    '-movflags', '+faststart',
    output,
  ];
}
