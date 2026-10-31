import { useCurrentFrame, useVideoConfig } from 'remotion';
import { P } from './lib/style';
import type { Look } from './rig/Character';

export const MAX: Look = { skin: P.skinTan, top: 'sweater', topColor: P.yellow, hair: 'short', hairColor: P.hairDark, glasses: true };
export const LENA: Look = { skin: P.skinPeach, top: 'hoodie', topColor: P.coral, hair: 'bob', hairColor: P.hairAuburn, shoe: P.navy };
export const VENDOR: Look = { skin: P.skinBrown, top: 'apron', topColor: P.navy, hair: 'grey', hairColor: P.hairGrey };
export const BEANIE: Look = { skin: P.skinPeach, top: 'hoodie', topColor: P.teal, hair: 'beanie', hairColor: P.green };
export const BUN: Look = { skin: P.skinLight, top: 'sweater', topColor: P.lilac, hair: 'bun', hairColor: P.hairBrown };
export const SHIRT: Look = { skin: P.skinTan, top: 'shirt', topColor: P.wallBlue, hair: 'short', hairColor: P.hairBrown, tie: P.navy };

/** Local time of the current <Sequence>, in seconds (fps-independent). */
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
