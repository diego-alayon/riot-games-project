import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Linear Design System tokens
        linear: {
          accent: "#5e6ad2",
          "accent-hover": "#828fff",
          "accent-focus": "#5e69d1",
          canvas: "#010102",
          surface: {
            1: "#0f1011",
            2: "#141516",
            3: "#18191a",
            4: "#191a1b",
          },
          hairline: {
            1: "#23252a",
            2: "#34343a",
            3: "#3e3e44",
          },
          text: {
            ink: "#f7f8f8",
            muted: "#d0d6e0",
            subtle: "#8a8f98",
            tertiary: "#62666d",
          },
          success: "#27a644",
        },
      },
      fontFamily: {
        display: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
        text: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Monaco", "Courier New", "monospace"],
      },
      letterSpacing: {
        "display-tight": "-3.0px",
        "display-normal": "-0.05px",
        "eyebrow": "0.4px",
      },
      borderRadius: {
        "linear-sm": "4px",
        "linear-base": "6px",
        "linear-md": "8px",
        "linear-lg": "12px",
        "linear-xl": "16px",
        "linear-2xl": "24px",
      },
      spacing: {
        "section": "96px",
      },
    },
  },
  plugins: [],
};
export default config;
