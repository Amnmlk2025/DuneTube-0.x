/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0A355C",
          dark: "#072746",
          light: "#144B80",
        },
        secondary: {
          DEFAULT: "#E8DCC8",
          dark: "#D2C1A1",
          light: "#F2EAD9",
        },
        sand: "#E8DCC8",
      },
      fontFamily: {
        sans: ["Poppins", "Vazirmatn", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
