export const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  dark: false,
  accent: 'blue',
  density: 'regular',
  agentPlacement: 'panel',
} /*EDITMODE-END*/;

export const ACCENTS_BY_HEX = {
  '#2563eb': 'blue',
  '#0fae7e': 'emerald',
  '#6f6df0': 'indigo',
  '#d99238': 'amber',
  '#e25577': 'rose',
};

export const HEX_BY_ACCENT = Object.fromEntries(
  Object.entries(ACCENTS_BY_HEX).map(([h, k]) => [k, h])
);

// Each palette has light/dark variants for: [accent, accent-fg, accent-soft, ring].
export const ACCENTS = {
  blue: {
    name: 'Blue',
    light: ['0.55 0.20 255', '0.99 0.005 255', '0.95 0.04 255', '0.58 0.18 255'],
    dark:  ['0.72 0.16 255', '0.15 0.02 255',  '0.30 0.06 255', '0.72 0.16 255'],
  },
  emerald: {
    name: 'Emerald',
    light: ['0.62 0.13 165', '0.98 0.005 165', '0.95 0.04 165', '0.65 0.13 165'],
    dark:  ['0.7 0.14 165',  '0.16 0.02 165',  '0.28 0.05 165',  '0.7 0.14 165'],
  },
  indigo: {
    name: 'Indigo',
    light: ['0.5 0.18 268',  '0.985 0.005 268', '0.95 0.04 268', '0.55 0.18 268'],
    dark:  ['0.7 0.16 268',  '0.16 0.02 268',   '0.3 0.06 268',  '0.7 0.16 268'],
  },
  amber: {
    name: 'Amber',
    light: ['0.68 0.14 70', '0.16 0.02 70', '0.96 0.06 70', '0.7 0.14 70'],
    dark:  ['0.78 0.14 70', '0.16 0.02 70', '0.3 0.07 70',  '0.78 0.14 70'],
  },
  rose: {
    name: 'Rose',
    light: ['0.6 0.18 18', '0.98 0.005 18', '0.96 0.05 18', '0.6 0.18 18'],
    dark:  ['0.7 0.18 18', '0.16 0.02 18',  '0.3 0.07 18',  '0.7 0.18 18'],
  },
};
