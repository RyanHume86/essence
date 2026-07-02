/** @type {import('tailwindcss').Config} */
//
// Dark-only deep-sea-blue theme. There is NO light theme and NO `dark:` variant
// switching — the whole app renders one dark palette (see src/index.css).
//
// Three scales (light→dark, Tailwind convention):
//   seablue  — structure: backgrounds, surfaces, borders. Recedes.
//   teal     — the single accent: actions, links, active states, key data. Advances.
//   success  — semantic success ONLY, never decorative.
//
// The shadcn semantic tokens (background, card, primary, …) are kept so the
// component library resolves, but their values now point at this palette.
module.exports = {
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			// ── Structure scale — Deep-Sea raw values, kept FIXED (not per-scheme). ──
  			// Barely used directly; prefer the semantic tokens below, which theme.
  			seablue: {
  				50: '#014c75', 100: '#014368', 200: '#013b5b', 300: '#01324e', 400: '#012a41',
  				500: '#002234', 600: '#001927', 700: '#00111a', 800: '#00080d', 900: '#000000',
  			},
  			// ── Accent scale — Deep-Sea raw values, FIXED. Prefer `primary`/`highlight`. ──
  			teal: {
  				50: '#69c4d2', 100: '#3cb0b0', 200: '#00a1a1', 300: '#008080', 400: '#005757', 500: '#003636',
  			},
  			// ── Success — DEFAULT is scheme-reactive (completion green per scheme);
  			//    numeric shades stay fixed Deep-Sea values. `text-success` → DEFAULT. ──
  			success: {
  				DEFAULT: 'rgb(var(--success) / <alpha-value>)',
  				50: '#7EB5A1', 100: '#4B8C7A', 200: '#2D6D54', 300: '#1E4B3A', 400: '#0F3A28',
  			},

  			// ── Semantic aliases (use these in markup) — all scheme-reactive via
  			//    CSS custom properties swapped by the root `data-scheme` attribute.
  			//    Channel form `rgb(var(--x) / <alpha-value>)` keeps /opacity utilities working.
  			background: 'rgb(var(--background) / <alpha-value>)',
  			'background-deep': 'rgb(var(--background-deep) / <alpha-value>)',
  			foreground: 'rgb(var(--foreground) / <alpha-value>)',
  			surface: 'rgb(var(--surface) / <alpha-value>)',
  			'surface-hover': 'rgb(var(--surface-hover) / <alpha-value>)',
  			highlight: 'rgb(var(--highlight) / <alpha-value>)',      // links / active / focus (per-scheme)
  			'primary-hover': 'rgb(var(--accent-hover) / <alpha-value>)',

  			// ── Low-saturation category tints (decorative + dormant, no v1 UI) — FIXED. ──
  			category: {
  				work: '#9fb6d0',     // slate-blue
  				personal: '#6cc0c0', // teal
  				health: '#9ec3ab',   // sage
  				shopping: '#d4bd8f', // muted sand
  				other: '#c4a8c2',    // mauve
  			},

  			// ── shadcn semantic tokens, mapped onto the per-scheme CSS vars ──
  			card:      { DEFAULT: 'rgb(var(--surface) / <alpha-value>)', foreground: 'rgb(var(--foreground) / <alpha-value>)' },
  			popover:   { DEFAULT: 'rgb(var(--surface) / <alpha-value>)', foreground: 'rgb(var(--foreground) / <alpha-value>)' },
  			primary:   { DEFAULT: 'rgb(var(--accent) / <alpha-value>)', foreground: 'rgb(var(--accent-fg) / <alpha-value>)' }, // single accent
  			secondary: { DEFAULT: 'rgb(var(--surface-hover) / <alpha-value>)', foreground: 'rgb(var(--foreground) / <alpha-value>)' }, // secondary surface
  			muted:     { DEFAULT: 'rgb(var(--muted) / <alpha-value>)', foreground: 'rgb(var(--foreground) / 0.7)' }, // quiet recessed fill; muted text = fg @70%
  			accent:    { DEFAULT: 'rgb(var(--surface-hover) / <alpha-value>)', foreground: 'rgb(var(--foreground) / <alpha-value>)' }, // shadcn hover-surface (NOT brand accent)
  			destructive: { DEFAULT: '#e85d6e', foreground: '#ffffff' }, // FIXED — single exception (Delete-Account label; never in the task loop)
  			border: 'rgb(var(--border) / <alpha-value>)',
  			input: 'rgb(var(--border) / <alpha-value>)',
  			ring: 'rgb(var(--highlight) / <alpha-value>)',           // highlight — focus rings
  			chart: {
  				'1': '#008080', // teal-300
  				'2': '#69c4d2', // teal-50
  				'3': '#2D6D54', // success-200
  				'4': '#014c75', // seablue-50
  				'5': '#3cb0b0', // teal-100
  			},
  			sidebar: {
  				DEFAULT: '#00080d',            // background-deep
  				foreground: '#ffffff',
  				primary: '#008080',            // teal-300
  				'primary-foreground': '#ffffff',
  				accent: '#013b5b',             // surface-hover
  				'accent-foreground': '#ffffff',
  				border: '#002234',             // seablue-500
  				ring: '#69c4d2',               // highlight
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
