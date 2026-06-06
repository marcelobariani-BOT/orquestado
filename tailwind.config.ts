import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens de marca — OKLCH referenciados como CSS vars
        bg: {
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          raised: "var(--bg-raised)",
          overlay: "var(--bg-overlay)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          inverse: "var(--text-inverse)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          "cyan-dim": "var(--accent-cyan-dim)",
          amber: "var(--accent-amber)",
          "amber-dim": "var(--accent-amber-dim)",
        },
        // Colores por servicio
        service: {
          mostrador: "var(--service-mostrador)",
          bots: "var(--service-bots)",
          llamadas: "var(--service-llamadas)",
          recepcion: "var(--service-recepcion)",
          turnos: "var(--service-turnos)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem,8vw,7rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(2.25rem,5vw,4.5rem)", { lineHeight: "0.97", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(1.75rem,3.5vw,3rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.25rem,2.5vw,2rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      spacing: {
        "section": "clamp(5rem, 12vw, 10rem)",
        "section-sm": "clamp(3rem, 8vw, 6rem)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        "grid": "linear-gradient(rgba(99,220,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,220,255,0.04) 1px, transparent 1px)",
        "radial-fade": "radial-gradient(ellipse at center, transparent 0%, oklch(8% 0.008 260) 70%)",
      },
      backgroundSize: {
        "grid": "60px 60px",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "quart-out": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
