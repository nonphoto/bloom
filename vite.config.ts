import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    solid({
      start: { app: "./dev/app.tsx" },
      extensions: [".jsx", ".tsx"],
    }),
  ],
});
