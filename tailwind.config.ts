import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // ¡Crítico para que nuestro fondo oscuro funcione!
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-orbitron)'],
      },
      colors: {
        neon: {
          cyan: '#00f0ff',
          pink: '#ff003c',
          purple: '#7000ff',
          green: '#39ff14'
        },
        dark: {
          900: '#0a0a0c',
          800: '#121216',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00f0ff, 0 0 20px #00f0ff',
        'neon-pink': '0 0 10px #ff003c, 0 0 20px #ff003c',
      }
    },
  },
  plugins: [],
};

export default config;