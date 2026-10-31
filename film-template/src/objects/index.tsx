import { SIZE, P } from '../lib/style';
import { Bench, Car, Plant, StreetLamp, Table, Chair } from '../props/Props';
import { Model } from '../assets/Model';

/**
 * Stage 2: OBJECTS (props, vehicles, furniture, weapons…). Either built in code or an imported
 * model (GLB in public/models/). Each is reviewed alone in review.html before it goes into scenes.
 * `height` = real height in units (1 m = 2.2) — used to check scale next to a character.
 */
export interface Obj {
  id: string;
  name: string;
  status: 'draft' | 'approved';
  source: 'code' | 'model';
  C: React.FC;
}

export const OBJECTS: Obj[] = [
  { id: 'bench', name: 'Скамейка', status: 'draft', source: 'code', C: () => <Bench /> },
  { id: 'car', name: 'Машина', status: 'draft', source: 'code', C: () => <Car color={P.teal} scale={SIZE.carScale} /> },
  { id: 'lamp', name: 'Фонарь', status: 'draft', source: 'code', C: () => <StreetLamp scale={SIZE.lampScale} /> },
  { id: 'cafe-set', name: 'Столик со стулом', status: 'draft', source: 'code', C: () => (
    <group>
      <Table round w={1.6} />
      <Chair position={[-1.2, 0, 0]} rotation={[0, 1.4, 0]} />
    </group>
  ) },
  { id: 'plant', name: 'Растение', status: 'draft', source: 'code', C: () => <Plant big /> },
  // Imported model example (put the file into public/models/ and uncomment):
  // { id: 'boat', name: 'Лодка (модель)', status: 'draft', source: 'model', C: () => <Model file="models/boat.glb" height={4.4} restyle="toon" /> },
];
export { Model };
