import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setModelUrlResolver } from '../src/assets/Model';
import { Flat } from '../src/lib/Toon';
import { Character } from '../src/rig/Character';
import { breathe } from '../src/rig/motion';
import { Shadow } from '../src/props/Props';
import { CAST, PROJECT } from '../src/project';
import { OBJECTS } from '../src/objects';
import { LOCATIONS } from '../src/locations';
import { STAGINGS, type Shot } from '../src/staging';
import { MODELS } from './models.generated';

setModelUrlResolver((f) => MODELS[f] ?? f);

type V3 = [number, number, number];
type Item = { key: string; stage: string; title: string; status: string; render: () => JSX.Element; home: { pos: V3; target: V3 }; shots?: Shot[]; light?: { ambient: string; ambientI: number; sun: string; sunI: number; sunPos: V3; fog?: [string, number, number] }; bg?: string };

const STUDIO = { ambient: '#ffffff', ambientI: 1.6, sun: '#fff6e8', sunI: 2.1, sunPos: [-5, 9, 8] as V3 };
const floor = <Flat color="#d8cfbf" rotation={[-Math.PI / 2, 0, 0]} scale={[400, 400, 1]} />;
const castById = (id: string) => CAST.find((c) => c.id === id)!;

const items: Item[] = [
  {
    key: 'cast-all',
    stage: '1 · Персонажи',
    title: 'Все персонажи',
    status: CAST.every((c) => c.status === 'approved') ? 'approved' : 'draft',
    home: { pos: [0, 3, 6 + CAST.length * 2.6], target: [0, 2.2, 0] },
    render: () => (
      <>
        {floor}
        {CAST.map((c, i) => (
          <group key={c.id} position={[(i - (CAST.length - 1) / 2) * 3.2, 0, 0]}>
            <Shadow r={0.9} />
            <Character look={c.look} pose={{ expr: 'smile' }} />
          </group>
        ))}
      </>
    ),
  },
  ...CAST.map((c) => ({
    key: `cast-${c.id}`,
    stage: '1 · Персонажи',
    title: `${c.name} — ${c.role}`,
    status: c.status,
    home: { pos: [2, 3, 7] as V3, target: [0, 2.2, 0] as V3 },
    render: () => (
      <>
        {floor}
        <Shadow r={0.9} />
        <Character look={c.look} pose={{ expr: 'smile', squash: breathe(0) }} />
      </>
    ),
  })),
  ...OBJECTS.map((o) => ({
    key: `obj-${o.id}`,
    stage: '2 · Объекты',
    title: `${o.name}${o.source === 'model' ? ' (модель)' : ''}`,
    status: o.status,
    home: { pos: [6, 5, 14] as V3, target: [0, 2, 0] as V3 },
    render: () => (
      <>
        {floor}
        <ScaleRef>
          <o.C />
        </ScaleRef>
      </>
    ),
  })),
  ...LOCATIONS.map((l) => ({
    key: `loc-${l.id}`,
    stage: '3 · Локации',
    title: l.name,
    status: l.status,
    light: l.light as Item['light'],
    bg: l.bg,
    home: { pos: [10, 7, 28] as V3, target: [0, 4, 0] as V3 },
    render: () => <l.Set />,
  })),
  ...STAGINGS.map((s) => {
    const loc = LOCATIONS.find((l) => l.id === s.location)!;
    return {
      key: `stage-${s.id}`,
      stage: '4 · Расстановка',
      title: s.name,
      status: s.status,
      light: loc.light as Item['light'],
      bg: loc.bg,
      shots: s.shots,
      home: { pos: s.shots[0]?.pos ?? ([8, 6, 18] as V3), target: s.shots[0]?.target ?? ([0, 2, 0] as V3) },
      render: () => (
        <>
          <loc.Set />
          {s.objects.map((o, i) => {
            const O = OBJECTS.find((x) => x.id === o.obj)!;
            return (
              <group key={i} position={o.pos} rotation={[0, o.rotY ?? 0, 0]}>
                <O.C />
              </group>
            );
          })}
          {s.actors.map((a, i) => (
            <group key={i} position={a.pos} rotation={[0, a.rotY ?? 0, 0]}>
              <Shadow r={0.85} />
              <Character look={castById(a.cast).look} pose={a.pose} />
            </group>
          ))}
        </>
      ),
    };
  }),
];

/** Object + a person standing next to it (placed by the object's real size, never inside it). */
const ScaleRef: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const obj = useRef<THREE.Group>(null);
  const person = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!obj.current || !person.current) return;
    const b = new THREE.Box3().setFromObject(obj.current);
    if (b.isEmpty()) return;
    person.current.position.set(b.min.x - 1.4, 0, Math.max(b.max.z, 0) + 0.5);
  });
  return (
    <>
      <group ref={obj}>{children}</group>
      <group ref={person} rotation={[0, 0.5, 0]}>
        <Shadow r={0.9} />
        <Character look={CAST[0].look} pose={{ expr: 'smile' }} />
      </group>
    </>
  );
};

