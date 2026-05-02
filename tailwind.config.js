/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        soil: { 50: "#fdf6ee", 100: "#f9e9d4", 200: "#f2cfa3", 300: "#e9ae6a", 400: "#e08b3a", 500: "#d56e1d", 600: "#c05718", 700: "#9e4118", 800: "#82371b", 900: "#6b2f18" },
        leaf: { 50: "#f0fdf0", 100: "#dcfcdc", 200: "#baf7bb", 300: "#86ef88", 400: "#4ade52", 500: "#22c528", 600: "#16a31c", 700: "#15801a", 800: "#166519", 900: "#145318" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
