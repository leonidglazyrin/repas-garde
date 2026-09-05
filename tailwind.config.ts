/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-2": "hsl(var(--surface-2) / <alpha-value>)",
        offset: "hsl(var(--offset) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        divider: "hsl(var(--divider) / <alpha-value>)",
        text: "hsl(var(--text) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        faint: "hsl(var(--faint) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          hover: "hsl(var(--primary-hover) / <alpha-value>)",
          soft: "hsl(var(--primary-soft) / <alpha-value>)",
        },
        success: { DEFAULT: "hsl(var(--success) / <alpha-value>)", soft: "hsl(var(--success-soft) / <alpha-value>)" },
        warning: { DEFAULT: "hsl(var(--warning) / <alpha-value>)", soft: "hsl(var(--warning-soft) / <alpha-value>)" },
        danger: { DEFAULT: "hsl(var(--danger) / <alpha-value>)", soft: "hsl(var(--danger-soft) / <alpha-value>)" },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        sm: "calc(var(--radius) - 2px)",
        md: "calc(var(--radius))",
        lg: "calc(var(--radius) + 4px)",
        xl: "calc(var(--radius) + 8px)",
      },
    },
  },
  plugins: [],
};
export default config;
