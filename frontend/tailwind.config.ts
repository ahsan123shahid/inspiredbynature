import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        canvas: "#ffffff",
        "canvas-cream": "#faf7f2",
        primary: "#e8613a",
        "primary-dark": "#c94f2c",
        "on-primary": "#ffffff",
        "surface-maroon": "#4a201f",
        "surface-maroon-elevated": "#5c2b26",
        "accent-pink-bar": "#f2a8b8",
        "accent-blush": "#f6d9c9",
        "shade-20": "#e5e5e5",
        "shade-30": "#d4d4d4",
        "shade-40": "#a3a3a3",
        "shade-50": "#767676",
        "shade-60": "#525252",
        hairline: "#e8e8e8",
        "success-green": "#1e7d32",
        "link-slate": "#5c6b7a",
        "price-strike": "#9a9a9a",
      },
      fontFamily: {
        sans: ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "16px",
        pill: "9999px",
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        xxl: "32px",
        huge: "64px",
      },
    },
  },
  plugins: [],
};

export default config;
