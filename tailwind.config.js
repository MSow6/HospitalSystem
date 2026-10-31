/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  // Preflight is disabled so Tailwind's reset does not override the existing
  // hand-written styles in components/*.css. Utilities are still available.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Primary brand ramp, anchored on the reception teal.
        brand: {
          50: "#f0faf9",
          100: "#d7f0ed",
          200: "#aee1db",
          300: "#7ecbc4",
          400: "#4caea7",
          500: "#2b9d9a",
          600: "#117c79",
          700: "#0e625f",
          800: "#0c4f4d",
          900: "#0a3f3e",
        },
        ink: "#193841",
        "ink-soft": "#2b4a52",
        muted: "#71868b",
        "muted-soft": "#8a9ba0",
        line: "#e5eceb",
        "line-soft": "#eef3f2",
        surface: "#f4f7f7",
        "surface-soft": "#f7fafa",
        sidebar: "#103641",
        "sidebar-active": "#1c5961",
        success: "#2e9e5b",
        warning: "#b9761a",
        danger: "#c0392b",
      },
      fontFamily: {
        sans: [
          '"DM Sans"',
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: ['"Manrope"', '"DM Sans"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        panel: "9px",
      },
      boxShadow: {
        panel: "0 2px 7px rgba(17, 55, 64, 0.025)",
        "panel-hover": "0 4px 12px rgba(17, 55, 64, 0.06)",
        control: "0 1px 2px rgba(25, 56, 65, 0.05)",
      },
      letterSpacing: {
        label: "0.08em",
      },
    },
  },
  plugins: [],
};
