/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#22c55e",
        danger: "#ef4444",
        bgDark: "#0f172a",
        cardDark: "#1e293b"
      }
    },
  },
  plugins: [],
}