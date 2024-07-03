import { type Vec2, safeWindow, vec2Create, vec2Set } from "@chloranthy/core";
import { createMousePosition as createMousePositionStore } from "@solid-primitives/mouse";
import { type Accessor, createMemo } from "solid-js";

/**
 * Creates a signal for the position of the mouse on screen.
 * @returns An accessor that returns the screen-relative mouse position as a 2d vector.
 */
export function createMousePosition(): Accessor<Vec2> {
	const store = createMousePositionStore();

	return createMemo<Vec2>(
		(out) =>
			vec2Set(
				out,
				store.x - (safeWindow()?.scrollX ?? 0),
				store.y - (safeWindow()?.scrollY ?? 0),
			),
		vec2Create(),
		{ equals: false },
	);
}
