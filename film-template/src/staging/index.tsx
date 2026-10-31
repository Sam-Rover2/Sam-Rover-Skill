import type { Pose } from '../rig/Character';
import { sit } from '../rig/motion';
import { PaperCup } from '../props/Props';

type V3 = [number, number, number];

/**
 * Stage 4: STAGING (blocking) of each part, WITHOUT animation: where every character and object
 * stands in the location, who interacts with what (sits in a car, holds a cup…), and the planned
 * shot cameras. Reviewed in review.html (free fly + shot cameras) before any animation.
 */
export interface Shot {
  name: string;
  pos: V3;
  target: V3;
  fov?: number;
  note?: string;
}
export interface Staging {
  id: string; // = part id
  name: string;
  status: 'draft' | 'approved';
  location: string; // LOCATIONS id
  actors: { cast: string; pos: V3; rotY?: number; pose?: Pose; note?: string }[];
  objects: { obj: string; pos: V3; rotY?: number }[];
  shots: Shot[];
}

export const STAGINGS: Staging[] = [
  {
    id: 'part01',
    name: 'Часть 1 · встреча у скамейки (пример)',
    status: 'draft',
    location: 'street',
    objects: [
      { obj: 'bench', pos: [1.2, 0, 1.4] },
      { obj: 'car', pos: [-8, 0, 6.5], rotY: 0 },
    ],
    actors: [
      { cast: 'hero', pos: [0.6, 0, 1.4], rotY: 0.2, pose: { ...sit(0.66), expr: 'smile' }, note: 'сидит на скамейке' },
      {
        cast: 'friend',
        pos: [3.4, 0, 2.2],
        rotY: -0.7,
        pose: { handR: [0.45, 2.2, 0.5], holdR: <PaperCup position={[0, 0.05, 0.05]} />, expr: 'grin' },
        note: 'стоит рядом, держит кофе',
      },
    ],
    shots: [
      { name: 'Общий', pos: [1.5, 4.5, 16], target: [1.5, 2.2, 1.5], fov: 40, note: 'знакомство с местом' },
      { name: 'Двойной', pos: [2.4, 3.4, 12], target: [2, 2.6, 1.6], fov: 34, note: 'разговор' },
      { name: 'Крупно герой', pos: [1.4, 3.1, 6.5], target: [0.6, 2.7, 1.4], fov: 30, note: 'реакция' },
    ],
  },
];
