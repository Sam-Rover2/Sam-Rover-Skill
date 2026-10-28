export type Effect = 'title' | 'zoom' | 'shapes' | 'none';

export interface RefImage {
  name: string;
  url: string; // object URL in the browser
}

export interface Segment {
  id: string;
  start: number; // seconds
  end: number; // seconds
  prompt: string;
  effect: Effect;
  images: RefImage[];
}
