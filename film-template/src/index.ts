import { continueRender, delayRender, registerRoot, staticFile } from 'remotion';
import { setModelLoadHold, setModelUrlResolver } from './assets/Model';
import { Root } from './Root';

// models in public/models/ are served by Remotion through staticFile()
setModelUrlResolver((f) => staticFile(f));
// a frame is not captured until every model on it has loaded
setModelLoadHold((label) => {
  const h = delayRender(label);
  let done = false;
  return () => {
    if (!done) {
      done = true;
      continueRender(h);
    }
  };
});

registerRoot(Root);
