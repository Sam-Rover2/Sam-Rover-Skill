import { keys } from '../lib/anim';
import { LIGHTS2, Stage, type LightPreset } from '../lib/Stage';
import { StreetSet as HanoiStreet } from './street';
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
    status: 'draft',
    Set: HanoiStreet,
    light: { ambient: '#fff1dc', ambientI: 1.45, sun: '#ffe0b0', sunI: 2.3, sunPos: [-12, 18, 10], fog: ['#efdcbc', 70, 200] },
    bg: '#cfe3f3',
    home: { pos: [-22, 5.5, 0.5], target: [10, 5.5, 0] },
    scalePos: [-3, 0, -4],
  },
];

/** Turntable preview of a location: camera slowly circles the set. */
export const LocationPreview: React.FC<{ id: string }> = ({ id }) => {
  const t = useT();
  const loc = LOCATIONS.find((l) => l.id === id)!;
  const k = keys(t, [[0, 0], [8, 1]]);
  const [px, py, pz] = loc.home.pos;
  const [tx, ty, tz] = loc.home.target;
  return (
    <Stage light={loc.light} background={loc.bg} cam={{ pos: [px + k * 14, py, pz], target: [tx + k * 14, ty, tz], fov: 40, t }}>
      <loc.Set />
      {loc.scalePos && (
        <group position={loc.scalePos} rotation={[0, 0.6, 0]}>
          <Actor c={CAST[0]} />
        </group>
      )}
    </Stage>
  );
};
