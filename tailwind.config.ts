import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', "system-ui", "sans-serif"],
      },
      colors: {
        sprunki: {
          bg: "#0f0a1e",
          panel: "#1c1436",
          accent: "#ff5db1",
          accent2: "#4ad9ff",
          lime: "#b6ff5d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
