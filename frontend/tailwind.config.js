/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0f766e",
          dark: "#115e59",
          light: "#5eead4",
        },
        sand: "#f5deb3",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "Tahoma", "sans-serif"],
      },
    },
  },
  plugins: [],
}
