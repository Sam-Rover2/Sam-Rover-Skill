import { registerRoot, staticFile } from 'remotion';
import { setModelUrlResolver } from './assets/Model';
import { Root } from './Root';

// models in public/models/ are served by Remotion through staticFile()
setModelUrlResolver((f) => staticFile(f));

registerRoot(Root);
