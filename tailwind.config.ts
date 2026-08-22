import type { Config } from "tailwindcss";

// Brand: "Ridgeline" — a sales pipeline is a path climbing toward a close.
// Palette avoids the generic cream+terracotta / near-black+neon defaults:
// cool paper background, deep ink navy, a gold summit accent, and a muted
// pine secondary tied to the ridgeline motif used across marketing pages.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3F4F1",
        ink: {
          DEFAULT: "#16203A",
          soft: "#333F5C",
        },
        gold: {
          DEFAULT: "#D6A244",
          soft: "#E8C784",
        },
        pine: {
          DEFAULT: "#3F6659",
          soft: "#6E8F82",
        },
        hairline: "#D8D6CD",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
