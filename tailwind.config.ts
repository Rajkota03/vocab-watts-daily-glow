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
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#1E88FF', // spark blue
          light: '#EDF4FF',   // light primary background
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: '#FFB300', // spark yellow
          foreground: '#0D1A2E' // dark color for contrast
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        dark: '#0D1A2E',
        stroke: '#E5EAF2',     // 1px borders
        surface: '#FFFFFF',    // card/panel background
        success: '#2ECC71',    // success notices
        dark: '#0D1A2E',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // GLINTUP Theme Colors - Consistent palette
        'glintup-indigo': '#3F3D56', // Primary Brand Color
        'glintup-mint': '#2DCDA5',   // Accent Color 
        'glintup-coral': '#FF6B6B',  // Action/CTA Color
        'glintup-bg': '#F7F8FE',     // Background Color
        'glintup-text': '#2F2F2F',   // Text Primary
        // Keep these for backward compatibility with renamed variables
        'vuilder-indigo': '#3F3D56',
        'vuilder-yellow': '#FFD60A',
        'vuilder-mint': '#2DCDA5',
        'vuilder-coral': '#FF6B6B',
        'vuilder-bg': '#F7F8FE',
        'vuilder-text': '#2F2F2F',
        'vocab-teal': '#2DCDA5',
        'vocab-yellow': '#FFD60A',
        'vocab-purple': '#3F3D56',
        'vocab-red': '#FF6B6B',
        'whatsapp-green': '#25D366',
        'whatsapp-light': '#DCF8C6',
        // Duolingo inspired colors
        'duolingo-green': '#58CC02',
        'duolingo-purple': '#7D41E1', 
        'duolingo-blue': '#1CB0F6',
        'duolingo-red': '#FF4B4B',
        'duolingo-orange': '#FF9600',
        'duolingo-yellow': '#FFC800',
        'loom-purple': '#625DF5',
        'loom-blue': '#00C9DF',
        'loom-pink': '#F35FF3',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      padding: {
        'section': {
          DEFAULT: '2.5rem', // Reduced from 3rem to 40px for desktop
          'mobile': '1.5rem', // Reduced from 2rem to 24px for mobile
        }
      },
      spacing: {
        'safe-x': 'clamp(1rem, 4vw, 4rem)',   // 16px to 64px
        'safe-y': 'clamp(1.5rem, 5vh, 4rem)', // 24px to 64px
      },
      maxWidth: {
        'dashboard-card': '720px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-light': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-light': 'pulse-light 2s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
