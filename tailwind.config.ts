import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem", // Adjusted padding for mobile-first
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"], // Keep Poppins for headings
      },
      spacing: {
        "safe-x": "clamp(1rem, 4vw, 4rem)", // Adjusted for mobile
        "safe-y": "clamp(1.5rem, 5vh, 4rem)", // Adjusted for mobile
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", // Default: #FFFFFF / #030711
        foreground: "hsl(var(--foreground))", // Default: #030711 / #F9FAFB
        
        // New Mobile-First Theme inspired by Pinterest reference
        primary: {
          DEFAULT: "#7A5CFA", // Vibrant Purple
          light: "#F3F0FF",   // Lighter purple for backgrounds/subtle elements
          foreground: "#FFFFFF", // White text on primary color
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Default: #F3F4F6 / #1F2937
          foreground: "hsl(var(--secondary-foreground))", // Default: #6B7280 / #D1D5DB
        },
        accent: {
          DEFAULT: "#58CC02", // Vibrant Green (from Duolingo palette)
          light: "#ECFEE6",   // Lighter green
          foreground: "#1A4D00", // Dark green text for contrast on light green
        },
        card_purple: "#9B84FF",
        card_red: "#FF7F50", // Coral-like red/orange
        card_yellow: "#FFC800", // Duolingo yellow
        card_green: "#58CC02", // Duolingo green
        card_blue: "#1CB0F6", // Duolingo blue

        // Standard UI colors
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // Default: #EF4444 / #B91C1C
          foreground: "hsl(var(--destructive-foreground))", // Default: #F9FAFB / #F9FAFB
        },
        muted: {
          DEFAULT: "hsl(var(--muted))", // Default: #F3F4F6 / #1F2937
          foreground: "hsl(var(--muted-foreground))", // Default: #6B7280 / #9CA3AF
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))", // Default: #FFFFFF / #0B111E
          foreground: "hsl(var(--card-foreground))", // Default: #030711 / #F9FAFB
        },

        // Keep existing colors for potential reference or specific uses
        "glintup-indigo": "#3F3D56",
        "glintup-mint": "#2DCDA5",
        "glintup-coral": "#FF6B6B",
        "glintup-bg": "#F7F8FE",
        "glintup-text": "#2F2F2F",
        "whatsapp-green": "#25D366",
        "whatsapp-light": "#DCF8C6",
      },
      borderRadius: {
        lg: "var(--radius)", // Default: 0.75rem
        md: "calc(var(--radius) - 4px)", // Adjusted for consistency
        sm: "calc(var(--radius) - 8px)", // Adjusted for consistency
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Add subtle animations later if needed
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

