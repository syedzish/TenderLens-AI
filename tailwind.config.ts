import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101214",
        graphite: "#283038",
        mist: "#e8eee9",
        paper: "#f5f1e8",
        line: "#d7dfda",
        teal: "#087b78",
        cobalt: "#285ed8",
        amber: "#bd750f",
        danger: "#b42318",
      },
      boxShadow: {
        soft: "0 18px 48px rgba(16, 18, 20, 0.10)",
        table: "0 10px 28px rgba(16, 18, 20, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
