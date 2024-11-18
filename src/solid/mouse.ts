import { createEventListener } from "@solid-primitives/event-listener";
import { Vec } from "@thi.ng/vectors";
import { Accessor, createSignal } from "solid-js";
import { safeDocument } from "../dom";
import { mousePositionFromEvent } from "../mouse";

/**
 * Creates a signal for the position of the mouse on screen.
 * @returns An accessor that returns the screen-relative mouse position as a 2d vector.
 */
export function createMousePosition(): Accessor<Vec | undefined> {
  const [position, setPosition] = createSignal<Vec>();

  createEventListener(safeDocument()?.body, "mousemove", (event) => {
    setPosition(() => mousePositionFromEvent([], event));
  });

  return position;
}
