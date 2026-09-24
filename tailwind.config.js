/** Tailwind is used for layout utilities only. All colours, radii and fonts
 *  come from CSS variables in src/styles/tokens.css so a redesign only needs
 *  to touch that file (and components). */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        'accent-contrast': 'var(--color-accent-contrast)',
        success: 'var(--color-success)',
        'success-soft': 'var(--color-success-soft)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        pr: 'var(--color-pr)',
        warmup: 'var(--color-warmup)',
        drop: 'var(--color-drop)',
        failure: 'var(--color-failure)',
        ss1: 'var(--color-superset-1)',
        ss2: 'var(--color-superset-2)',
        ss3: 'var(--color-superset-3)',
        ss4: 'var(--color-superset-4)',
      },
      borderRadius: { DEFAULT: 'var(--radius)', lg: 'var(--radius-lg)' },
      fontFamily: { sans: 'var(--font-sans)' },
    },
  },
  plugins: [],
};
