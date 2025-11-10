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
        accent: "#c41e3a",
        christmas: {
          red: "#c41e3a",
          green: "#0d7d4d",
        },
        dark: {
          bg: "#c41e3a",
          surface: "rgba(196, 30, 58, 0.95)",
          border: "rgba(13, 125, 77, 0.6)",
        },
      },
    },
  },
  plugins: [],
};
export default config;

