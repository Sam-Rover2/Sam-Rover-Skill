import type { HumanSpec } from './Human';

const SK = { light: '#f1d3b0', fair: '#e9c3a0', tan: '#c99068', brown: '#9a6240', dark: '#6b4430' };

export const PEOPLE: { id: string; name: string; spec: HumanSpec }[] = [
  { id: 'm-blue', name: 'Андрей', spec: { sex: 'm', skin: SK.light, hair: { style: 'short', color: '#5a3d28' }, top: { type: 'tshirt', color: '#2f5f9e' }, bottom: { type: 'shorts', color: '#2e2e33' }, shoes: { type: 'sneaker', color: '#4a4a50' } } },
  { id: 'm-green', name: 'Олег', spec: { sex: 'm', height: 1.82, skin: SK.fair, hair: { style: 'short', color: '#6b4a2e' }, top: { type: 'tshirt', color: '#5a9a52' }, bottom: { type: 'cargo', color: '#9c8466' }, shoes: { type: 'boot', color: '#8a5a2a' } } },
  { id: 'f-teal', name: 'Марина', spec: { sex: 'f', skin: SK.tan, hair: { style: 'long', color: '#2a1d16' }, top: { type: 'tank', color: '#e7a33a' }, bottom: { type: 'pants', color: '#1f6f86' }, shoes: { type: 'sneaker', color: '#f4f4f4' }, watch: '#e0573f' } },
  { id: 'm-red', name: 'Дима', spec: { sex: 'm', height: 1.72, build: 1.15, skin: SK.brown, hair: { style: 'buzz', color: '#1d1714' }, top: { type: 'tshirt', color: '#b8473a' }, bottom: { type: 'shorts', color: '#5b6a33' }, shoes: { type: 'sneaker', color: '#6b5444' } } },
  { id: 'f-skirt', name: 'Аня', spec: { sex: 'f', height: 1.62, skin: SK.light, hair: { style: 'ponytail', color: '#a5642c' }, top: { type: 'longsleeve', color: '#9b87d6' }, bottom: { type: 'skirt', color: '#34405e' }, shoes: { type: 'boot', color: '#2b2622' } } },
  { id: 'm-grey', name: 'Игорь', spec: { sex: 'm', height: 1.85, build: 0.92, skin: SK.fair, hair: { style: 'short', color: '#2a2420' }, top: { type: 'tshirt', color: '#8d8d92' }, bottom: { type: 'pants', color: '#1e6a7a' }, shoes: { type: 'sneaker', color: '#f4f4f4' } } },
];
