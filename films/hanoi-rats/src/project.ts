/**
 * The film being produced. Claude fills this in stage by stage (see .claude/skills/pipeline).
 * status: 'draft' → shown in the player for review; 'approved' → user said OK.
 */
import type { Look } from './rig/Character';
import { P } from './lib/style';

export const PROJECT = {
  title: 'Крысы Ханоя',
  fps: 120, // final render
  previewFps: 30, // fast preview in the player
  // vertical 9:16 like the reference films (references/REFERENCE.md); use 1920×1080 for horizontal
  width: 1080,
  height: 1920,
};

/* ---------- Stage 1: characters (style of references/: white head, pill body, long legs) ---------- */
import type { PersonLook, RatPose } from './rig/Person';

export interface CastMember {
  id: string;
  name: string;
  role: string;
  kind: 'person' | 'rat';
  look?: PersonLook; // person
  rat?: RatPose; // rat
  status: 'draft' | 'approved';
}

export const CAST: CastMember[] = [
  { id: 'inspector', name: 'Инспектор', role: 'санитарный инспектор: китель, пробковый шлем, усы', kind: 'person', status: 'approved',
    look: { body: '#f1ead6', outfit: 'colonial', hat: 'pith', moustache: 'thin', hairColor: '#4a3426', shoe: '#5a3a24' } },
  { id: 'inspector2', name: 'Инспектор-2', role: 'напарник: в очках, моложе', kind: 'person', status: 'approved',
    look: { body: '#e8dfc6', outfit: 'colonial', hat: 'pith', glasses: true, build: 0.92, height: 0.97, shoe: '#5a3a24' } },
  { id: 'governor', name: 'Генерал-губернатор', role: '«правительство»: бордовый сюртук, котелок, очки, седые усы — НЕ тот чиновник, что строил канализацию', kind: 'person', status: 'draft',
    look: { body: '#7a1f2b', outfit: 'frock', hat: 'bowler', hatColor: '#1b1b1f', moustache: 'thin', glasses: true, hairColor: '#b9b9c2', build: 1.3, height: 1.04, shoe: '#1b1b1f' } },
  { id: 'official', name: 'Чиновник', role: 'французский колониальный чиновник: синий мундир, кепи, пышные усы, монокль', kind: 'person', status: 'approved',
    look: { body: '#2f3d73', outfit: 'frock', hat: 'kepi', moustache: 'big', monocle: true, hairColor: '#2a2420', build: 1.18, shoe: '#1b1b1f' } },
  { id: 'catcher', name: 'Ловец', role: 'хитрый ловец крыс: нон-ла, рубаха, хитрая улыбка', kind: 'person', status: 'approved',
    look: { body: '#4f7f8a', outfit: 'tunic', trim: '#2f5560', hat: 'nonla', shoe: '#6b5444' } },
  { id: 'farmer', name: 'Фермер', role: 'владелец крысиной фермы: нон-ла, фартук', kind: 'person', status: 'approved',
    look: { body: '#9a5b3a', outfit: 'apron', trim: '#e8dcc0', hat: 'nonla', build: 1.25, shoe: '#4a3426' } },
  { id: 'citizen1', name: 'Горожанин', role: 'массовка: кепка', kind: 'person', status: 'approved',
    look: { body: '#6a8f4e', outfit: 'shirt', hat: 'cap', hatColor: '#6b5444', height: 0.95 } },
  { id: 'citizen2', name: 'Горожанка', role: 'массовка: нон-ла', kind: 'person', status: 'approved',
    look: { body: '#c96a6a', outfit: 'tunic', trim: '#8a3a3a', hat: 'nonla', height: 0.92, build: 0.9 } },
  { id: 'rat', name: 'Крыса', role: 'обычная крыса с хвостом', kind: 'rat', status: 'approved', rat: { tail: true, face: 'happy' } },
  { id: 'rat-cut', name: 'Крыса без хвоста', role: 'бесхвостая (обрубок с повязкой)', kind: 'rat', status: 'approved', rat: { tail: false, face: 'sly' } },
];
