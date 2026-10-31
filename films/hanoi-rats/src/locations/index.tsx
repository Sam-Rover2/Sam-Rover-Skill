import { keys } from '../lib/anim';
import { LIGHTS2, Stage, type LightPreset } from '../lib/Stage';
import { StreetSet as HanoiStreet } from './street';
import { SewerSet } from './sewer';
import { OfficeSet } from './office';
import { AlleySet } from './alley';
import { FarmSet } from './farm';
import { P, SIZE } from '../lib/style';
import { Flat } from '../lib/Toon';
import { Building } from '../props/Big';
import { Shadow, StreetLamp, Tree } from '../props/Props';
import { SkyBackdrop } from '../props/Sky';
import { useT } from '../cast';
import { Actor } from '../rig/Actor';
import { CAST } from '../project';

/**
 * Stage 2: locations. Each location is a set WITHOUT the story action, shown with a slow
 * camera orbit so the user can judge the space, scale and detail before animation starts.
 */
export interface Location {
  id: string;
  name: string;
  status: 'draft' | 'approved';
  Set: React.FC; // the static set (reused later by the parts)
  light: LightPreset;
  bg: string;
  /** start camera for review / turntable */
  home: { pos: [number, number, number]; target: [number, number, number] };
  /** where a person stands for scale in the review */
  scalePos?: [number, number, number];
}

const StreetSet: React.FC = () => (
  <>
    <SkyBackdrop colors={['#8fc0ec', '#b5d7f3', '#d8ecfb']} y={40} h={140} />
    <Flat color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} scale={[400, 400, 1]} />
    <Building position={[-16, 0, -6]} w={28} floors={4} color={P.brick} awning={P.teal} litSeed={1} />
    <Building position={[16, 0, -6]} w={28} floors={3} color={P.wallCream} awning={P.red} litSeed={2} />
    <Tree position={[-14, 0, 3]} scale={SIZE.treeScale} />
    <Shadow position={[-14, 0, 3]} r={3} opacity={0.14} />
    <StreetLamp position={[8, 0, 3]} scale={SIZE.lampScale} />
  </>
);

void StreetSet;
void LIGHTS2;

export const LOCATIONS: Location[] = [
  {
    id: 'street',
    name: 'Улица старого Ханоя, 1902 (утро)',
    status: 'approved',
    Set: HanoiStreet,
    light: { ambient: '#fff1dc', ambientI: 1.45, sun: '#ffe0b0', sunI: 2.3, sunPos: [-12, 18, 10], fog: ['#efdcbc', 70, 200] },
    bg: '#cfe3f3',
    home: { pos: [-22, 5.5, 0.5], target: [10, 5.5, 0] },
    scalePos: [-3, 0, -4],
  },
  {
    id: 'sewer',
    name: 'Канализация под Ханоем',
    status: 'draft',
    Set: SewerSet,
    light: { ambient: '#a8c8b0', ambientI: 1.0, sun: '#ffe2a8', sunI: 1.4, sunPos: [18, 30, -6], fog: ['#0b120e', 16, 85] }, // dark haze: the tunnel fades into black
    bg: '#0b120e',
    home: { pos: [-26, 4.2, 4.5], target: [10, 3.6, 0] },
    scalePos: [-6, 0.6, -5.8],
  },
  {
    id: 'office',
    name: 'Пункт выдачи наград (день)',
    status: 'draft',
    Set: OfficeSet,
    light: { ambient: '#fff3e0', ambientI: 1.45, sun: '#ffe6b8', sunI: 2.0, sunPos: [6, 18, 14] },
    bg: '#efe2c0',
    home: { pos: [0, 6.5, 22], target: [0, 4, -8] },
    scalePos: [-2.5, 0, 4],
  },
  {
    id: 'alley',
    name: 'Ночная подворотня с люком',
    status: 'draft',
    Set: AlleySet,
    light: { ambient: '#5a6aa8', ambientI: 1.05, sun: '#a8b8ff', sunI: 1.1, sunPos: [10, 40, 10], fog: ['#141a34', 18, 75] },
    bg: '#141a34',
    home: { pos: [-30, 5, 2], target: [6, 3, 0] },
    scalePos: [-8, 0, 1.5],
  },
  {
    id: 'farm',
    name: 'Крысиная ферма на окраине (закат)',
    status: 'draft',
    Set: FarmSet,
    light: { ambient: '#ffe0c8', ambientI: 1.35, sun: '#ffb070', sunI: 2.3, sunPos: [-30, 14, 20], fog: ['#f3b890', 80, 260] },
    bg: '#f3b890',
    home: { pos: [14, 7, 26], target: [0, 3.5, -4] },
    scalePos: [4, 0, 5],
  },
];

/** Turntable preview of a location: camera slowly circles the set. */
/** Turntable preview. `cam` overrides the camera (used for side / top checks). */
export const LocationPreview: React.FC<{ id: string; cam?: { pos: [number, number, number]; target: [number, number, number]; fov?: number } }> = ({ id, cam }) => {
  const t = useT();
  const loc = LOCATIONS.find((l) => l.id === id)!;
  const k = keys(t, [[0, 0], [8, 1]]);
  const [px, py, pz] = loc.home.pos;
  const [tx, ty, tz] = loc.home.target;
  return (
    <Stage light={loc.light} background={loc.bg} cam={cam ? { ...cam, fov: cam.fov ?? 40, t } : { pos: [px + k * 14, py, pz], target: [tx + k * 14, ty, tz], fov: 40, t }}>
      <loc.Set />
      {loc.scalePos && (
        <group position={loc.scalePos} rotation={[0, 0.6, 0]}>
          <Actor c={CAST[0]} />
        </group>
      )}
    </Stage>
  );
};
