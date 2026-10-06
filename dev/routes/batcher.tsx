import { createEventListener } from "@solid-primitives/event-listener";
import { Batcher, safeDocument, waitForTimeout } from "../../src";

export default function BatcherRoute() {
  const batcher = new Batcher({ wait: () => waitForTimeout(100) });
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

  return "See console";
}
