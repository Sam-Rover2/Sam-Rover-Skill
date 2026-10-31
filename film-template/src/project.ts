/**
 * The film being produced. Claude fills this in stage by stage (see .claude/skills/pipeline).
 * status: 'draft' → shown in the player for review; 'approved' → user said OK.
 */
import type { Look } from './rig/Character';
import { P } from './lib/style';

export const PROJECT = {
  title: 'Новый ролик',
  fps: 120, // final render
  previewFps: 30, // fast preview in the player
  width: 1920,
  height: 1080,
};

/* ---------- Stage 1: characters ---------- */
export interface CastMember {
  id: string;
  name: string;
  role: string;
  look: Look;
  status: 'draft' | 'approved';
}
export const CAST: CastMember[] = [
  { id: 'hero', name: 'Герой', role: 'главный персонаж (пример)', look: { skin: P.skinTan, top: 'sweater', topColor: P.yellow, hair: 'short', hairColor: P.hairDark, glasses: true }, status: 'draft' },
  { id: 'friend', name: 'Подруга', role: 'второй персонаж (пример)', look: { skin: P.skinPeach, top: 'hoodie', topColor: P.coral, hair: 'bob', hairColor: P.hairAuburn, shoe: P.navy }, status: 'draft' },
];
