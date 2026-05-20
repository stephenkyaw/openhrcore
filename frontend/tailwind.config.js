/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        bg:            'oklch(var(--bg) / <alpha-value>)',
        surface:       'oklch(var(--surface) / <alpha-value>)',
        fg:            'oklch(var(--fg) / <alpha-value>)',
        'fg-soft':     'oklch(var(--fg-soft) / <alpha-value>)',
        card:          'oklch(var(--card) / <alpha-value>)',
        elevated:      'oklch(var(--elevated) / <alpha-value>)',
        muted:         'oklch(var(--muted) / <alpha-value>)',
        'muted-fg':    'oklch(var(--muted-fg) / <alpha-value>)',
        subtle:        'oklch(var(--subtle) / <alpha-value>)',
        border:        'oklch(var(--border) / <alpha-value>)',
        'border-soft': 'oklch(var(--border-soft) / <alpha-value>)',
        ring:          'oklch(var(--ring) / <alpha-value>)',
        accent:        'oklch(var(--accent) / <alpha-value>)',
        'accent-fg':   'oklch(var(--accent-fg) / <alpha-value>)',
        'accent-soft': 'oklch(var(--accent-soft) / <alpha-value>)',
        danger:        'oklch(var(--danger) / <alpha-value>)',
        warn:          'oklch(var(--warn) / <alpha-value>)',
        ok:            'oklch(var(--ok) / <alpha-value>)',
        info:          'oklch(var(--info) / <alpha-value>)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        md:      'var(--radius)',
        lg:      'calc(var(--radius) + 2px)',
        xl:      'calc(var(--radius) + 6px)',
        '2xl':   'calc(var(--radius) + 10px)',
      },
    },
  },
  plugins: [],
};
