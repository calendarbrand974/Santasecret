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
        primary: "#0d7d4d",
        accent: "#dc2626",
        gold: "#ffd700",
        christmas: {
          red: "#c41e3a",
          green: "#0d7d4d",
          gold: "#ffd700",
        },
        dark: {
          bg: "#1a0a0a",
          surface: "#2d1414",
          border: "#3d1f1f",
        },
      },
    },
  },
  plugins: [],
};
export default config;

