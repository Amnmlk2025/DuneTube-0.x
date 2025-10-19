/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        vazirmatn: ["Vazirmatn", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        duneBlue: "#1E3A8A",
        duneSand: "#F5F5DC",
        duneOlive: "#556B2F",
        duneSky: "#87CEEB",
      },
    },
  },
  plugins: [],
}
