import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: "#0A355C", // Deep Blue (main)
          sand: "#E8DCC8", // Base Sand (calm, neutral)
          sandAcc: "#D6C3A1", // Accent Sand (hover/secondary)
          sky: "#6EC9E8", // Optional highlight
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 2px 14px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
