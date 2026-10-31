import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { useT } from '../cast';
import { Captions } from '../lib/Captions';
import { clamp01, smooth } from '../lib/anim';
import { CUTS, SCENES } from './scenes';
import { WORDS } from './words';

export const FILM_SECONDS = 75.4;

/** Soft dissolve length at each cut: longer when the location changes. */
const LOC_CHANGE = new Set([10.0, 20.4, 43.1, 56.65, 61.45, 66.3]);
const dissolveLen = (c: number) => (LOC_CHANGE.has(c) ? 1.0 : 0.5);

const sceneAt = (t: number) => SCENES.find((s) => t >= s.from && t < s.to) ?? SCENES[SCENES.length - 1];

/**
 * The whole film in one timeline (global seconds). Parts are windows into it.
 * Shots are joined by soft dissolves centred on the sentence cut: the outgoing shot
 * holds its last frame, the incoming one holds its first frame, and they cross-fade.
 */
export const Movie: React.FC = () => {
  const t = useT();
  const cut = CUTS.slice(1, -1).find((c) => Math.abs(t - c) < dissolveLen(c) / 2);
  const fade = Math.max(1 - clamp01(t / 0.5), clamp01((t - 74.9) / 0.5));
  let body: React.ReactNode;
  if (cut !== undefined) {
    const len = dissolveLen(cut);
    const k = smooth(clamp01((t - (cut - len / 2)) / len));
    const A = sceneAt(cut - 0.001).C;
    const B = sceneAt(cut).C;
    body = (
      <>
        <AbsoluteFill>
          <A t={Math.min(t, cut - 0.001)} />
        </AbsoluteFill>
        <AbsoluteFill style={{ opacity: k }}>
          <B t={Math.max(t, cut)} />
        </AbsoluteFill>
      </>
    );
  } else {
    const S = sceneAt(t).C;
    body = <S t={t} />;
  }
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Audio src={staticFile('audio/voice.mp3')} />
      {body}
      <Captions phrases={WORDS} />
      {fade > 0 && <AbsoluteFill style={{ background: '#000', opacity: fade }} />}
    </AbsoluteFill>
  );
};
