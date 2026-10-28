import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { buildTrimArgs } from './time';

// Free FFmpeg compiled to WebAssembly, downloaded once from a public CDN.
const CORE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';

let instance: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (!instance) {
    const ff = new FFmpeg();
    await ff.load({
      coreURL: await toBlobURL(`${CORE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    instance = ff;
  }
  return instance;
}

/** Cut [start, end] out of the uploaded file and return an MP4 blob. */
export async function trimVideo(
  file: File,
  start: number,
  end: number,
  onProgress?: (ratio: number) => void,
  onLog?: (msg: string) => void,
): Promise<Blob> {
  const ff = await getFFmpeg();
  const progress = ({ progress }: { progress: number }) => onProgress?.(Math.min(1, Math.max(0, progress)));
  const log = ({ message }: { message: string }) => onLog?.(message);
  ff.on('progress', progress);
  ff.on('log', log);
  try {
    await ff.writeFile('input.mp4', await fetchFile(file));
    await ff.exec(buildTrimArgs(start, end));
    const data = await ff.readFile('output.mp4');
    return new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });
  } finally {
    ff.off('progress', progress);
    ff.off('log', log);
  }
}
