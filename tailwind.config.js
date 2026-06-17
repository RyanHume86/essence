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
  			// ── Structure scale — backgrounds, surfaces, borders. Recedes. ──
  			seablue: {
  				50: '#014c75', 100: '#014368', 200: '#013b5b', 300: '#01324e', 400: '#012a41',
  				500: '#002234', 600: '#001927', 700: '#00111a', 800: '#00080d', 900: '#000000',
  			},
  			// ── Accent scale — the single accent. Advances. Keep to ~10% of a screen. ──
  			teal: {
  				50: '#69c4d2', 100: '#3cb0b0', 200: '#00a1a1', 300: '#008080', 400: '#005757', 500: '#003636',
  			},
  			// ── Success — semantic only. DEFAULT (bg-success) === success-200. ──
  			success: {
  				DEFAULT: '#2D6D54',
  				50: '#7EB5A1', 100: '#4B8C7A', 200: '#2D6D54', 300: '#1E4B3A', 400: '#0F3A28',
  			},

  			// ── Semantic aliases (use these in markup) ──
  			// Structural values are lifted off the raw seablue scale to give
  			// cards real elevation against the background (lightness, not hue).
  			background: '#04141f',            // page background (lifted from seablue-700)
  			'background-deep': '#00080d',     // seablue-800
  			foreground: '#ffffff',            // near-white text on dark surfaces
  			surface: '#0a3450',               // elevated surface (lifted)
  			'surface-hover': '#114660',       // surface hover (lifted)
  			highlight: '#69c4d2',             // teal-50 — links / active / focus / key numeric data
  			'primary-hover': '#00a1a1',       // teal-200

  			// ── Low-saturation category tints (decorative, kept quiet) ──
  			category: {
  				work: '#9fb6d0',     // slate-blue
  				personal: '#6cc0c0', // teal
  				health: '#9ec3ab',   // sage
  				shopping: '#d4bd8f', // muted sand
  				other: '#c4a8c2',    // mauve
  			},

  			// ── shadcn semantic tokens, mapped onto the palette ──
  			card:      { DEFAULT: '#0a3450', foreground: '#ffffff' }, // surface (lifted)
  			popover:   { DEFAULT: '#0a3450', foreground: '#ffffff' }, // surface (lifted)
  			primary:   { DEFAULT: '#008080', foreground: '#ffffff' }, // teal-300 (single accent)
  			secondary: { DEFAULT: '#014c75', foreground: '#ffffff' }, // seablue-50 — demoted old accent, now a secondary surface
  			muted:     { DEFAULT: '#001927', foreground: 'rgb(255 255 255 / 0.7)' }, // seablue-600 + muted text = white @70%
  			accent:    { DEFAULT: '#114660', foreground: '#ffffff' }, // surface-hover — hover via lightness, not hue
  			destructive: { DEFAULT: '#d9485a', foreground: '#ffffff' }, // red danger; white label on the button
  			border: '#0a3a52',                // lifted so card edges read against background
  			input: '#0a3a52',
  			ring: '#69c4d2',                  // highlight — focus rings
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
