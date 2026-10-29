import { P } from './lib/style';
import type { Design, FigPose } from './rig/Figure';

export interface DesignDef {
  id: string;
  name: string;
  desc: string;
  bestFor: string;
  lemo: string;
  d: Design;
  pose?: FigPose;
}

export const DESIGNS: DesignDef[] = [
  {
    id: 'bean',
    name: 'Боб (текущий)',
    desc: 'Наш основной герой: большая круглая голова, тело-пилюля, ручки и ножки-палочки на Безье-риге. Рост ≈ 1.7 м.',
    bestFor: 'Объясняющие ролики, офис, бытовые истории',
    lemo: 'Mid-century Cartoon',
    d: { leg: 1.12, bodyH: 1.26, bodyW: 0.58, bodyD: 0.45, head: [0.78, 0.81, 0.74], skin: P.skinTan, top: P.yellow, hair: 'cap', hairColor: P.hairDark, glasses: true, outfit: 'vneck', eyes: 'dot', hands: 'ball', feet: 'shoe' },
    pose: { handR: [0.85, 3.0, 0.3] },
  },
  {
    id: 'chibi',
    name: 'Чиби',
    desc: 'Огромная голова (половина роста), крошечное тело, большие глаза с бликами. Очень милый и эмоциональный.',
    bestFor: 'Детский контент, стикеры, милые истории',
    lemo: '80s Cel Anime (облегчённо)',
    d: { leg: 0.5, bodyH: 0.8, bodyW: 0.48, head: [1.0, 0.98, 0.92], skin: P.skinLight, top: P.coral, hair: 'bun', hairColor: P.hairAuburn, eyes: 'big', mouth: 'open', hands: 'ball', feet: 'shoe', shoeColor: P.red, limbR: 0.06 },
    pose: { handL: [-0.6, 1.6, 0.4], handR: [0.6, 1.6, 0.4] },
  },
  {
    id: 'adult',
    name: 'Стилизованный взрослый',
    desc: 'Реалистичнее: маленькая голова (≈ 1/6 роста), шея, торс и брюки, руки в рукавах, кисти-«варежки». Рост ≈ 1.85 м.',
    bestFor: 'Серьёзные темы, бизнес, драма',
    lemo: 'Mid-century Cartoon, Swiss Motion',
    d: { leg: 1.95, bodyH: 1.55, bodyW: 0.46, bodyD: 0.3, neck: 0.22, head: [0.42, 0.52, 0.44], body: 'tube', skin: P.skinPeach, top: P.navy, pants: '#3a3f4f', limbColor: P.navy, limbR: 0.1, hair: 'spiky', hairColor: P.hairBrown, outfit: 'tie', outfitColor: P.red, hands: 'mitten', feet: 'shoe', blush: false, eyeGap: 0.15 },
    pose: { handR: [0.6, 3.0, 0.5] },
  },
  {
    id: 'adult-f',
    name: 'Стилизованная взрослая',
    desc: 'Та же «взрослая» пропорция в женском варианте: юбка-трапеция, каре, длинная шея, большие глаза.',
    bestFor: 'Истории с реалистичным кастом, реклама',
    lemo: 'Mid-century Cartoon',
    d: { leg: 1.85, bodyH: 1.45, bodyW: 0.4, bodyD: 0.28, neck: 0.28, head: [0.42, 0.5, 0.42], body: 'tube', skin: P.skinBrown, top: P.teal, pants: P.yellow, outfit: 'skirt', limbColor: P.skinBrown, limbR: 0.085, hair: 'bob', hairColor: P.hairDark, eyes: 'big', hands: 'mitten', feet: 'shoe', shoeColor: P.red, eyeGap: 0.16, prop: 'phone' },
    pose: { handR: [0.45, 3.4, 0.5] },
  },
  {
    id: 'blocky',
    name: 'Кубический',
    desc: 'Голова и тело-кубы, толстые конечности, ботинки-блоки. Игровой «конструкторный» вид.',
    bestFor: 'Игры, техно-темы, детские конструкторы',
    lemo: 'Brick Toy, Low-poly Island',
    d: { leg: 1.0, bodyH: 1.3, bodyW: 0.6, bodyD: 0.38, head: [0.62, 0.6, 0.6], headShape: 'box', body: 'box', skin: '#f4c78f', top: P.green, limbColor: P.green, pants: P.navy, limbR: 0.13, hair: 'none', hat: 'beanie', hatColor: P.red, eyes: 'dot', hands: 'ball', feet: 'boot', shoeColor: '#5a4632', eyeGap: 0.22 },
  },
  {
    id: 'rubberhose',
    name: 'Резиновый шланг (1930-е)',
    desc: 'Глаза-«пирожки», белые перчатки, огромные ботинки, руки-шланги, нос-шарик. Классика ранней анимации.',
    bestFor: 'Ретро, музыка, юмор',
    lemo: '1930s Rubber Hose Cartoon',
    d: { leg: 1.2, bodyH: 1.15, bodyW: 0.55, head: [0.72, 0.68, 0.62], body: 'pear', skin: '#f3e2c8', top: '#2a2a2e', eyes: 'pie', nose: 'ball', noseColor: '#2a2a2e', mouth: 'grin', ears: 'none', hat: 'top', hatColor: '#2a2a2e', hair: 'none', hands: 'glove', feet: 'bigShoe', shoeColor: '#8a4a2a', blush: false, eyeGap: 0.25 },
    pose: { handL: [-1.1, 2.5, 0.2], handR: [1.1, 2.6, 0.2] },
  },
  {
    id: 'bear',
    name: 'Медведь-маскот',
    desc: 'Антропоморфное животное: круглые уши, мордочка, лапы, хвостик, светлый животик, шарф.',
    bestFor: 'Маскоты брендов, детские шоу',
    lemo: 'Crayon Picture Book',
    d: { leg: 0.9, bodyH: 1.4, bodyW: 0.7, head: [0.8, 0.76, 0.72], body: 'pear', skin: '#a0673d', top: '#a0673d', belly: '#f3d3a8', limbColor: '#a0673d', limbR: 0.12, ears: 'bear', nose: 'snout', hands: 'paw', feet: 'paw', tail: 'bear', outfit: 'scarf', outfitColor: P.red, eyes: 'dot' },
    pose: { handR: [0.95, 2.9, 0.3] },
  },
  {
    id: 'cat',
    name: 'Кот',
    desc: 'Треугольные уши, большие глаза, мордочка, длинный хвост на Безье. Гибкий и выразительный.',
    bestFor: 'Комедия, мемы, детские истории',
    lemo: 'Sci-Fi Sitcom Toon (как существо)',
    d: { leg: 0.9, bodyH: 1.1, bodyW: 0.5, head: [0.72, 0.66, 0.66], skin: '#f2a05a', top: '#f2a05a', belly: '#fff3e0', limbColor: '#f2a05a', limbR: 0.09, ears: 'cat', nose: 'snout', eyes: 'big', hands: 'paw', feet: 'paw', tail: 'cat', eyeGap: 0.24 },
  },
  {
    id: 'robot',
    name: 'Робот',
    desc: 'Голова-коробка с экраном вместо лица, антенна, панель на груди, клешни, ботинки-блоки.',
    bestFor: 'Технологии, ИИ, научная фантастика',
    lemo: 'Sci-fi Hologram HUD, Teardown',
    d: { leg: 1.1, bodyH: 1.3, bodyW: 0.62, bodyD: 0.42, head: [0.6, 0.5, 0.5], headShape: 'box', body: 'box', skin: P.steel, top: '#8b95a5', limbColor: '#7d8696', limbR: 0.1, ears: 'antenna', eyes: 'screen', hands: 'claw', feet: 'boot', shoeColor: '#4b5568', outfit: 'panel', hair: 'none', blush: false },
    pose: { handR: [0.95, 2.9, 0.3] },
  },
  {
    id: 'elder',
    name: 'Пожилой',
    desc: 'Сутулость, седые бакенбарды, усы, очки, кардиган на пуговицах, трость. Вариант «Боба» с другими параметрами.',
    bestFor: 'Семейные истории, мудрые наставники',
    lemo: 'Mid-century Cartoon',
    d: { leg: 1.0, bodyH: 1.2, bodyW: 0.6, head: [0.74, 0.76, 0.7], skin: P.skinLight, top: P.lilac, hair: 'tufts', hairColor: P.hairGrey, mustache: true, glasses: true, outfit: 'buttons', eyes: 'sleepy', hands: 'ball', feet: 'shoe', prop: 'cane' },
    pose: { handR: [0.7, 1.4, 0.45], headTilt: 0.08 },
  },
  {
    id: 'kid',
    name: 'Ребёнок',
    desc: 'Маленький рост (≈ 1.2 м), крупная голова, кудряшки, книжка в руках.',
    bestFor: 'Семейные и школьные сюжеты',
    lemo: 'Crayon Picture Book',
    d: { leg: 0.62, bodyH: 0.85, bodyW: 0.45, head: [0.7, 0.72, 0.67], skin: P.skinBrown, top: P.green, hair: 'curly', hairColor: P.hairDark, outfit: 'buttons', eyes: 'dot', mouth: 'grin', hands: 'ball', feet: 'shoe', shoeColor: P.red, prop: 'book', limbR: 0.05 },
    pose: { handL: [-0.25, 1.0, 0.45] },
  },
  {
    id: 'monster',
    name: 'Монстрик',
    desc: 'Один огромный глаз, рожки, клыки, лапы. Страшный и милый одновременно.',
    bestFor: 'Хэллоуин, игры, фэнтези',
    lemo: 'Sci-Fi Sitcom Toon (существа)',
    d: { leg: 0.7, bodyH: 1.5, bodyW: 0.85, head: [0.85, 0.75, 0.75], body: 'pear', skin: '#7bc96f', top: '#7bc96f', belly: '#c9efb5', limbColor: '#7bc96f', limbR: 0.13, eyes: 'cyclops', hat: 'horns', hatColor: '#f3e2c8', mouth: 'fangs', ears: 'none', hands: 'paw', feet: 'paw', blush: false },
    pose: { handL: [-1.2, 2.6, 0.3], handR: [1.2, 2.6, 0.3] },
  },
  {
    id: 'hero',
    name: 'Супергерой',
    desc: 'Широкие плечи, плащ, ботинки, «героическая» поза кулаком вверх. Пропорции крупнее обычных.',
    bestFor: 'Пародии, мотивационные ролики, экшен',
    lemo: '60s Spy Title Sequence, Art Deco',
    d: { leg: 1.45, bodyH: 1.6, bodyW: 0.82, bodyD: 0.48, head: [0.6, 0.66, 0.58], skin: P.skinPeach, top: '#3f6fd8', limbColor: '#3f6fd8', limbR: 0.12, hair: 'mohawk', hairColor: P.hairDark, outfit: 'cape', outfitColor: P.red, hands: 'mitten', feet: 'boot', shoeColor: P.red, mouth: 'grin', eyeGap: 0.2 },
    pose: { handR: [0.75, 4.4, 0.25] },
  },
];
