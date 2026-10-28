import { Config } from '@remotion/cli/config';

// WebGL (Three.js) in headless Chrome needs the ANGLE renderer.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'angle' | 'swangle') ?? 'angle');
// Use a local Chrome when Remotion cannot download its own (e.g. offline/CI sandbox).
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
