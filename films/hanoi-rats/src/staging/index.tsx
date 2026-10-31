import { G } from '../lib/geometry';
import { BODY } from '../lib/style';
import { Toon } from '../lib/Toon';
import { Limb } from '../rig/Limb';
import type { PersonPose } from '../rig/Person';
import { OBJECTS } from '../objects';

type V3 = [number, number, number];

/**
 * Stage 4: STAGING (blocking) WITHOUT animation, one entry per SCENE (one location each).
 * Times come from public/audio/voice.srt. Shots are the planned 9:16 cameras.
 */
export interface Shot {
  name: string;
  pos: V3;
  target: V3;
  fov?: number;
  note?: string;
}
export interface Staging {
  id: string;
  name: string;
  status: 'draft' | 'approved';
  location: string; // LOCATIONS id
  actors: { cast: string; pos: V3; rotY?: number; pose?: PersonPose; note?: string }[];
  objects: { obj: string; pos: V3; rotY?: number }[];
  shots: Shot[];
}

/* ---------- small hand props ---------- */
const O = (id: string) => OBJECTS.find((o) => o.id === id)!.C;
const Notebook = O('notebook');
const Magnifier = O('magnifier');
const Scissors = O('scissors');
const HeldNotebook = () => (
  <group scale={0.8} rotation={[0.2, 0, 0]}>
    <Notebook />
  </group>
);
const HeldMagnifier = () => (
  <group scale={0.55} rotation={[0.6, 0, 0]}>
    <Magnifier />
  </group>
);
const HeldScissors = () => (
  <group scale={0.55} rotation={[0.4, 0, -0.6]}>
    <Scissors />
  </group>
);
/** a cut tail dangling from the fingers */
const HeldTail = () => <Limb root={[0, 0, 0.05]} tip={[0.12, -0.75, 0.12]} length={0.85} bendDir={[1, 0, 0]} radius={0.03} color="#e99aa6" />;
/** a coin between the fingers */
const HeldCoin = () => <Toon geometry={G.cyl} color="#e0b84a" position={[0, 0.12, 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[0.12, 0.03, 0.12]} line={2} />;

/* ---------- poses ---------- */
const holdNotebook: PersonPose = { handL: [-0.25, 2.55, 0.6], handR: [0.2, 2.65, 0.65], holdL: <HeldNotebook /> };
const crouch = (lean = 0.45): PersonPose => ({ hips: [0, -0.75, -0.2], lean, footL: [-0.35, 0.08, 0.55], footR: [0.35, 0.08, 0.35] });

/** A street full of rats: deterministic scatter on the road. */
const ratsOnRoad = (n: number, x0: number, x1: number, zr: number, cut = 0.5) =>
  Array.from({ length: n }, (_, i) => {
    const h = (k: number) => {
      const v = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    return { cast: h(1) < cut ? 'rat-cut' : 'rat', pos: [x0 + h(2) * (x1 - x0), 0, (h(3) - 0.5) * 2 * zr] as V3, rotY: -Math.PI / 2 + (h(4) - 0.5) * 1.2 };
  });

export const STAGINGS: Staging[] = [
  {
    id: 'p1a',
    name: 'Часть 1 · A · Улица — инспекторы замечают крыс без хвостов (0:00–0:10)',
    status: 'draft',
    location: 'street',
    objects: [],
    actors: [
      { cast: 'inspector', pos: [-6, 0.3, -9.4], rotY: 0.55, pose: { ...holdNotebook, face: 'o', look: [0.6, -0.4] }, note: 'на тротуаре, записывает в блокнот' },
      { cast: 'inspector2', pos: [-3.6, 0, -6.6], rotY: 0.9, pose: { ...crouch(0.5), handR: [0.25, 1.4, 1.15], holdR: <HeldMagnifier />, face: 'o', look: [0, -1] }, note: 'присел, рассматривает крысу в лупу' },
      { cast: 'rat-cut', pos: [-2.6, 0, -4.8], rotY: 0.5, note: 'бесхвостая крыса под лупой' },
      ...ratsOnRoad(5, 1, 14, 5, 1),
      { cast: 'citizen2', pos: [8, 0.3, 10.5], rotY: -2.6, pose: { face: 'o', handL: [-0.4, 3.4, 0.6] }, note: 'прохожая удивлена' },
    ],
    shots: [
      { name: 'Общий план улицы', pos: [-22, 5.5, 0.5], target: [10, 5, 0], fov: 52, note: '0:00–0:03 «In 1902… in Hanoi»' },
      { name: 'Инспекторы', pos: [-1.2, 3.6, 3.5], target: [-4.8, 2.4, -7.6], fov: 48, note: '0:03–0:05 «noticed something bizarre»' },
      { name: 'Крыса под лупой', pos: [-1.4, 1.9, -1.4], target: [-2.6, 0.5, -4.8], fov: 42, note: '0:05–0:08 «healthy rats…»' },
      { name: 'Низко: бегут бесхвостые', pos: [-6, 0.7, 0], target: [8, 0.5, 0], fov: 55, note: '0:08–0:10 «…tails neatly cut off»' },
    ],
  },
  {
    id: 'p1b',
    name: 'Часть 1 · B · Канализация — гордость чиновника и рай для крыс (0:10–0:20.5)',
    status: 'draft',
    location: 'sewer',
    objects: [],
    actors: [
      { cast: 'official', pos: [12, 0.6, -6], rotY: -0.6, pose: { handR: [1.3, 3.6, 0.5], handL: [-0.4, 2.3, 0.5], face: 'grin', look: [0.5, 0.2] }, note: 'с гордостью показывает канализацию' },
      ...[
        [16, -5.5, 2.2], [20, -6.2, 1.6], [24, 5, -1.4], [28, -5, 1.8], [33, 5.8, -1.6], [38, -6, 1.5], [43, 5.4, -1.2], [50, -5.6, 2], [56, 6, -1.5],
      ].map(([x, z, r]) => ({ cast: 'rat', pos: [x, 0.6, z] as V3, rotY: r })),
    ],
    shots: [
      { name: 'Спуск через люк', pos: [18.3, 14, -6.4], target: [18.8, 0.6, -5.4], fov: 60, note: '0:10–0:11.5 «Months earlier»' },
      { name: 'Чиновник гордится', pos: [5.5, 3.8, -1], target: [12, 3.1, -6], fov: 46, note: '0:11.5–0:15.8 «French colonial officials… sewer system»' },
      { name: 'Тоннель, полный крыс', pos: [2, 2.6, 3.5], target: [40, 0.8, 0], fov: 50, note: '0:15.8–0:20.5 «…paradise for plague-carrying rats»' },
    ],
  },
  {
    id: 'p2a',
    name: 'Часть 2 · A · Пункт наград — награда за хвост, очередь, 20 000 в день (0:20.5–0:43.3)',
    status: 'draft',
    location: 'office',
    actors: [
      { cast: 'official', pos: [0, 0, -9.4], rotY: 0, pose: { handR: [0.45, BODY.waist + 0.45, 1.15], holdR: <HeldCoin />, handL: [-0.6, BODY.waist + 0.2, 1.0], face: 'smug' }, note: 'за столом, протягивает монету' },
      { cast: 'citizen1', pos: [1.1, 0, -4.4], rotY: Math.PI + 0.35, pose: { handR: [0.3, 2.7, 0.95], holdR: <HeldTail />, face: 'grin' }, note: 'сдаёт хвост, получает монету' },
      { cast: 'catcher', pos: [-3.8, 0, -0.2], rotY: Math.PI - 0.55, pose: { handR: [0.55, 1.3, 0.35], face: 'smug' }, note: 'в очереди с ведром хвостов' },
      { cast: 'citizen2', pos: [-7, 0, 2.2], rotY: Math.PI - 0.7, pose: { handL: [-0.5, 1.5, 0.3], face: 'smile' }, note: 'в очереди с мешком хвостов' },
    ],
    objects: [
      { obj: 'bucket', pos: [-3.1, 0, 0.4] },
      { obj: 'sack', pos: [-8.2, 0, 2.7] },
    ],
    shots: [
      { name: 'Плакат и чиновник', pos: [-4.2, 3.4, -4.5], target: [-6.5, 2.6, -11], fov: 48, note: '0:20.5–0:26.9 «turned to the free market… bounty»' },
      { name: 'Правило: хвост → монета', pos: [4.5, 3.8, -2.5], target: [0.2, 3.0, -8.2], fov: 46, note: '0:26.9–0:37 «bring in the severed tail… collect your coin»' },
      { name: 'Очередь', pos: [7, 4.2, 8.5], target: [-3, 2.4, -2.5], fov: 50, note: '0:37–0:39.6 «At first it looked like a triumph»' },
      { name: 'Журнал «20 000» и хвосты', pos: [-0.6, 4.4, -4.4], target: [-0.8, 2.3, -6.85], fov: 34, note: '0:39.6–0:43.3 «up to 20,000 tails a day»' },
    ],
  },
  {
    id: 'p3a',
    name: 'Часть 3 · A · Подворотня — ловцы отпускают крыс (0:43.3–0:56.7)',
    status: 'draft',
    location: 'alley',
    objects: [],
    actors: [
      { cast: 'catcher', pos: [4.2, 0, 1.6], rotY: 2.6, pose: { ...crouch(0.4), handR: [0.3, 1.25, 1.0], holdR: <HeldScissors />, handL: [-0.35, 1.1, 1.0], face: 'smug' }, note: 'присел у ловушки, ножницы в руке' },
      { cast: 'rat-cut', pos: [2.8, 0, 0.9], rotY: -2.0, note: 'бесхвостая крыса бежит к люку' },
      { cast: 'inspector', pos: [-10, 0, -4.6], rotY: 0.9, pose: { face: 'panic', lean: 0.15, handL: [-0.45, 3.2, 0.6] }, note: 'выглядывает из двери' },
      { cast: 'inspector2', pos: [-11.3, 0, -5.0], rotY: 0.9, pose: { face: 'panic' } },
    ],
    shots: [
      { name: 'Инспекторы подглядывают', pos: [-4.2, 3.2, 2.4], target: [-10.6, 3.0, -4.7], fov: 44, note: '0:43.3–0:47 «Until inspectors realized…»' },
      { name: 'Ловец с ножницами', pos: [7.8, 3.6, -4.2], target: [3.6, 1.6, 1.6], fov: 55, note: '0:47–0:52.6 «Why kill the source… snipping off their tails»' },
      { name: 'Крыса уходит в люк', pos: [0.2, 1.2, 2.8], target: [2.2, 0.2, 0.2], fov: 50, note: '0:52.6–0:56.7 «releasing them back into the sewers…»' },
    ],
  },
  {
    id: 'p3b',
    name: 'Часть 3 · B · Ферма — крысиные фермы на окраине (0:56.7–1:01.5)',
    status: 'draft',
    location: 'farm',
    objects: [],
    actors: [
      { cast: 'farmer', pos: [0, 0, -4.6], rotY: 0.15, pose: { handL: [-0.1, 2.6, 0.6], handR: [0.1, 2.55, 0.62], face: 'smug' }, note: 'довольный, руки скрещены' },
      { cast: 'inspector', pos: [8.6, 0, 4.4], rotY: -2.35, pose: { face: 'panic', handL: [-0.3, 3.6, 0.5] }, note: 'в шоке' },
      { cast: 'inspector2', pos: [10.1, 0, 5.4], rotY: -2.35, pose: { face: 'o', ...holdNotebook } },
    ],
    shots: [
      { name: 'Ферма — общий', pos: [14, 7, 26], target: [0, 3.5, -4], fov: 50, note: '0:56.7–0:59 «Soon, inspectors even discovered…»' },
      { name: 'Довольный фермер', pos: [1.6, 3.6, 2.4], target: [0, 3.4, -4.6], fov: 40, note: '0:59–1:00.4 «sprawling rat farms»' },
      { name: 'Шок инспекторов', pos: [3.5, 3.6, 1.5], target: [9.2, 3.2, 4.8], fov: 44, note: '1:00.4–1:01.5 «on the edge of town»' },
    ],
  },
  {
    id: 'p3c',
    name: 'Часть 3 · C · Пункт наград — награду отменяют в панике (1:01.5–1:06.4)',
    status: 'draft',
    location: 'office',
    objects: [],
    actors: [
      { cast: 'official', pos: [-5.2, 0, -9.6], rotY: 0.25, pose: { handL: [-0.7, 3.7, 0.75], handR: [0.7, 3.7, 0.75], face: 'panic', lean: -0.1 }, note: 'срывает плакат' },
    ],
    shots: [
      { name: 'Чиновник срывает плакат', pos: [-2.2, 3.8, -3.2], target: [-5.6, 3.4, -10.4], fov: 45, note: '1:01.5–1:04 «The government scrapped the bounty in panic»' },
      { name: 'Паника крупно', pos: [-4.4, 4.0, -4.4], target: [-5.2, 3.9, -9.6], fov: 40, note: '1:04–1:06.4 «leaving Hanoi with more rats than ever»' },
    ],
  },
  {
    id: 'p3d',
    name: 'Часть 3 · D · Улица — город полон крыс, мораль (1:06.4–1:14.6)',
    status: 'draft',
    location: 'street',
    objects: [],
    actors: [
      ...ratsOnRoad(22, -14, 26, 6.5, 0.4),
      { cast: 'inspector', pos: [-6, 0.3, -10.2], rotY: 0.5, pose: { face: 'neutral', look: [0.6, -0.5] }, note: 'устало смотрят на крыс' },
      { cast: 'inspector2', pos: [-4.3, 0.3, -10.8], rotY: 0.3, pose: { face: 'neutral', ...holdNotebook } },
    ],
    shots: [
      { name: 'Низко: крысы повсюду', pos: [-12, 1.0, 0.5], target: [10, 0.6, 0], fov: 55, note: '1:06.4–1:09 «They forgot the iron law of incentives»' },
      { name: 'Инспекторы', pos: [-1.5, 3.6, -3], target: [-5, 3, -10.4], fov: 44, note: '1:09–1:11.9 «People never optimize for the goal you want»' },
      { name: 'Финал: кран вверх', pos: [-30, 24, 0.5], target: [10, 0, 0], fov: 55, note: '1:11.9–1:14.6 «They optimize for the metric you pay for»' },
    ],
  },
];
