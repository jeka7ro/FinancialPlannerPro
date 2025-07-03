import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        radius: "hsl(var(--radius))",
        // macOS Monterey Signature Colors
        monterey: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#007AFF', // Primary Monterey Blue
          600: '#0056CC',
          700: '#004499',
          800: '#003377',
          900: '#002255',
        },
        montereyGray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626', // Dark background
          900: '#171717',
        },
        montereySuccess: '#34C759', // Green
        montereyWarning: '#FF9500', // Orange
        montereyError: '#FF3B30', // Red
        montereyPurple: '#5856D6', // Purple accent
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "monterey-glow": "montereyGlow 2s ease-in-out infinite alternate",
        "monterey-float": "montereyFloat 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        montereyGlow: {
          "0%": { 
            boxShadow: "0 0 20px rgba(0, 122, 255, 0.3)",
            transform: "scale(1)"
          },
          "100%": { 
            boxShadow: "0 0 30px rgba(0, 122, 255, 0.6)",
            transform: "scale(1.02)"
          },
        },
        montereyFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'monterey': '30px',
      },
      boxShadow: {
        'monterey': '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2)',
        'monterey-hover': '0 30px 60px rgba(0, 0, 0, 0.5), 0 12px 24px rgba(0, 0, 0, 0.3)',
        'monterey-glow': '0 0 20px rgba(0, 122, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config; 