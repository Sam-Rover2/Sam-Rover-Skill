import { Person, Rat, type PersonPose } from './Person';
import type { CastMember } from '../project';

/** Draws any cast member (person or rat). Rats are scaled to real size (~0.5 m). */
export const Actor: React.FC<{ c: CastMember; pose?: PersonPose }> = ({ c, pose }) =>
  c.kind === 'rat' ? <Rat pose={c.rat} scale={1.1} /> : <Person look={c.look!} pose={pose} />;
