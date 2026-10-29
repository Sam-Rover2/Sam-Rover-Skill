import { LINE } from './lib/style';
import type { RenderStyle } from './lib/materials';

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (v: number[]) => '#' + v.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
const mixWhite = (k: number) => (c: string) => toHex(hex(c).map((x) => x + (255 - x) * k));
const nearest = (inks: string[]) => (c: string) => {
  const v = hex(c);
  let best = inks[0];
  let d = 1e9;
  for (const i of inks) {
    const w = hex(i);
    const dd = (v[0] - w[0]) ** 2 + (v[1] - w[1]) ** 2 + (v[2] - w[2]) ** 2;
    if (dd < d) [d, best] = [dd, i];
  }
  return best;
};

const PAPER = 'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27300%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%273%27/><feColorMatrix values=%270 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.3 0 0 0 0.18 0%27/></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/></svg>")';
const HALFTONE = 'radial-gradient(circle, rgba(0,0,0,0.16) 1.2px, transparent 1.6px) 0 0 / 7px 7px';
const GRID = 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px) 0 0 / 40px 40px, linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px) 0 0 / 40px 40px';
const SCAN = 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 4px)';

export interface StyleDef {
  r: RenderStyle;
  name: string;
  nameEn: string;
  desc: string;
  bestFor: string;
  lemo: string; // closest Lemo-Opuscar library styles
  cost: string; // render cost / notes
  lowPoly?: boolean;
  pixel?: number; // render at 1/pixel resolution, upscale with hard pixels
  bg: string;
  light: { ambient: string; ai: number; sun: string; si: number };
  filter?: string; // CSS filter on the whole frame
  overlay?: string; // CSS background on top
  overlayBlend?: string;
  sky?: [string, string];
  ground?: string;
}

