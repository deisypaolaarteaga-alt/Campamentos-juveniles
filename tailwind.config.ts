import type { Config } from "tailwindcss";

const config: Config = {
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
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Paleta CJ — Contemporary Home × Ámbar colombiano
        cj: {
          teal:    "#0D2B2B",  /* selva profunda  */
          coral:   "#B83A2E",  /* rojo coral ladrillo */
          amber:   "#C67E1A",  /* ámbar dorado colombiano */
          cream:   "#EEE9E2",  /* pergamino cálido */
          texto:   "#0F1E1E",  /* negro teal orgánico */
        },
        // Sidebar
        sidebar: {
          DEFAULT: "#0D2B2B",
          hover:   "#163838",
          activo:  "#B83A2E",
        },
        // Niveles de formación — metáfora de crecimiento natural
        nivel: {
          campista: "#7A8C8C",  /* teal neutro — recién llegado   */
          semilla:  "#8B5A2B",  /* tierra cálida — semilla en suelo */
          raiz:     "#7A3C1E",  /* raíz profunda de tierra oscura  */
          tallo:    "#2D7048",  /* verde medio — tallo joven       */
          hoja:     "#1A5C35",  /* verde selva profundo            */
          flor:     "#2B5FA5",  /* azul cielo vibrante — flor      */
          fruto:    "#A87C1A",  /* dorado cosecha — fruto maduro   */
        },
        asistencia: {
          asistio: "#22c55e",
          no_asistio: "#ef4444",
          excusa: "#eab308",
          tarde: "#f97316",
          permiso: "#3b82f6",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.10)",
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
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
