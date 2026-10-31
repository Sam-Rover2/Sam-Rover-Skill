import type { Effect, Segment } from '../types';
import { formatTime } from '../lib/time';

interface Props {
  segment: Segment;
  onChange: (patch: Partial<Segment>) => void;
  onDelete: () => void;
  onExport: () => void;
  exporting: boolean;
}

const EFFECTS: { value: Effect; label: string }[] = [
  { value: 'title', label: 'Анимированный титр (текст промпта)' },
  { value: 'zoom', label: 'Плавный зум' },
  { value: 'shapes', label: 'Летающие 2D-фигуры' },
  { value: 'none', label: 'Без эффекта' },
];

export function SegmentEditor({ segment, onChange, onDelete, onExport, exporting }: Props) {
  const addImages = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    onChange({ images: [...segment.images, ...images] });
  };

  return (
    <div className="panel">
      <h3>
        Правка {formatTime(segment.start)} – {formatTime(segment.end)}
      </h3>

      <label>
        Промпт (что сделать в этом фрагменте)
        <textarea
          rows={3}
          value={segment.prompt}
          placeholder="Например: «Добавь заголовок Привет!»"
          onChange={(e) => onChange({ prompt: e.target.value })}
        />
      </label>

      <label>
        Эффект
        <select value={segment.effect} onChange={(e) => onChange({ effect: e.target.value as Effect })}>
          {EFFECTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Изображения-референсы
        <input type="file" accept="image/*" multiple onChange={(e) => addImages(e.target.files)} />
      </label>
      <div className="thumbs">
        {segment.images.map((img, i) => (
          <figure key={img.url}>
            <img src={img.url} alt={img.name} />
            <button onClick={() => onChange({ images: segment.images.filter((_, j) => j !== i) })}>✕</button>
          </figure>
        ))}
      </div>

      <div className="row">
        <button onClick={onExport} disabled={exporting}>
          Экспорт фрагмента в MP4
        </button>
        <button className="danger" onClick={onDelete}>
          Удалить правку
        </button>
      </div>
    </div>
  );
}