export const STYLES: StyleDef[] = [
  {
    r: { id: 'toon', fill: 'toon3', ink: LINE.color, line: 1 },
    name: 'Мультяшный 3D с контуром',
    nameEn: 'Toon Outline (текущий)',
    desc: 'Наш основной стиль из «Кофе для Макса» и «Красного шарика». Толстый контур постоянной толщины, мягкая 3-тоновая заливка, яркая палитра.',
    bestFor: 'Объясняющие ролики, истории, YouTube-скетчи',
    lemo: 'Sci-Fi Sitcom Toon, Mid-century Cartoon',
    cost: 'Быстрый рендер',
    bg: '#d8ecfb',
    light: { ambient: '#ffffff', ai: 1.6, sun: '#fff6e8', si: 2.1 },
  },
  {
    r: { id: 'cel2', fill: 'cel2', ink: LINE.color, line: 1.3 },
    name: 'Аниме-цел (2 тона)',
    nameEn: 'Cel Shading',
    desc: 'Жёсткая граница света и тени, без полутонов, контур толще. Выглядит как рисованная анимация 80–90-х.',
    bestFor: 'Динамичные сцены, экшен, музыкальные клипы',
    lemo: '80s Cel Anime, Game Show Flat',
    cost: 'Быстрый рендер',
    bg: '#cfe3f7',
    light: { ambient: '#ffffff', ai: 1.4, sun: '#ffffff', si: 2.6 },
    filter: 'saturate(1.25) contrast(1.05)',
  },
  {
    r: { id: 'clay', fill: 'clay', ink: '#3a2a22', line: 0 },
    name: 'Пластилин',
    nameEn: 'Claymation',
    desc: 'Матовые «лепные» поверхности без контура, мягкий тёплый свет. Как кукольная stop-motion анимация.',
    bestFor: 'Уютные детские истории, реклама еды и игрушек',
    lemo: 'нет прямого аналога (ближе Crayon Picture Book по настроению)',
    cost: 'Средний: реалистичный свет',
    bg: '#efe3cf',
    light: { ambient: '#ffe9d2', ai: 0.9, sun: '#fff1dc', si: 2.6 },
    filter: 'saturate(0.9)',
    overlay: PAPER,
    overlayBlend: 'multiply',
  },
  {
    r: { id: 'vinyl', fill: 'vinyl', ink: '#20202a', line: 0.35 },
    name: 'Глянцевая игрушка',
    nameEn: 'Vinyl Toy',
    desc: 'Блестящий пластик с бликами, тонкая линия. Персонажи как коллекционные виниловые фигурки.',
    bestFor: 'Промо продукта, маскоты брендов, превью',
    lemo: 'Glass Product, Brick Toy',
    cost: 'Средний',
    bg: '#e9eef7',
    light: { ambient: '#ffffff', ai: 1.0, sun: '#ffffff', si: 3.0 },
  },
  {
    r: { id: 'lowpoly', fill: 'lowpoly', ink: '#2a2a2a', line: 0 },
    name: 'Низкополигональный',
    nameEn: 'Low-poly',
    desc: 'Грани видны, плоская заливка каждой грани. Геометрический «игровой» вид без контура.',
    bestFor: 'Инфографика, игровые трейлеры, абстрактные истории',
    lemo: 'Low-poly Island',
    cost: 'Самый быстрый',
    lowPoly: true,
    bg: '#cfe6f2',
    light: { ambient: '#ffffff', ai: 1.0, sun: '#fff1dc', si: 2.4 },
  },
  {
    r: { id: 'lineart', fill: 'white', ink: '#1b1b1f', line: 1.1 },
    name: 'Чернильный лайн-арт',
    nameEn: 'Ink Line Art',
    desc: 'Только линия на белом, как раскраска или скетч в блокноте. Цвет можно «добавлять» по ходу ролика.',
    bestFor: 'Объяснения на «доске», обучение, минимализм',
    lemo: 'One-line Drawing, Whiteboard Explainer',
    cost: 'Быстрый рендер',
    bg: '#fbf8f0',
    light: { ambient: '#ffffff', ai: 2, sun: '#ffffff', si: 0 },
    overlay: PAPER,
    overlayBlend: 'multiply',
    sky: ['#fbf8f0', '#fbf8f0'],
    ground: '#fbf8f0',
  },
  {
    r: { id: 'sketch', fill: 'toon3', ink: '#3a2f2a', line: 0.8, boil: 2.2, color: mixWhite(0.35) },
    name: 'Карандашный скетч',
    nameEn: 'Pencil Sketch',
    desc: 'Дрожащая «живая» линия (в анимации она «кипит»), пастельные цвета, бумажная текстура.',
    bestFor: 'Лирические истории, воспоминания, дневниковый формат',
    lemo: 'Urban Sketch · Pen & Wash, Crayon Picture Book',
    cost: 'Быстрый рендер',
    bg: '#f3ecdf',
    light: { ambient: '#ffffff', ai: 1.7, sun: '#ffffff', si: 1.6 },
    overlay: PAPER,
    overlayBlend: 'multiply',
  },
  {
    r: { id: 'watercolor', fill: 'basic', ink: '#6b4a3a', line: 0.5, boil: 1.2, color: mixWhite(0.45) },
    name: 'Акварель',
    nameEn: 'Watercolor',
    desc: 'Светлые размытые заливки без объёма, тонкая коричневая линия, зерно бумаги.',
    bestFor: 'Сказки, мягкие эмоциональные ролики',
    lemo: 'Watercolor Brush, Chinese Ink Wash',
    cost: 'Быстрый рендер',
    bg: '#f6efe2',
    light: { ambient: '#ffffff', ai: 1, sun: '#ffffff', si: 0 },
    filter: 'blur(0.6px) saturate(0.95)',
    overlay: PAPER,
    overlayBlend: 'multiply',
  },
  {
    r: { id: 'riso', fill: 'cel2', ink: '#1d3c78', line: 0.9, color: nearest(['#ff5aa5', '#2f7dd1', '#ffd21f', '#f4ecdc', '#46b07e']) },
    name: 'Ризограф',
    nameEn: 'Risograph Print',
    desc: 'Всего 4–5 «красок», точечный растр, как печать на ризографе. Цвета заменяются на ближайшую краску.',
    bestFor: 'Постеры, музыка, инди-эстетика',
    lemo: 'Risograph Print, Halftone Dossier, Silkscreen Poster',
    cost: 'Быстрый рендер',
    bg: '#f4ecdc',
    light: { ambient: '#ffffff', ai: 1.5, sun: '#ffffff', si: 2.0 },
    overlay: HALFTONE,
    overlayBlend: 'multiply',
  },
  {
    r: { id: 'blueprint', fill: 'basic', ink: '#e9f2ff', line: 0.6, color: () => '#1f4f93' },
    name: 'Чертёж',
    nameEn: 'Blueprint',
    desc: 'Белые линии на синем с сеткой, как инженерный чертёж. Объёма нет, только силуэты.',
    bestFor: 'Технологии, «как это устроено», стартапы',
    lemo: 'Blueprint, Engineering Briefing Board',
    cost: 'Быстрый рендер',
    bg: '#1f4f93',
    light: { ambient: '#ffffff', ai: 1, sun: '#ffffff', si: 0 },
    overlay: GRID,
    sky: ['#1f4f93', '#1f4f93'],
    ground: '#1f4f93',
  },
  {
    r: { id: 'neon', fill: 'basic', ink: '#3ef0ff', line: 0.7, color: () => '#0d1226' },
    name: 'Неон',
    nameEn: 'Neon Hologram',
    desc: 'Тёмные силуэты со светящимся контуром и свечением. Кибер-ночь.',
    bestFor: 'Технологии, игры, ночные сцены, интро',
    lemo: 'Sci-fi Hologram HUD, Dark Tech Keynote',
    cost: 'Быстрый рендер',
    bg: '#070a18',
    light: { ambient: '#ffffff', ai: 1, sun: '#ffffff', si: 0 },
    filter: 'drop-shadow(0 0 6px #3ef0ff) drop-shadow(0 0 14px #ff3ef5)',
    sky: ['#070a18', '#141a3a'],
    ground: '#0a0e20',
  },
  {
    r: { id: 'pixel', fill: 'cel2', ink: '#1b1b1f', line: 0.6 },
    name: 'Пиксель-арт',
    nameEn: 'Pixel Art 3D',
    desc: '3D-сцена в низком разрешении с жёсткими пикселями, как ретро-игра (HD-2D).',
    bestFor: 'Игровая тематика, ностальгия, мемы',
    lemo: '16-bit Pixel RPG, HD-2D, Microgame Frenzy',
    cost: 'Самый быстрый',
    pixel: 6,
    bg: '#9cc9ef',
    light: { ambient: '#ffffff', ai: 1.5, sun: '#ffffff', si: 2.2 },
    filter: 'saturate(1.2)',
  },
  {
    r: { id: 'noir', fill: 'night', ink: '#000000', line: 1.2 },
    name: 'Нуар / немое кино',
    nameEn: 'Noir',
    desc: 'Чёрно-белый, высокий контраст, глубокие тени, зерно плёнки и виньетка.',
    bestFor: 'Детективы, драма, флешбэки, пародии на старое кино',
    lemo: 'Silent Film, 1920s Newsreel',
    cost: 'Быстрый рендер',
    bg: '#cfcfcf',
    light: { ambient: '#ffffff', ai: 0.7, sun: '#ffffff', si: 3.2 },
    filter: 'grayscale(1) contrast(1.35) brightness(1.02)',
    overlay: `${PAPER}, radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)`,
    overlayBlend: 'multiply',
  },
];
