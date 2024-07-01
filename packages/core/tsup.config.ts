import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/rect.ts", "src/vec2.ts"],
	format: "esm",
	dts: true,
});
