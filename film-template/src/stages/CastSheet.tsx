import { AbsoluteFill } from 'remotion';
import { LIGHTS2, Stage } from '../lib/Stage';
import { Flat } from '../lib/Toon';
import { Character } from '../rig/Character';
import { breathe } from '../rig/motion';
import { Shadow } from '../props/Props';
import { CAST } from '../project';
import { useT } from '../cast';

/** Stage 1 review: every character side by side, slowly turning, with name and status. */
export const CastSheet: React.FC = () => {
  const t = useT();
  const n = CAST.length;
  const gap = 3.2;
  return (
    <AbsoluteFill>
      <Stage light={LIGHTS2.morning} background="#efe9df" cam={{ pos: [0, 2.6, 6 + n * 2.6], target: [0, 2.2, 0], fov: 30, t }}>
        <Flat color="#d8cfbf" rotation={[-Math.PI / 2, 0, 0]} scale={[200, 200, 1]} />
        {CAST.map((c, i) => (
          <group key={c.id} position={[(i - (n - 1) / 2) * gap, 0, 0]} rotation={[0, Math.sin(t * 0.6 + i) * 0.6, 0]}>
            <Shadow r={0.9} />
            <Character look={c.look} pose={{ squash: breathe(t, i), expr: 'smile' }} />
          </group>
        ))}
      </Stage>
      <AbsoluteFill style={{ justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end', padding: 40 }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', fontFamily: 'system-ui', fontSize: 44 }}>
          {CAST.map((c) => (
            <div key={c.id} style={{ textAlign: 'center', background: 'rgba(255,255,255,.85)', borderRadius: 16, padding: '8px 18px' }}>
              <b>{c.name}</b>
              <div style={{ fontSize: 28, color: '#555' }}>
                {c.role} · {c.status === 'approved' ? '✅ согласован' : '📝 черновик'}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
