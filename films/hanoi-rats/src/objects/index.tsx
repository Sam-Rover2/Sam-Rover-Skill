import { Model } from '../assets/Model';

/**
 * Stage 2: OBJECTS (props, vehicles, furniture, weapons…). Either built in code or an imported
 * model (GLB in public/models/). Each is reviewed alone in review.html before it goes into scenes.
 * `height` = real height in units (1 m = 2.2) — used to check scale next to a character.
 */
export interface Obj {
  id: string;
  name: string;
  status: 'draft' | 'approved';
  source: 'code' | 'model';
  C: React.FC;
}

/** Filled in at stage 2 (after the cast is approved). */
export const OBJECTS: Obj[] = [];
export { Model };
