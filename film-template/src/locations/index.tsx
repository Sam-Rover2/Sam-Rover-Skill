import { keys } from '../lib/anim';
import { LIGHTS2, Stage } from '../lib/Stage';
import { P, SIZE } from '../lib/style';
import { Flat } from '../lib/Toon';
import { Building } from '../props/Big';
import { Shadow, StreetLamp, Tree } from '../props/Props';
import { SkyBackdrop } from '../props/Sky';
import { useT } from '../cast';

/**
 * Stage 2: locations. Each location is a set WITHOUT the story action, shown with a slow
 * camera orbit so the user can judge the space, scale and detail before animation starts.
 */
export interface Location {
  id: string;
  name: string;
  status: 'draft' | 'approved';
  Set: React.FC; // the static set (reused later by the parts)
  light: (typeof LIGHTS2)[keyof typeof LIGHTS2];
  bg: string;
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

export const LOCATIONS: Location[] = [{ id: 'street', name: 'Улица (пример)', status: 'draft', Set: StreetSet, light: LIGHTS2.morning, bg: P.skyDay[0] }];

/** Turntable preview of a location: camera slowly circles the set. */
export const LocationPreview: React.FC<{ id: string }> = ({ id }) => {
  const t = useT();
  const loc = LOCATIONS.find((l) => l.id === id)!;
  const a = keys(t, [[0, -0.5], [8, 0.5]]);
  return (
    <Stage light={loc.light} background={loc.bg} cam={{ pos: [Math.sin(a) * 30, 7, Math.cos(a) * 30], target: [0, 5, 0], fov: 36, t }}>
      <loc.Set />
    </Stage>
  );
};
