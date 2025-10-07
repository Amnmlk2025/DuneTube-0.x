/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          night: "#0F172A",
          dune: "#16213E",
          ember: "#B7312C",
          gold: "#FACC15",
          sand: "#C9A66B",
          oasis: "#1E90FF",
        },
        surface: {
          DEFAULT: "#111827",
          subtle: "#1F2937",
          lifted: "#27334B",
          hover: "#2F3D57",
        },
      },
      fontFamily: {
        sans: ["Inter", "Vazirmatn", "Cairo", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-gold": "0 0 0 1px rgba(250, 204, 21, 0.45), 0 12px 35px -18px rgba(250, 204, 21, 0.5)",
      },
      backgroundImage: {
        "dune-radial": "radial-gradient(circle at top, rgba(201, 166, 107, 0.35), transparent 55%)",
        "dune-angular": "conic-gradient(from 180deg at 50% 50%, rgba(22, 33, 62, 0.6), rgba(15, 23, 42, 0.9))",
      },
      transitionTimingFunction: {
        "swift-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
