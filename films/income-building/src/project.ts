/**
 * The film being produced. Claude fills this in stage by stage (see .claude/skills/pipeline).
 * status: 'draft' → shown in the player for review; 'approved' → user said OK.
 */
import type { Look } from './rig/Character';
import { P } from './lib/style';

export const PROJECT = {
  title: 'Здание из 100 работников',
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
  // the guide: "So, I built a building"
  { id: 'host', name: 'Ведущий-архитектор', role: 'рассказчик, «построил здание»: жилет, галстук, очки, свёрнутый чертёж', kind: 'person', status: 'draft',
    look: { body: '#3a6fb0', outfit: 'vest', trim: '#c8302c', glasses: true, hair: 'side', hairColor: '#5a3a24', build: 1.0, shoe: '#2a2420' } },
  // the five doors (pay rises floor by floor)
  { id: 'door10', name: 'Дверь 10 · кассир', role: '$634/нед — нижний этаж: красный фартук, кепка магазина', kind: 'person', status: 'draft',
    look: { body: '#f2b233', outfit: 'apron', trim: '#c8302c', hat: 'visor', hatColor: '#c8302c', build: 0.95, shoe: '#2a2420' } },
  { id: 'door25', name: 'Дверь 25 · складской рабочий', role: '$849/нед: синий комбинезон, шапка-бини', kind: 'person', status: 'draft',
    look: { body: '#2f5f9a', outfit: 'overalls', trim: '#f2b233', hat: 'beanie', hatColor: '#e0702a', build: 1.1, shoe: '#4a2a18' } },
  { id: 'door50', name: 'Дверь 50 · медсестра', role: '$1232/нед — ровно середина: бирюзовая форма', kind: 'person', status: 'draft',
    look: { body: '#2aa198', outfit: 'scrubs', trim: '#1e7a72', hair: 'cap', hairColor: '#2a2420', build: 1.0, shoe: '#f4f1ea' } },
  { id: 'door75', name: 'Дверь 75 · инженер', role: '$1908/нед: рубашка с галстуком, очки, бейдж', kind: 'person', status: 'draft',
    look: { body: '#cfe0f5', outfit: 'vest', trim: '#2f5f9a', glasses: true, hair: 'side', hairColor: '#2a2420', build: 1.0, shoe: '#2a2420' } },
  { id: 'door90', name: 'Дверь 90 · менеджер', role: '$2919/нед: тёмный костюм, красный галстук, седина', kind: 'person', status: 'draft',
    look: { body: '#2c3550', outfit: 'suit', trim: '#c8302c', hair: 'side', hairColor: '#b9b9c2', build: 1.15, shoe: '#1b1b1f' } },
  { id: 'penthouse', name: 'Житель пентхауса', role: 'топ-1%: цилиндр, фрак, монокль, усы', kind: 'person', status: 'draft',
    look: { body: '#1b1b24', outfit: 'suit', trim: '#d9b44a', hat: 'tophat', moustache: 'big', monocle: true, hairColor: '#2a2420', build: 1.25, shoe: '#1b1b1f' } },
  // the elevator story
  { id: 'elevator', name: 'Лифтёр', role: 'ремонтник лифтов $109 910/год: каска, оранжевый комбинезон', kind: 'person', status: 'draft',
    look: { body: '#e0702a', outfit: 'overalls', trim: '#2f5f9a', hat: 'hardhat', moustache: 'thin', hairColor: '#4a2a18', build: 1.15, shoe: '#4a2a18' } },
  { id: 'grad', name: 'Выпускник колледжа', role: 'бакалавр $1602/нед: мантия и шапочка', kind: 'person', status: 'draft',
    look: { body: '#1f2a44', outfit: 'gown', hat: 'gradcap', build: 0.95, shoe: '#1b1b1f' } },
  // the second elevator: wealth by age
  { id: 'young', name: 'Молодой (29 лет)', role: 'до 35: $33 000 капитала, худи', kind: 'person', status: 'draft',
    look: { body: '#8a5ad6', outfit: 'hoodie', trim: '#6a3ab6', hair: 'cap', hairColor: '#2a2420', build: 0.95, shoe: '#f4f1ea' } },
  { id: 'retiree', name: 'Пенсионер', role: '75+: $504 900 капитала, кардиган, седые волосы', kind: 'person', status: 'draft',
    look: { body: '#a8743c', outfit: 'vest', trim: '#3f8f73', glasses: true, hair: 'side', hairColor: '#e6e6ea', moustache: 'thin', build: 1.05, height: 0.97, shoe: '#4a2a18' } },
];
