import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    solid({
      start: { app: "./dev/app.tsx" },
      extensions: [".jsx", ".tsx"],
    }),
    fileRoutes({ types: true, dir: "./dev/routes" }),
  ],
});
