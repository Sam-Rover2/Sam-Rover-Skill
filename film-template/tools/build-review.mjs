// Builds review/Согласование.html — one self-contained file (Three.js, React and models inside).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const models = {};
const dir = 'public/models';
if (fs.existsSync(dir))
  for (const f of fs.readdirSync(dir).filter((f) => /\.(glb|gltf)$/i.test(f)))
    models[`models/${f}`] = `data:model/gltf-binary;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}`;
fs.writeFileSync('viewer/models.generated.ts', `export const MODELS: Record<string, string> = ${JSON.stringify(models)};\n`);

const out = await build({
  entryPoints: ['viewer/main.tsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  write: false,
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
});
const js = out.outputFiles[0].text.replace(/<\/script>/g, '<\\/script>');
fs.mkdirSync('review', { recursive: true });
const html = fs.readFileSync('viewer/template.html', 'utf8').replace('<script>/*BUNDLE*/</script>', () => `<script>${js}</script>`);
fs.writeFileSync('review/Согласование.html', html);
console.log(`review/Согласование.html  ${(html.length / 1e6).toFixed(1)} MB, models: ${Object.keys(models).length}`);
