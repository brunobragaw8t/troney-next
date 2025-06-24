import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";
import { themes } from "storybook/internal/theming";

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        dark: { name: "Dark", value: "#0f172a" },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    },
  },
  initialGlobals: {
    backgrounds: { value: "dark" },
  },
};

export default preview;