/* ---------- camera: orbit + WASD fly + animated jumps to shot cameras ---------- */
const CameraRig: React.FC<{ goal: { pos: V3; target: V3; fov?: number; n: number } }> = ({ goal }) => {
  const { camera, gl } = useThree();
  const ctl = useRef<OrbitControls>();
  const keys = useRef(new Set<string>());
  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement);
    c.enableDamping = true;
    c.maxPolarAngle = Math.PI * 0.495;
    ctl.current = c;
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      keys.current.add(e.key.toLowerCase());
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    addEventListener('keydown', down);
    addEventListener('keyup', up);
    let raf = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = keys.current;
      const speed = (k.has('shift') ? 30 : 10) * dt;
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
      const mv = new THREE.Vector3();
      if (k.has('w') || k.has('ц') || k.has('arrowup')) mv.add(fwd);
      if (k.has('s') || k.has('ы') || k.has('arrowdown')) mv.sub(fwd);
      if (k.has('d') || k.has('в') || k.has('arrowright')) mv.add(right);
      if (k.has('a') || k.has('ф') || k.has('arrowleft')) mv.sub(right);
      if (k.has('e') || k.has('у')) mv.y += 1;
      if (k.has('q') || k.has('й')) mv.y -= 1;
      if (mv.lengthSq()) {
        mv.normalize().multiplyScalar(speed);
        camera.position.add(mv);
        c.target.add(mv);
      }
      c.update();
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('keydown', down);
      removeEventListener('keyup', up);
      c.dispose();
    };
  }, [camera, gl]);
  useEffect(() => {
    const c = ctl.current;
    if (!c) return;
    const p0 = camera.position.clone();
    const t0 = c.target.clone();
    const f0 = (camera as THREE.PerspectiveCamera).fov;
    const p1 = new THREE.Vector3(...goal.pos);
    const t1 = new THREE.Vector3(...goal.target);
    const f1 = goal.fov ?? 40;
    const start = performance.now();
    let raf = 0;
    const step = () => {
      const u = Math.min(1, (performance.now() - start) / 700);
      const e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
      camera.position.lerpVectors(p0, p1, e);
      c.target.lerpVectors(t0, t1, e);
      (camera as THREE.PerspectiveCamera).fov = f0 + (f1 - f0) * e;
      camera.updateProjectionMatrix();
      if (u < 1) raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [goal.n]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const Lights: React.FC<{ l: NonNullable<Item['light']>; bg: string }> = ({ l, bg }) => {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(bg);
    scene.fog = l.fog ? new THREE.Fog(l.fog[0], l.fog[1] * 2, l.fog[2] * 2) : null;
  }, [scene, l, bg]);
  return (
    <>
      <ambientLight color={l.ambient} intensity={l.ambientI} />
      <directionalLight color={l.sun} intensity={l.sunI} position={l.sunPos} />
    </>
  );
};

const NOTES_KEY = `review-notes-${PROJECT.title}`;

const App: React.FC = () => {
  const [sel, setSel] = useState(items[0].key);
  const [frame, setFrame] = useState(false);
  const item = items.find((i) => i.key === sel)!;
  const [goal, setGoal] = useState({ ...item.home, fov: 40, n: 0 });
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}');
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {
      /* private mode */
    }
  }, [notes]);
  const pick = (k: string) => {
    const it = items.find((i) => i.key === k)!;
    setSel(k);
    setFrame(false);
    setGoal((g) => ({ ...it.home, fov: 40, n: g.n + 1 }));
  };
  const stages = useMemo(() => [...new Set(items.map((i) => i.stage))], []);
  const copyAll = () => {
    const txt = items
      .filter((i) => notes[i.key]?.trim())
      .map((i) => `[${i.stage} → ${i.title}]\n${notes[i.key].trim()}`)
      .join('\n\n');
    navigator.clipboard?.writeText(txt || 'Правок нет — всё согласовано.');
    alert(txt ? 'Правки скопированы. Вставьте их в чат с Claude.' : 'Правок нет. Скопировано «всё согласовано».');
  };
  const aspect = PROJECT.width / PROJECT.height;
  return (
    <div className="app">
      <aside>
        <h1>{PROJECT.title}</h1>
        <p className="muted">Согласование до анимации</p>
        {stages.map((s) => (
          <section key={s}>
            <h2>{s}</h2>
            {items
              .filter((i) => i.stage === s)
              .map((i) => (
                <button key={i.key} className={i.key === sel ? 'item on' : 'item'} onClick={() => pick(i.key)}>
                  <span>{i.title}</span>
                  <span className={'badge ' + i.status}>{i.status === 'approved' ? '✓' : '•'}</span>
                  {notes[i.key]?.trim() && <span className="dot" title="есть правки" />}
                </button>
              ))}
          </section>
        ))}
        <button className="copy" onClick={copyAll}>📋 Скопировать все правки</button>
      </aside>
      <main>
        <Canvas camera={{ fov: 40, near: 0.1, far: 800, position: item.home.pos }} gl={{ antialias: true }}>
          <Lights l={item.light ?? STUDIO} bg={item.bg ?? '#efe9df'} />
          <CameraRig goal={goal} />
          {item.render()}
        </Canvas>
        {frame && <div className="frame" style={{ aspectRatio: String(aspect) }} />}
        <div className="bar">
          <button onClick={() => setGoal((g) => ({ ...item.home, fov: 40, n: g.n + 1 }))}>⟲ Сброс</button>
          {item.shots?.map((s) => (
            <button
              key={s.name}
              title={s.note}
              onClick={() => {
                setFrame(true);
                setGoal((g) => ({ pos: s.pos, target: s.target, fov: s.fov ?? 40, n: g.n + 1 }));
              }}
            >
              🎥 {s.name}
            </button>
          ))}
          {item.shots && (
            <button className={frame ? 'on' : ''} onClick={() => setFrame(!frame)}>
              ▭ Рамка {PROJECT.width}×{PROJECT.height}
            </button>
          )}
        </div>
        <div className="help">Мышь: вращать · колесо: зум · правая кнопка: сдвиг · <b>W A S D</b>: лететь · <b>Q / E</b>: вниз / вверх · <b>Shift</b>: быстрее</div>
        <div className="notes">
          <label>Правки к «{item.title}»</label>
          <textarea value={notes[sel] ?? ''} placeholder="Что поменять? Например: машину ближе к дому, у героя кепка синяя…" onChange={(e) => setNotes({ ...notes, [sel]: e.target.value })} />
        </div>
      </main>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
