/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "primary-1": "#2dd4bf",
        "primary-2": "#4cedd9",
        "secondary-1": "#0f172a",
        "secondary-2": "#1e293b",
        "secondary-3": "#334155",
        "secondary-4": "#94a3b8",
      },
    },
  },
  plugins: [],
};
