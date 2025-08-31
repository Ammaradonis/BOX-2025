/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // SF Boxing Club Brand Palette
        "fog-gray": "#5D6D7E",
        "golden-gate-red": "#D92229",
        "california-gold": "#FDB515",
        "sf-black": "#000000",
        "sf-white": "#FAFAFA",
        "fog-light": "#8FA8B4",
        "sunset-orange": "#FF6B35",
        "bay-blue": "#003f5c",

        // Semantic Colors
        primary: {
          DEFAULT: "#DC2626", // Boxing energy red
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1F2937", // Neutral dark
          foreground: "#F3F4F6",
        },
        accent: {
          DEFAULT: "#FBBF24", // Gold highlights
          foreground: "#1F2937",
        },
        muted: {
          DEFAULT: "#6B7280",
          foreground: "#D1D5DB",
        },
        card: {
          DEFAULT: "#111827",
          foreground: "#F9FAFB",
        },
        destructive: {
          DEFAULT: "#B91C1C",
          foreground: "#FFFFFF",
        },
        border: "#e2e8f0",
        ring: "#3B82F6",
        background: "#f8fafc",
        foreground: "#1e293b",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      fontSize: {
        base: "1.25rem", // 20px
        sm: "0.875rem", // 14px
        lg: "1.5rem", // 24px
        xl: "2rem", // 32px
        "2xl": "2.5rem", // 40px
        "3xl": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
      },

      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
      },

      boxShadow: {
        soft: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        medium:
          "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        hard: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
      },

      backgroundImage: {
        "sf-gradient": "linear-gradient(135deg, #5D6D7E 0%, #003f5c 100%)",
        "golden-gate-gradient":
          "linear-gradient(45deg, #D92229 0%, #FF6B35 100%)",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  safelist: [
    "bg-transparent",
    "text-black",
    "shadow-none",
    "border",
    "border-black",
  ],
  plugins: [
    function ({ addComponents, addUtilities }) {
      addComponents({
        ".btn": {
          "@apply px-4 py-2 rounded-lg font-medium transition-colors": {},
        },
        ".btn-primary": {
          "@apply bg-golden-gate-red text-white hover:bg-red-700": {},
        },
        ".btn-secondary": {
          "@apply bg-gray-200 text-gray-900 hover:bg-gray-300": {},
        },
        ".card": {
          "@apply bg-white rounded-xl shadow-lg p-6": {},
        },
      });

      addUtilities({
        ".sf-grid": { display: "grid", gap: "1.5rem" },
        ".sf-grid-2": { "@apply grid-cols-1 sm:grid-cols-2": {} },
        ".sf-grid-3": { "@apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-3": {} },
        ".sf-grid-4": { "@apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-4": {} },
      });
    },
  ],
};
