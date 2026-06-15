/**
 * =====================================================
 * إعداد Tailwind CSS
 * يعتمد على CSS Variables القادمة من نظام الثيم المركزي
 * =====================================================
 */

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/shared/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        app: {
          background: "hsl(var(--color-background))",
          surface: "hsl(var(--color-surface))",
          surfaceElevated: "hsl(var(--color-surface-elevated))",
          foreground: "hsl(var(--color-foreground))",
          muted: "hsl(var(--color-muted))",
          primary: "hsl(var(--color-primary))",
          primaryForeground: "hsl(var(--color-primary-foreground))",
          accent: "hsl(var(--color-accent))",
          border: "hsl(var(--color-border))",
          success: "hsl(var(--color-success))",
          warning: "hsl(var(--color-warning))",
          danger: "hsl(var(--color-danger))"
        }
      },
      borderRadius: {
        appSm: "var(--radius-sm)",
        appMd: "var(--radius-md)",
        appLg: "var(--radius-lg)",
        appXl: "var(--radius-xl)"
      },
      boxShadow: {
        appCard: "var(--shadow-card)",
        appGlow: "var(--shadow-glow)"
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "sans-serif"],
        latin: ["var(--font-latin)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
