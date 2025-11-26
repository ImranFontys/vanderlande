/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#ffffff",
        text: "#0f172a",
        muted: "#6b7280",
        accent: "#ff7a1a",
        accent2: "#f43f5e",
        accentDark: "#d61f69",
        success: "#2e7d32",
        warn: "#f59e0b",
        danger: "#dc2626",
      },
      boxShadow: {
        glass: "0 20px 60px rgba(15, 23, 42, 0.12)",
        soft: "0 12px 32px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        xl2: "18px"
      },
      fontFamily: {
        sans: ['"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
};
