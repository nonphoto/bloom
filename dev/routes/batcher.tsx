import { createEventListener } from "@solid-primitives/event-listener";
import { Batcher, safeDocument, waitForAnimationFrame } from "../../src";

export default function BatcherRoute() {
  const batcher = new Batcher({ wait: waitForAnimationFrame });
  let entries: [number, number][] = [];

  createEventListener(safeDocument()?.body, "mousemove", (event) => {
    batcher.enqueue(() => {
      entries.push([event.clientX, event.clientY]);
    });
  });

  batcher.addEventListener("postrun", () => {
    console.log(entries);
    entries = [];
  });

  return null;
}
