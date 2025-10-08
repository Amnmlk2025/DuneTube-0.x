import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: "#0A355C",
          sand: "#E8DCC8",
          sky: "#6EC9E8",
          olive: "#A4A169",
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
