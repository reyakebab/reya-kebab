import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kebab: {
          bg: "#0b0e13",
          card: "rgba(255,255,255,0.04)",
          ring: "rgba(255,255,255,0.12)"
        }
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.25)"
      }
    },
  },
  plugins: [],
};
export default config;
