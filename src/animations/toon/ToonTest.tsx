import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions, type Word } from './Captions';
import { CameraRig } from './CameraRig';
import { Character } from './Character';
import { Office } from './Office';
import { onTwos, PALETTE } from './style';

const WORDS: Word[] = [
  { text: 'Then', start: 0.25, end: 0.75 },
  { text: 'we', start: 0.75, end: 1.05 },
  { text: 'got', start: 1.05, end: 1.35 },
  { text: 'to', start: 1.35, end: 1.6 },
  { text: 'the', start: 1.6, end: 1.85 },
  { text: 'office', start: 1.85, end: 3.7 },
];

const blinkAt = (f: number, starts: number[]) =>
  Math.max(0, ...starts.map((s) => (f >= s && f < s + 6 ? 1 - Math.abs(f - s - 3) / 3 : 0)));

const ease = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) } as const;

/** 4-second style test: two characters in a yellow office, camera slowly pushes in. */
export const ToonTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = onTwos(frame); // characters on twos

  // Camera: on ones, slow push-in
  const camZ = interpolate(frame, [0, 119], [13.5, 12.0], ease);
  const camX = interpolate(frame, [0, 119], [0.4, 0], ease);

  // A: anticipation dip → raise arm → wave → lower
  const dip = interpolate(f, [6, 12, 18], [1, 0.95, 1.03], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const raise = interpolate(f, [12, 24, 76, 88], [0, 1, 1, 0], ease);
  const wave = Math.sin((f - 24) / 3.2) * 0.3 * raise;
  const breathA = 1 + Math.sin(f / 9) * 0.01;

  // B: sip from the mug
  const sip = interpolate(f, [46, 60, 82, 94], [0, 1, 1, 0], ease);
  const breathB = 1 + Math.sin(f / 10 + 1) * 0.01;

  return (
    <AbsoluteFill style={{ background: PALETTE.wallYellow }}>
      <ThreeCanvas width={width} height={height} linear={false}>
        <CameraRig position={[camX, 2.6, camZ]} target={[camX * 0.5, 2.0, 0]} fov={30} />
        <ambientLight intensity={1.6} />
        <directionalLight position={[-4, 8, 6]} intensity={2.2} />
        <Office />
        <group position={[-1.6, 0, 0.6]} rotation={[0, 0.18, 0]}>
          <Character
            look={{ skin: PALETTE.skinTan, top: PALETTE.sweaterYellow, topType: 'sweater', hair: PALETTE.hairDark, glasses: true }}
            pose={{
              armLeft: 0.12,
              armRight: 0.12 + raise * 1.9 + wave,
              squash: dip * breathA,
              blink: blinkAt(f, [40, 100]),
              happy: raise > 0.6 ? 1 : 0,
              headTilt: Math.sin(f / 14) * 0.03,
            }}
          />
        </group>
        <group position={[1.9, 0, 0.3]} rotation={[0, -0.22, 0]}>
          <Character
            look={{ skin: PALETTE.skinPeach, top: PALETTE.hoodieTeal, topType: 'hoodie', hair: PALETTE.hairBrown }}
            pose={{
              armLeft: 0.12,
              mug: { lift: sip },
              squash: breathB,
              blink: blinkAt(f, [28, 76]),
              headTilt: -0.04 + sip * -0.06,
            }}
          />
        </group>
      </ThreeCanvas>
      <Captions words={WORDS} />
      <Audio src={staticFile('audio/toon-test-bed.wav')} volume={0.6} />
    </AbsoluteFill>
  );
};
