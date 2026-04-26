/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ----- LegacyShield fiduciary palette -----
        // Brand
        ink: {
          DEFAULT: '#0E1A2B',
          deep:    '#08101C',
          soft:    '#1B2A40',
        },
        seal: {
          DEFAULT: '#A98545',
          soft:    '#C4A06B',
          deep:    '#7E6232',
        },
        bone: {
          DEFAULT: '#F6F2EA',
          soft:    '#FBF8F2',
          deep:    '#ECE6D8',
        },
        oak: {
          DEFAULT: '#6B5840',
          soft:    '#8A7659',
        },

        // Semantic — backed by CSS vars so dark mode "just works"
        bg:           'var(--bg)',
        'bg-raised':  'var(--bg-raised)',
        'bg-sunken':  'var(--bg-sunken)',
        'bg-inset':   'var(--bg-inset)',
        fg:           'var(--fg)',
        'fg-muted':   'var(--fg-muted)',
        'fg-subtle':  'var(--fg-subtle)',
        'fg-on-ink':  'var(--fg-on-ink)',
        'fg-on-gold': 'var(--fg-on-gold)',
        line:         'var(--line)',
        'line-strong':'var(--line-strong)',
        accent:       'var(--accent)',
        ok:           'var(--ok)',
        'ok-bg':      'var(--ok-bg)',
        warn:         'var(--warn)',
        'warn-bg':    'var(--warn-bg)',
        danger:       'var(--danger)',
        'danger-bg':  'var(--danger-bg)',
        info:         'var(--info)',
        'info-bg':    'var(--info-bg)',

        // ----- Legacy aliases -----
        // The Sentinel-era pages (2026.03) lean on these names; rather than
        // rewrite every file in this pass, we remap them to the new palette so
        // the visual cutover is uniform. Future: migrate consumers to ink/seal/bone.
        primary: {
          50:  '#FBF8F2', // bone-soft
          100: '#F6F2EA', // bone
          200: '#ECE6D8', // bone-deep
          300: '#DCD3BF', // hairline
          400: '#1B2A40', // ink-soft
          500: '#0E1A2B', // ink (canonical)
          600: '#0E1A2B',
          700: '#08101C',
          800: '#08101C',
          900: '#08101C', // ink-deep
          950: '#08101C',
        },
        navy: {
          50:  '#FBF8F2',
          100: '#F6F2EA',
          200: '#ECE6D8',
          300: '#DCD3BF',
          400: '#8A7659',
          500: '#6B5840',
          600: '#1B2A40',
          700: '#0E1A2B',
          800: '#08101C',
          900: '#08101C',
        },
        trust: {
          50:  '#E6EFE7',
          100: '#D1E1D4',
          200: '#A7C5AE',
          300: '#7DA888',
          400: '#5A8C68',
          500: '#2E6F4A',
          600: '#26593B',
          700: '#1F4A31',
          800: '#173B27',
          900: '#0F2C1D',
        },
        // Old "accent" (bright #d4af37) → muted seal gold
        'primary-container':       '#0E1A2B',
        'on-primary-container':    '#FBF8F2',
        'secondary-container':     '#A98545',
        'on-secondary-container':  '#08101C',
        'primary-fixed-dim':       '#C4A06B',
        // Surface aliases for any leftover Sentinel call sites
        surface:                       'var(--bg)',
        'surface-bright':              'var(--bg-raised)',
        'surface-dim':                 'var(--bg-inset)',
        'on-surface':                  'var(--fg)',
        'on-surface-variant':          'var(--fg-muted)',
        'surface-container':           'var(--bg-sunken)',
        'surface-container-low':       'var(--bg-sunken)',
        'surface-container-high':      'var(--bg-inset)',
        'surface-container-lowest':    'var(--bg-raised)',
        'surface-container-highest':   'var(--bg-inset)',
        'outline-variant':             'var(--line)',
        outline:                       'var(--line-strong)',
        'inverse-surface':             '#0E1A2B',
      },
      fontFamily: {
        sans:    ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono:    ['var(--font-mono)'],
      },
      borderRadius: {
        xs:  '2px',
        sm:  '3px',
        md:  '4px',
        lg:  '6px',
        xl:  '10px',
      },
      boxShadow: {
        '1': 'var(--shadow-1)',
        '2': 'var(--shadow-2)',
        '3': 'var(--shadow-3)',
        '4': 'var(--shadow-4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
