import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,components}/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      sm: "800px",
      md: "960px",
      lg: "1120px",
      xl: "1280px",
    },
    container: {
      center: true,
    },
    colors: {
      "blue": "#22454c",
      "green": "#749c4e",
      "orange": "#d58638",
      "red": "#db2024",
      "red-dark": "#981618",
      "yellow": "#ddd065",

      "black": "#000000",

      "gray": "#333738",
      "gray-dark": "#222525",
      "gray-light": "#464d4e",

      "white": "#dadddd",
      "white-bright": "#f4f5f5",
      "white-dim": "#abb7b7",
    },

    fontFamily: {
      serif: ["Roboto Slab", "ui-serif", "serif"],
      mono: ["Cascadia Mono", "ui-monospace", "monospace"],
    },
  },
} satisfies Config;
