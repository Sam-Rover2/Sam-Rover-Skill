import { Config } from '@remotion/cli/config';

// Three.js needs WebGL. "angle" uses your GPU; set REMOTION_GL=swangle on machines without one.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'angle' | 'swangle') ?? 'angle');
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(16);
