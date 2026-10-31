import type { PersonPose } from '../rig/Person';

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
  actors: { cast: string; pos: V3; rotY?: number; pose?: PersonPose; note?: string }[];
  objects: { obj: string; pos: V3; rotY?: number }[];
  shots: Shot[];
}

/** Filled in at stage 4 (after characters, objects and locations are approved). */
export const STAGINGS: Staging[] = [];
