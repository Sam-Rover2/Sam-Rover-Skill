import { Player, type PlayerRef } from '@remotion/player';
import { useEffect, useRef, useState } from 'react';
import { Timeline } from './components/Timeline';
import { SegmentEditor } from './components/SegmentEditor';
import { VideoComposition } from './remotion/VideoComposition';
import { trimVideo } from './lib/ffmpeg';
import { clampRange, formatTime, FPS, toFrames, validateSegment } from './lib/time';
import type { Segment } from './types';

interface Loaded {
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
}

/** Read duration and size of a video file via a hidden <video> element. */
function probe(file: File): Promise<Loaded> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () =>
      resolve({ file, url, duration: v.duration, width: v.videoWidth || 1280, height: v.videoHeight || 720 });
    v.onerror = () => reject(new Error('Не удалось прочитать видео'));
    v.src = url;
  });
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

export default function App() {
  const [video, setVideo] = useState<Loaded | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<[number, number]>([0, 0]);
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState('');
  const [exporting, setExporting] = useState(false);
  const player = useRef<PlayerRef>(null);

  // Keep the timeline playhead in sync with the Remotion player.
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => setTime(e.detail.frame / FPS);
    p.addEventListener('frameupdate', onFrame);
    return () => p.removeEventListener('frameupdate', onFrame);
  }, [video]);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.includes('mp4')) {
      setStatus('Пожалуйста, выберите файл MP4');
      return;
    }
    try {
      const v = await probe(file);
      setVideo(v);
      setSegments([]);
      setSelectedId(null);
      setDraft([0, Math.min(3, v.duration)]);
      setStatus(`Загружено: ${file.name}`);
    } catch (e) {
      setStatus((e as Error).message);
    }
  };

  const seek = (sec: number) => {
    const t = Math.max(0, Math.min(sec, video?.duration ?? 0));
    player.current?.seekTo(toFrames(t));
    setTime(t);
  };

  const addSegment = () => {
    if (!video) return;
    const [start, end] = clampRange(draft[0], draft[1], video.duration);
    const err = validateSegment({ start, end }, video.duration);
    if (err) return setStatus(err);
    const seg: Segment = { id: crypto.randomUUID(), start, end, prompt: '', effect: 'title', images: [] };
    setSegments((s) => [...s, seg].sort((a, b) => a.start - b.start));
    setSelectedId(seg.id);
    setStatus('Правка добавлена — напишите промпт справа');
  };

  const updateSegment = (id: string, patch: Partial<Segment>) =>
    setSegments((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const exportRange = async (start: number, end: number) => {
    if (!video) return;
    setExporting(true);
    setStatus('Загружаю FFmpeg (первый раз ~30 МБ)…');
    try {
      const blob = await trimVideo(video.file, start, end, (r) =>
        setStatus(`Экспорт: ${Math.round(r * 100)}%`),
      );
      download(blob, `clip_${start.toFixed(1)}-${end.toFixed(1)}.mp4`);
      setStatus('Готово! Файл скачан.');
    } catch (e) {
      setStatus(`Ошибка экспорта: ${(e as Error).message}`);
    } finally {
      setExporting(false);
    }
  };

  const selected = segments.find((s) => s.id === selectedId) ?? null;
  const durationInFrames = video ? Math.max(1, Math.floor(video.duration * FPS)) : 1;

  return (
    <div className="app">
      <header>
        <h1>🎬 AI Video Editor</h1>
        <label className="upload">
          Загрузить MP4
          <input type="file" accept="video/mp4" onChange={(e) => onFile(e.target.files?.[0])} hidden />
        </label>
      </header>

      {!video ? (
        <div
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files[0]);
          }}
        >
          Перетащите сюда MP4-видео или нажмите «Загрузить MP4»
        </div>
      ) : (
        <main>
          <section className="left">
            <Player
              ref={player}
              component={VideoComposition}
              inputProps={{ videoUrl: video.url, segments }}
              durationInFrames={durationInFrames}
              fps={FPS}
              compositionWidth={video.width}
              compositionHeight={video.height}
              style={{ width: '100%', aspectRatio: `${video.width} / ${video.height}` }}
              controls
            />

            <Timeline
              duration={video.duration}
              currentTime={time}
              segments={segments}
              selectedId={selectedId}
              draft={draft}
              onSeek={seek}
              onSelect={(id) => {
                setSelectedId(id);
                const s = segments.find((x) => x.id === id);
                if (s) seek(s.start);
              }}
            />

            <div className="panel range">
              <span>Диапазон:</span>
              <label>
                от
                <input
                  type="number" step={0.1} min={0} max={video.duration}
                  value={draft[0].toFixed(1)}
                  onChange={(e) => setDraft([Number(e.target.value), draft[1]])}
                />
              </label>
              <button onClick={() => setDraft([time, draft[1]])}>← текущее время</button>
              <label>
                до
                <input
                  type="number" step={0.1} min={0} max={video.duration}
                  value={draft[1].toFixed(1)}
                  onChange={(e) => setDraft([draft[0], Number(e.target.value)])}
                />
              </label>
              <button onClick={() => setDraft([draft[0], time])}>← текущее время</button>
              <button className="primary" onClick={addSegment}>+ Добавить правку</button>
              <button onClick={() => exportRange(...clampRange(draft[0], draft[1], video.duration))} disabled={exporting}>
                Вырезать диапазон в MP4
              </button>
            </div>
          </section>

          <aside className="right">
            <h2>Правки ({segments.length})</h2>
            <ul className="seg-list">
              {segments.map((s, i) => (
                <li key={s.id} className={s.id === selectedId ? 'selected' : ''} onClick={() => setSelectedId(s.id)}>
                  #{i + 1} {formatTime(s.start)}–{formatTime(s.end)} {s.prompt && `· ${s.prompt.slice(0, 30)}`}
                </li>
              ))}
            </ul>
            {selected && (
              <SegmentEditor
                segment={selected}
                exporting={exporting}
                onChange={(p) => updateSegment(selected.id, p)}
                onDelete={() => {
                  setSegments((s) => s.filter((x) => x.id !== selected.id));
                  setSelectedId(null);
                }}
                onExport={() => exportRange(selected.start, selected.end)}
              />
            )}
          </aside>
        </main>
      )}
      <footer className="status">{status}</footer>
    </div>
  );
}
