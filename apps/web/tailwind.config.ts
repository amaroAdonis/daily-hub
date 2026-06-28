import type { Config } from 'tailwindcss';

// Tokens de design do Daily Hub — ver /docs/design-system.md.
// Cores são lidas de CSS variables (definidas em src/styles/index.css)
// para permitir tema claro/escuro na Fase 8.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem' },
      // Elevação sutil e fria, alinhada à direção "luz do dia, foco calmo".
      boxShadow: {
        card: '0 1px 2px 0 rgb(26 28 35 / 0.04), 0 1px 3px 0 rgb(26 28 35 / 0.06)',
        'card-hover': '0 4px 12px -2px rgb(26 28 35 / 0.10), 0 2px 6px -2px rgb(26 28 35 / 0.06)',
        drawer: '-8px 0 32px -8px rgb(26 28 35 / 0.18)',
        pop: '0 8px 28px -6px rgb(26 28 35 / 0.18)',
      },
      transitionTimingFunction: {
        // Easing padrão das microinterações (entrada suave, saída rápida).
        snappy: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 220ms cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
