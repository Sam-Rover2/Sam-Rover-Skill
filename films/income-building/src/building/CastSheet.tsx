/**
 * Stage 1 (characters) for «Здание из 100 работников», in the Ink Diorama Toon style.
 * First the whole cast together, then each character alone (2.5 s), slowly turning 3/4 → front → 3/4.
 */
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { CAST } from '../project';
import { Who, mix } from '../film/kit';
import { FilmCanvas, LIGHT, OfficeCorner, Shot } from '../movie/kit';
import { clamp01, smooth } from '../lib/anim';
import { Toon } from '../lib/Toon';
import { G } from '../lib/geometry';

export const SOLO = 2.5;
export const GROUP = 4;
const people = () => CAST.filter((c) => c.kind === 'person');

const Label: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '7%' }}>
    <div style={{ background: 'rgba(21,18,31,.82)', color: '#fff', borderRadius: 26, padding: '18px 34px', textAlign: 'center', fontFamily: 'Nunito, sans-serif', maxWidth: '86%' }}>
      <div style={{ fontWeight: 900, fontSize: 52 }}>{title}</div>
      <div style={{ fontWeight: 700, fontSize: 30, opacity: 0.85 }}>{sub}</div>
    </div>
  </AbsoluteFill>
);

const Group: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = clamp01(frame / (GROUP * fps));
  const ps = people();
  const n = ps.length;
  const { width, height } = useVideoConfig();
  // vertical: two rows (back row raised on a step); wide: one row
  const rows = width < height ? 2 : 1;
  const perRow = Math.ceil(n / rows);
  const W = (perRow - 1) * 2.1;
  const place = (i: number): [number, number, number] => {
    const r = Math.floor(i / perRow);
    const c = i % perRow;
    const cnt = r === rows - 1 ? n - perRow * (rows - 1) : perRow;
    return [(c - (cnt - 1) / 2) * 2.1, r === 0 && rows > 1 ? 1.2 : 0, rows > 1 ? (r === 0 ? -3 : 0) : -1 + (i % 2) * 0.6];
  };
  return (
    <>
      <FilmCanvas>
        <Shot light={LIGHT.office} k={k} a={{ pos: [0, 4.6, 16], target: [0, 3.0, -1.5], fov: 40, fit: W + 2.6 }} b={{ pos: [0, 4.4, 14.5], target: [0, 3.0, -1.5], fov: 40, fit: W + 2.6 }}>
          <OfficeCorner side={0} flag={false} />
          {rows > 1 && <Toon geometry={G.box} color="#8e5d33" position={[0, 0.6, -3]} scale={[W + 3, 1.2, 2.2]} line={3} />}
          {ps.map((c, i) => (
            <Who key={c.id} id={c.id} pos={place(i)} rotY={0} pose={{ face: 'smile' }} />
          ))}
        </Shot>
      </FilmCanvas>
      <Label title="Здание из 100 работников" sub={`Персонажи · ${n}`} />
    </>
  );
};

const Solo: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = clamp01(frame / (SOLO * fps));
  const c = CAST.find((x) => x.id === id)!;
  const rot = -0.6 + 1.2 * smooth(k);
  const t = frame / fps;
  return (
    <>
      <FilmCanvas>
        <Shot light={LIGHT.office} k={k} a={{ pos: [0, 3.2, 8], target: [0, 2.5, 0], fov: 40, fit: 3.6 }} b={{ pos: [0, 3.2, 7.4], target: [0, 2.5, 0], fov: 40, fit: 3.6 }}>
          <OfficeCorner side={0} flag={false} />
          <Who id={id} pos={[0, 0, 0]} rotY={rot} pose={mix({ hips: [0, Math.sin(t * 2.2) * 0.03, 0] }, { face: k > 0.5 ? 'grin' : 'smile' })} />
        </Shot>
      </FilmCanvas>
      <Label title={c.name} sub={c.role} />
    </>
  );
};

export const castSeconds = () => GROUP + people().length * SOLO;

export const CastSheet: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence durationInFrames={GROUP * fps}>
        <Group />
      </Sequence>
      {people().map((c, i) => (
        <Sequence key={c.id} from={Math.round((GROUP + i * SOLO) * fps)} durationInFrames={Math.round(SOLO * fps)}>
          <Solo id={c.id} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
