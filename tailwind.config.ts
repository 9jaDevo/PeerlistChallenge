import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#7C3AED",
        ink: "#0F172A", 
        subtle: "#8E8EA0",
        surface: "#0B1020",
        accent: "#06B6D4",
        ok: "#22C55E",
        warn: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '20px',
        'xl': '20px',
        '2xl': '20px',
        '3xl': '20px',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 16px -4px rgba(0, 0, 0, 0.1)',
        'brand': '0 4px 12px -2px rgba(124, 58, 237, 0.25)',
      },
      scale: {
        '102': '1.02',
      }
    },
  },
  plugins: [],
} satisfies Config;
