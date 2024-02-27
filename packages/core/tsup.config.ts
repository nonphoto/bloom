import { defineConfig } from "tsup";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/body1d.ts",
		"src/body2d.ts",
		"src/quad2d.ts",
		"src/rect.ts",
		"src/vec2.ts",
	],
	format: "esm",
	dts: true,
});
