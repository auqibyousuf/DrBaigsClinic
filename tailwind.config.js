/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // 2026 health-tech indigo — vivid, saturated, distinctly modern (not the
        // generic Tailwind "sky" blue, and not the safe teal we tried before).
        // `DEFAULT`/`foreground` (used as bare `bg-primary` etc. by shadcn/ui
        // components) sit alongside our own numbered scale (`bg-primary-600`)
        // in the same object — both resolve from the same CSS variables
        // defined in :root / .dark in app/globals.css.
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          50: '#eef0ff',
          100: '#e0e4ff',
          200: '#c6ccff',
          300: '#a3aaff',
          400: '#7c7ff5',
          500: '#5b5fe6',
          600: '#4640d0',
          700: '#3730a8',
          800: '#2d2a86',
          900: '#25236b',
          950: '#17153f',
        },
        // Fresh mint/emerald — the "health" half of the pairing, used for
        // secondary CTAs and highlights only, never as a competing dominant color.
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b77f',
          600: '#059666',
          700: '#047850',
          800: '#065f43',
          900: '#054e38',
        },
        // shadcn/ui semantic tokens — bridge to the CSS variables in
        // app/globals.css (:root / .dark), needed because our tailwind.config.js
        // is loaded via Tailwind v4's `@config` compatibility directive rather
        // than v4's native `@theme` CSS block.
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: '#ffffff' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        // Bridges shadcn's `--radius` variable (app/globals.css) to the
        // `rounded-*` sizes its generated components use.
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      boxShadow: {
        // Governed 3-tier elevation scale, tinted to the new primary — used
        // everywhere instead of ad hoc shadow-*.
        rest: '0 1px 3px 0 rgb(37 35 107 / 0.08), 0 1px 2px -1px rgb(37 35 107 / 0.08)',
        hover: '0 8px 20px -4px rgb(37 35 107 / 0.18), 0 4px 8px -4px rgb(37 35 107 / 0.12)',
        elevated: '0 20px 40px -8px rgb(37 35 107 / 0.22), 0 8px 16px -8px rgb(37 35 107 / 0.14)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

