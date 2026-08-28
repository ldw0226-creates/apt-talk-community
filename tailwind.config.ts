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
        kakao: {
          yellow: "#FEE500",
          yellowHover: "#FADA0A",
          brown: "#3A1D1D",
          lightBrown: "#5c3c3c",
          chatBg: "#B2C7D9",
          myBubble: "#FEE500",
          otherBubble: "#FFFFFF",
          bg: "#ECEFF1",
        },
        apt: {
          primary: "#1E3A8A",
          secondary: "#0D9488",
          accent: "#F59E0B",
          dark: "#0F172A",
          card: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
