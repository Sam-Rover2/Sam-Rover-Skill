// Every number here is a rule from ANIMATION_RULES.md. Change the rule first, then the number.

export const VIDEO = { width: 1920, height: 1080, fps: 30 };

/** Characters animate "on twos" (12–15 drawings/s) like TV cartoons; camera moves on ones. */
export const onTwos = (frame: number) => Math.floor(frame / 2) * 2;

export const LINE = {
  color: '#1b1b1f',
  /** Outline width in screen pixels at 1080p, constant regardless of distance. */
  width: 6,
  /** Thinner line for background props. */
  bgWidth: 4,
};

export const PALETTE = {
  ink: '#1b1b1f',
  // skins
  skinTan: '#c98b5a',
  skinBrown: '#b5652f',
  skinPeach: '#f2c9a0',
  blush: '#f08a8a',
  // clothes
  sweaterYellow: '#f2b233',
  hoodieTeal: '#2aa198',
  hairDark: '#2a2420',
  hairBrown: '#5a3a24',
  // set
  wallYellow: '#f0cf6e',
  wallYellowShade: '#d9b457',
  trimRed: '#c8553d',
  floorWood: '#b9804c',
  floorLine: '#8e5d33',
  skyTop: '#9cc9ef',
  skyBottom: '#d8ecfb',
  building: '#7fa9d6',
  buildingWindow: '#c8e1f7',
  desk: '#4b5568',
  deskTop: '#e9ecf2',
  monitor: '#2c2f38',
  screen: '#f7f9fc',
  bars: ['#e66b5b', '#f2b233', '#4a90d9', '#5cb85c'],
  plant: '#4f9d4a',
  pot: '#d97a4a',
  mug: '#e0573f',
};

export const CAPTION = {
  font: 'Fredoka',
  weight: 700,
  size: 84, // px at 1080p
  color: '#ffffff',
  stroke: '#1b1b1f',
  strokeWidth: 14, // px, drawn behind the fill
  bottom: 150, // px from the bottom edge
};
