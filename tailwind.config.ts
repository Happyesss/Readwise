import type { Config } from "tailwindcss";

const config = {
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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        opendyslexic: ['OpenDyslexic', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
        comicneue: ['Comic Neue', 'cursive'],
      },
      letterSpacing: {
        'dyslexia-tight': '0.05em',
        'dyslexia': '0.12em',
        'dyslexia-relaxed': '0.18em',
        'dyslexia-loose': '0.25em',
      },
      lineHeight: {
        'dyslexia-tight': '1.3',
        'dyslexia': '1.5',
        'dyslexia-relaxed': '1.8',
        'dyslexia-loose': '2.0',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Dyslexia-friendly color themes
        dyslexia: {
          cream: {
            bg: '#FFF8DC',
            text: '#000000',
            accent: '#4A90E2',
          },
          green: {
            bg: '#E7F4E4',
            text: '#1A1A1A',
            accent: '#2ECC71',
          },
          blue: {
            bg: '#E0F2F7',
            text: '#000033',
            accent: '#3498DB',
          },
          gray: {
            bg: '#F5F5F5',
            text: '#333333',
            accent: '#9B59B6',
          },
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
