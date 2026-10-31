import { useCurrentFrame, useVideoConfig } from 'remotion';
import { P } from './lib/style';
import type { Look } from './rig/Character';

export const MAX: Look = { skin: P.skinTan, top: 'sweater', topColor: P.yellow, hair: 'short', hairColor: P.hairDark, glasses: true };
export const LENA: Look = { skin: P.skinPeach, top: 'apron', topColor: P.lilac, hair: 'bob', hairColor: P.hairAuburn, shoe: P.navy };
export const LENA_COAT: Look = { ...LENA, top: 'hoodie', topColor: P.coral };
export const BEANIE: Look = { skin: P.skinPeach, top: 'hoodie', topColor: P.teal, hair: 'beanie', hairColor: P.green };
export const BOSS: Look = { skin: P.skinBrown, top: 'shirt', topColor: P.wallBlue, hair: 'grey', hairColor: P.hairGrey, tie: P.red };
export const BUN: Look = { skin: P.skinLight, top: 'sweater', topColor: P.coral, hair: 'bun', hairColor: P.hairBrown };

/** Local time of the current <Sequence>, in seconds (fps-independent). */
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
