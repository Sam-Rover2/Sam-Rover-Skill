/** Shot list — filled in after the characters are approved (stage 1). */
export interface ShotDef {
  from: number;
  to: number;
  name: string;
  C: React.FC<{ t: number; k: number }>;
}
export const FILM_SECONDS = 805.4;
export const SHOTS: ShotDef[] = [];
