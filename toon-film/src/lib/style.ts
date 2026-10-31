// All style numbers live here (see ANIMATION_RULES.md). Change the rule first, then the number.

export const VIDEO = { width: 1920, height: 1080, fps: 120, seconds: 40 };

export const LINE = {
  color: '#1b1b1f',
  width: 6, // px at 1080p, characters and hero props
  bgWidth: 4, // px, background props
};

export const P = {
  ink: '#1b1b1f',
  white: '#f7f5f0',
  // skin
  skinTan: '#c98b5a',
  skinBrown: '#9a5a33',
  skinPeach: '#f2c9a0',
  skinLight: '#f6d7bd',
  blush: '#f08a8a',
  // hair
  hairDark: '#2a2420',
  hairBrown: '#5a3a24',
  hairAuburn: '#8a3b22',
  hairGrey: '#b9b9c2',
  // clothes
  yellow: '#f2b233',
  teal: '#2aa198',
  coral: '#ef7a5a',
  lilac: '#9b87d6',
  navy: '#34405e',
  green: '#5fa85a',
  apron: '#e9e1cf',
  shoe: '#3a3330',
  // set
  wallYellow: '#f0cf6e',
  wallCream: '#f3e6cc',
  wallMint: '#cfe6d6',
  wallBlue: '#cfdcef',
  trimRed: '#c8553d',
  trimGreen: '#3f8f73',
  wood: '#b9804c',
  woodDark: '#8e5d33',
  woodLight: '#d9a86c',
  tile: '#e8e2d6',
  steel: '#aab3c0',
  desk: '#4b5568',
  deskTop: '#e9ecf2',
  monitor: '#2c2f38',
  screen: '#f7f9fc',
  bars: ['#e66b5b', '#f2b233', '#4a90d9', '#5cb85c'],
  plant: '#4f9d4a',
  plantDark: '#3c7f3a',
  pot: '#d97a4a',
  red: '#e0573f',
  brick: '#c9714f',
  asphalt: '#5b5f6b',
  sidewalk: '#c7c3ba',
  grass: '#7cb85a',
  leafOrange: '#e98b3a',
  leafYellow: '#f2c14e',
  bark: '#7a5133',
  skyDawn: ['#f7c59f', '#f3a8a0', '#9fb6e0'] as const,
  skyDay: ['#d8ecfb', '#9cc9ef'] as const,
  skySunset: ['#ffd27a', '#f39a6b', '#b5719b'] as const,
  building: '#7fa9d6',
  buildingWindow: '#c8e1f7',
  lampGlow: '#fff2b8',
};

export const CAPTION = {
  font: 'Nunito',
  weight: 900,
  size: 78,
  color: '#ffffff',
  stroke: '#1b1b1f',
  strokeWidth: 14,
  bottom: 120,
};
