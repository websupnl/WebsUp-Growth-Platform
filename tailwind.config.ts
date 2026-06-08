import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        // WebsUp brand
        ink: "#06040c",
        surface: {
          DEFAULT: "#0d0a16",
          raised: "#15101f",
          border: "#241c34",
        },
        brand: {
          orange: "#f97316",
          pink: "#ec4899",
          violet: "#a78bfa",
        },
        muted: "#9b93ad",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a78bfa 100%)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
