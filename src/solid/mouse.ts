import { createMousePosition as createMousePositionStore } from "@solid-primitives/mouse";
import { setC, Vec } from "@thi.ng/vectors";
import { Accessor, createMemo } from "solid-js";
import { safeWindow } from "../dom";

/**
 * Creates a signal for the position of the mouse on screen.
 * @returns An accessor that returns the screen-relative mouse position as a 2d vector.
 */
export function createMousePosition(): Accessor<Vec> {
  const store = createMousePositionStore();

  return createMemo<Vec>(
    (out) =>
      setC(
        out,
        store.x - (safeWindow()?.scrollX ?? 0),
        store.y - (safeWindow()?.scrollY ?? 0),
      ),
    [],
    { equals: false },
  );
}
