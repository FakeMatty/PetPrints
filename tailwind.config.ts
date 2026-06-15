import type { Config } from "tailwindcss";

// Phase 0 design tokens — the single source of truth for the brand.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: "#FAF7F2",
        ink: "#2E2E2E",
        terracotta: "#C57B57",
        sage: "#A6B89B",
        // Curated portrait background palette (Option C in the brief).
        bg: {
          bone: "#FAF7F2",
          charcoal: "#2E2E2E",
          sage: "#A6B89B",
          blush: "#E8C8C0",
          navy: "#2B3A55",
          mustard: "#D8A33B",
          terracotta: "#C57B57",
          dustyblue: "#8FA9C0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "18px",
        xl: "28px",
      },
      maxWidth: { content: "1120px" },
    },
  },
  plugins: [],
};

export default config;
