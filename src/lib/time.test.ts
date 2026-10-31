import { describe, expect, it } from 'vitest';
import { buildTrimArgs, clampRange, formatTime, toFrames, validateSegment } from './time';

describe('time helpers', () => {
  it('formats seconds', () => {
    expect(formatTime(0)).toBe('00:00.00');
    expect(formatTime(75.5)).toBe('01:15.50');
    expect(formatTime(NaN)).toBe('00:00.00');
  });

  it('clamps and orders ranges', () => {
    expect(clampRange(-5, 3, 10)).toEqual([0, 3]);
    expect(clampRange(8, 2, 10)).toEqual([2, 8]);
    expect(clampRange(4, 50, 10)).toEqual([4, 10]);
  });

  it('converts to frames', () => {
    expect(toFrames(1)).toBe(30);
    expect(toFrames(0.5)).toBe(15);
  });

  it('validates segments', () => {
    expect(validateSegment({ start: 1, end: 1.05 }, 10)).not.toBeNull();
    expect(validateSegment({ start: 1, end: 11 }, 10)).not.toBeNull();
    expect(validateSegment({ start: 1, end: 3 }, 10)).toBeNull();
  });

  it('builds ffmpeg trim args', () => {
    const args = buildTrimArgs(1.5, 4);
    expect(args.slice(0, 2)).toEqual(['-ss', '1.500']);
    expect(args).toContain('2.500');
    expect(args.at(-1)).toBe('output.mp4');
  });
});
