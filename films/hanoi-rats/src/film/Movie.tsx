import '@fontsource/nunito/900.css';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { useT } from '../cast';
import { Captions } from '../lib/Captions';
import { clamp01 } from '../lib/anim';
import { SCENES } from './scenes';
import { WORDS } from './words';

export const FILM_SECONDS = 75.4;

/** Transitions between scenes: whip (blur), dip to black, white flash. */
const CUTS: { at: number; kind: 'whip' | 'dip' | 'flash'; len: number }[] = [
  { at: 10.1, kind: 'dip', len: 0.25 },
  { at: 20.5, kind: 'whip', len: 0.22 },
  { at: 43.3, kind: 'dip', len: 0.35 },
  { at: 56.7, kind: 'whip', len: 0.22 },
  { at: 61.5, kind: 'flash', len: 0.25 },
  { at: 66.4, kind: 'flash', len: 0.2 },
];

const tri = (t: number, at: number, len: number) => Math.max(0, 1 - Math.abs(t - at) / len);

const Stamp: React.FC<{ t: number; from: number; to: number; text: string; sub?: string; color?: string; top?: number; rot?: number; size?: number }> = ({ t, from, to, text, sub, color = '#ffd34d', top = 300, rot = -6, size = 140 }) => {
  if (t < from || t > to) return null;
  const k = clamp01((t - from) / 0.18);
  const out = clamp01((to - t) / 0.2);
  const s = 2.2 - 1.2 * (1 - (1 - k) ** 3) + (k >= 1 ? Math.sin((t - from) * 30) * 0.02 * Math.max(0, 1 - (t - from - 0.18) * 3) : 0);
  return (
    <AbsoluteFill style={{ alignItems: 'center', top, height: 'auto', opacity: Math.min(k * 1.5, out) }}>
      <div style={{ transform: `rotate(${rot}deg) scale(${s})`, textAlign: 'center', fontFamily: 'Nunito', fontWeight: 900, color, fontSize: size, lineHeight: 1, WebkitTextStroke: '12px #1b1b1f', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,.35)' }}>
        {text}
        {sub && <div style={{ fontSize: size * 0.42, color: '#fff', marginTop: 10 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** The whole film in one timeline (global seconds). Parts are windows into it. */
export const Movie: React.FC = () => {
  const t = useT();
  const sc = SCENES.find((s) => t >= s.from && t < s.to) ?? SCENES[SCENES.length - 1];
  const whip = Math.max(0, ...CUTS.filter((c) => c.kind === 'whip').map((c) => tri(t, c.at, c.len)));
  const dip = Math.max(0, ...CUTS.filter((c) => c.kind === 'dip').map((c) => tri(t, c.at, c.len)), clamp01((t - 74.6) / 0.5));
  const flash = Math.max(0, ...CUTS.filter((c) => c.kind === 'flash').map((c) => tri(t, c.at, c.len)), tri(t, 51.62, 0.12) * 0.7);
  const count = Math.round(20000 * (1 - (1 - clamp01((t - 40.9) / 1.4)) ** 3));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Audio src={staticFile('audio/voice.mp3')} />
      <AbsoluteFill style={{ filter: whip > 0 ? `blur(${whip * 28}px)` : undefined, transform: whip > 0 ? `scale(${1 + whip * 0.08})` : undefined }}>
        <sc.C t={t} />
      </AbsoluteFill>
      {/* cinematic vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.38) 100%)' }} />
      {/* titles & graphics on the beats */}
      <Stamp t={t} from={0.3} to={2.9} text="HANOÏ" sub="1902" color="#fff3d6" top={260} rot={-3} />
      <Stamp t={t} from={25.0} to={26.9} text="CASH BOUNTY!" color="#ffd34d" top={360} rot={-7} size={120} />
      <Stamp t={t} from={36.25} to={37.1} text="+1¢" color="#ffd34d" top={520} rot={5} size={170} />
      {t > 40.8 && t < 43.1 && <Stamp t={t} from={40.8} to={43.1} text={count.toLocaleString('fr-FR')} sub="TAILS / DAY" color="#ff6a5a" top={330} rot={-4} size={170} />}
      <Stamp t={t} from={51.6} to={52.35} text="SNIP!" color="#ffffff" top={420} rot={-10} size={170} />
      <Stamp t={t} from={60.0} to={61.4} text="RAT FARMS" color="#ffd34d" top={300} rot={-5} size={120} />
      <Stamp t={t} from={62.3} to={63.9} text="BOUNTY CANCELLED" color="#ff5a4a" top={300} rot={8} size={96} />
      <Captions phrases={WORDS} />
      {/* transitions */}
      {dip > 0 && <AbsoluteFill style={{ background: '#000', opacity: Math.min(1, dip * 1.4) }} />}
      {flash > 0 && <AbsoluteFill style={{ background: '#fffbe8', opacity: flash }} />}
    </AbsoluteFill>
  );
};
