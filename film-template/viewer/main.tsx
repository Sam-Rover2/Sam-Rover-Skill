import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
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
let fitHook: ((pos: V3, target: V3) => void) | null = null;
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
        <ScaleRef onFit={(p, t) => fitHook?.(p, t)}>
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
const ScaleRef: React.FC<{ children: React.ReactNode; onFit?: (pos: V3, target: V3) => void }> = ({ children, onFit }) => {
  const obj = useRef<THREE.Group>(null);
  const person = useRef<THREE.Group>(null);
  const fitted = useRef(false);
  useFrame(() => {
    if (!obj.current || !person.current) return;
    const b = new THREE.Box3().setFromObject(obj.current);
    if (b.isEmpty()) return;
    person.current.position.set(b.min.x - 1.4, 0, Math.max(b.max.z, 0) + 0.5);
    if (!fitted.current && onFit) {
      // frame the OBJECT (the person stays at the side for scale)
      fitted.current = true;
      const c = b.getCenter(new THREE.Vector3());
      const sz = b.getSize(new THREE.Vector3());
      const d = Math.max(1.6, Math.max(sz.x, sz.y, sz.z) * 2.2);
      onFit([c.x + d * 0.45, c.y + d * 0.35, c.z + d], [c.x - 0.2, c.y, c.z]);
    }
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

/* ---------- camera: game-style "head" look + WASD fly, wheel = speed ---------- */
export const SPEED = { min: 1, max: 40, init: 8 };
let speedHook: ((v: number) => void) | null = null;

const CameraRig: React.FC<{ goal: { pos: V3; target: V3; fov?: number; n: number } }> = ({ goal }) => {
  const { camera, gl } = useThree();
  const look = useRef({ yaw: 0, pitch: 0 });
  const speed = useRef(SPEED.init);
  const keys = useRef(new Set<string>());
  const setLookAt = (target: THREE.Vector3) => {
    const d = target.clone().sub(camera.position).normalize();
    look.current.yaw = Math.atan2(d.x, d.z);
    look.current.pitch = Math.asin(THREE.MathUtils.clamp(d.y, -1, 1));
  };
  const applyLook = () => {
    const { yaw, pitch } = look.current;
    const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camera.lookAt(camera.position.clone().add(dir));
  };
  useEffect(() => {
    const el = gl.domElement;
    let drag = false;
    let lx = 0;
    let ly = 0;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const k = 0.004;
      look.current.yaw -= (e.clientX - lx) * k;
      look.current.pitch = THREE.MathUtils.clamp(look.current.pitch - (e.clientY - ly) * k, -1.5, 1.5);
      lx = e.clientX;
      ly = e.clientY;
      applyLook();
    };
    const up = () => {
      drag = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      // wheel up → faster, wheel down → slower, within [min, max]
      speed.current = THREE.MathUtils.clamp(speed.current * (e.deltaY < 0 ? 1.2 : 1 / 1.2), SPEED.min, SPEED.max);
      speedHook?.(speed.current);
    };
    const kd = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      keys.current.add(e.key.toLowerCase());
    };
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('wheel', wheel, { passive: false });
    addEventListener('keydown', kd);
    addEventListener('keyup', ku);
    let raf = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = keys.current;
      const v = speed.current * (k.has('shift') ? 3 : 1) * dt;
      const { yaw } = look.current;
      const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
      const mv = new THREE.Vector3();
      if (k.has('w') || k.has('ц') || k.has('arrowup')) mv.add(fwd);
      if (k.has('s') || k.has('ы') || k.has('arrowdown')) mv.sub(fwd);
      if (k.has('d') || k.has('в') || k.has('arrowright')) mv.add(right);
      if (k.has('a') || k.has('ф') || k.has('arrowleft')) mv.sub(right);
      if (k.has('e') || k.has('у')) mv.y += 1;
      if (k.has('q') || k.has('й')) mv.y -= 1;
      if (mv.lengthSq()) {
        camera.position.add(mv.normalize().multiplyScalar(v));
        applyLook();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('wheel', wheel);
      removeEventListener('keydown', kd);
      removeEventListener('keyup', ku);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl]);
  // smooth jump to a preset (item home or shot camera)
  useEffect(() => {
    const p0 = camera.position.clone();
    const { yaw: y0, pitch: x0 } = look.current;
    const f0 = (camera as THREE.PerspectiveCamera).fov;
    const p1 = new THREE.Vector3(...goal.pos);
    const tmp = camera.position.clone();
    camera.position.copy(p1);
    setLookAt(new THREE.Vector3(...goal.target));
    const { yaw: y1, pitch: x1 } = look.current;
    camera.position.copy(tmp);
    const f1 = goal.fov ?? 40;
    const dy = Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0));
    const start = performance.now();
    let raf = 0;
    const step = () => {
      const u = Math.min(1, (performance.now() - start) / 700);
      const e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
      camera.position.lerpVectors(p0, p1, e);
      look.current.yaw = y0 + dy * e;
      look.current.pitch = x0 + (x1 - x0) * e;
      (camera as THREE.PerspectiveCamera).fov = f0 + (f1 - f0) * e;
      camera.updateProjectionMatrix();
      applyLook();
      if (u < 1) raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [goal.n]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

/* ---------- 3D pins: numbered points the user places on the scene ---------- */
export interface Pin {
  n: number;
  p: V3;
  obj: string; // name of the object under the click
  note: string;
}
const pinTex = (n: number) => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e0573f';
  g.beginPath();
  g.arc(64, 64, 58, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = 8;
  g.strokeStyle = '#ffffff';
  g.stroke();
  g.fillStyle = '#ffffff';
  g.font = '900 72px Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(String(n), 64, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const PinMarker: React.FC<{ pin: Pin }> = ({ pin }) => {
  const tex = useMemo(() => pinTex(pin.n), [pin.n]);
  return (
    <group position={pin.p}>
      <mesh>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshBasicMaterial color="#e0573f" depthTest={false} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
        <meshBasicMaterial color="#e0573f" depthTest={false} />
      </mesh>
      <sprite position={[0, 1.45, 0]} scale={[0.9, 0.9, 1]} renderOrder={999}>
        <spriteMaterial map={tex} depthTest={false} />
      </sprite>
    </group>
  );
};
/** Name of the clicked object: nearest parent group with a name. */
const objName = (o: THREE.Object3D | null) => {
  while (o) {
    if (o.name && !o.name.startsWith('__')) return o.name;
    o = o.parent;
  }
  return 'поверхность';
};

const Lights: React.FC<{ l: NonNullable<Item['light']>; bg: string }> = ({ l, bg }) => {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(bg);
    scene.fog = l.fog ? new THREE.Fog(l.fog[0], l.fog[1], l.fog[2]) : null; // same fog as in the film
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
  const [pinMode, setPinMode] = useState(false);
  const [pins, setPins] = useState<Record<string, Pin[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem(NOTES_KEY + '-pins') ?? '{}');
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY + '-pins', JSON.stringify(pins));
    } catch {
      /* private mode */
    }
  }, [pins]);
  const itemPins = pins[sel] ?? [];
  const setItemPins = (list: Pin[]) => setPins({ ...pins, [sel]: list });
  const [speed, setSpeed] = useState(SPEED.init);
  speedHook = setSpeed;
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
  fitHook = (pos, target) => setGoal((g) => ({ pos, target, fov: 40, n: g.n + 1 }));
  const pick = (k: string) => {
    const it = items.find((i) => i.key === k)!;
    setSel(k);
    setFrame(false);
    setGoal((g) => ({ ...it.home, fov: 40, n: g.n + 1 }));
  };
  const stages = useMemo(() => [...new Set(items.map((i) => i.stage))], []);
  const copyAll = () => {
    const fmt = (v: number) => v.toFixed(1);
    const txt = items
      .filter((i) => notes[i.key]?.trim() || (pins[i.key] ?? []).length)
      .map((i) => {
        const pl = (pins[i.key] ?? []).map((p) => `  📍 Точка ${p.n} → ${p.obj} (x ${fmt(p.p[0])}, y ${fmt(p.p[1])}, z ${fmt(p.p[2])})${p.note.trim() ? ': ' + p.note.trim() : ''}`);
        return [`[${i.stage} → ${i.title}]`, notes[i.key]?.trim() ?? '', ...pl].filter(Boolean).join('\n');
      })
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
                  {(notes[i.key]?.trim() || (pins[i.key] ?? []).length > 0) && <span className="dot" title="есть правки" />}
                </button>
              ))}
          </section>
        ))}
        <button className="copy" onClick={copyAll}>📋 Скопировать все правки</button>
        <button
          className="clear"
          onClick={() => {
            const n = Object.values(notes).filter((v) => v?.trim()).length;
            const np = Object.values(pins).reduce((a, l) => a + l.length, 0);
            if (!n && !np) return alert('Правок нет — очищать нечего.');
            if (confirm(`Удалить все правки (${n} шт.) и точки (${np} шт.) во всех этапах?`)) {
              setNotes({});
              setPins({});
            }
          }}
        >
          🗑 Очистить все правки
        </button>
      </aside>
      <main>
        <Canvas camera={{ fov: 40, near: 0.1, far: 800, position: item.home.pos }} gl={{ antialias: true }}>
          <Lights l={item.light ?? STUDIO} bg={item.bg ?? '#efe9df'} />
          <CameraRig goal={goal} />
          <group
            key={item.key}
            onClick={(e) => {
              if (!pinMode || e.delta > 4) return; // a drag is a head turn, not a click
              e.stopPropagation();
              const n = (itemPins.reduce((m, p) => Math.max(m, p.n), 0) || 0) + 1;
              setItemPins([...itemPins, { n, p: e.point.toArray() as V3, obj: objName(e.object), note: '' }]);
            }}
          >
            {item.render()}
          </group>
          {itemPins.map((p) => (
            <PinMarker key={p.n} pin={p} />
          ))}
        </Canvas>
        {frame && <div className="frame" style={{ aspectRatio: String(aspect) }} />}
        <div className="bar">
          <button onClick={() => setGoal((g) => ({ ...item.home, fov: 40, n: g.n + 1 }))}>⟲ Сброс</button>
          <button className={pinMode ? 'on' : ''} onClick={() => setPinMode(!pinMode)} title="Клик по сцене ставит пронумерованную точку">
            📍 Точки {pinMode ? '(вкл — кликайте по сцене)' : ''}
          </button>
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
        <div className="help">
          <b>ЛКМ</b>: повернуть голову (в режиме 📍 — клик ставит точку) · <b>W A S D</b>: лететь · <b>Q / E</b>: вниз / вверх · <b>колесо</b>: скорость · <b>Shift</b>: ×3
          <span className="speed">
            <span style={{ width: `${((Math.log(speed) - Math.log(SPEED.min)) / (Math.log(SPEED.max) - Math.log(SPEED.min))) * 100}%` }} />
          </span>
          скорость {speed.toFixed(1)}
        </div>
        <div className="notes">
          <label>Правки к «{item.title}»</label>
          {itemPins.length > 0 && (
            <div className="pins">
              {itemPins.map((p) => (
                <div key={p.n} className="pin">
                  <b>📍 {p.n}</b>
                  <span className="pobj">{p.obj}</span>
                  <input
                    value={p.note}
                    placeholder="что сделать (можно оставить пустой — как место назначения)"
                    onChange={(e) => setItemPins(itemPins.map((q) => (q.n === p.n ? { ...q, note: e.target.value } : q)))}
                  />
                  <button onClick={() => setItemPins(itemPins.filter((q) => q.n !== p.n))} title="удалить точку">×</button>
                </div>
              ))}
            </div>
          )}
          <textarea value={notes[sel] ?? ''} placeholder="Что поменять? Например: машину ближе к дому, у героя кепка синяя…" onChange={(e) => setNotes({ ...notes, [sel]: e.target.value })} />
        </div>
      </main>
    </div>
  );
};

if (!(window as unknown as { __noWebGL?: boolean }).__noWebGL) {
  const root = document.getElementById('root')!;
  root.innerHTML = '';
  createRoot(root).render(<App />);
}
