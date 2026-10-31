/**
 * Stage 5: the film is made in PARTS of 20–30 s. Each part is reviewed in the player
 * on its own; only approved parts go into the full film.
 */
export interface Part {
  id: string;
  name: string;
  seconds: number;
  status: 'draft' | 'approved';
  C: React.FC;
}

/** Filled in at stage 5, one part at a time, after its staging is approved. */
export const PARTS: Part[] = [];
