import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'os-bg': '#0a0a0f',
        'os-phosphor': '#00ff88',
        'os-amber': '#ffb347',
        'os-chrome': '#c0bdb5',
        'os-chrome-light': '#d4d0c8',
        'os-chrome-dark': '#808080',
        'os-bevel-light': '#ffffff',
        'os-bevel-dark': '#404040',
      },
      fontFamily: {
        terminal: ['var(--font-vt323)', 'Courier New', 'monospace'],
        ui: ['var(--font-share-tech-mono)', 'Courier New', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
