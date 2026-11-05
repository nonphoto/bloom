import { createEventListener } from "@solid-primitives/event-listener";
import { createEffect, createSignal } from "solid-js";
import { createBatchedGetRect, safeDocument } from "../../src";
import { createResizeObserver } from "@solid-primitives/resize-observer";

export default function WaveRoute() {
  const [element, setElement] = createSignal<HTMLElement>();
  const getRect = createBatchedGetRect(document.documentElement);

  createEffect(
    () => element(),
    (element) => {
      const animation = element?.animate(
        [
          { transform: `translate(0px, 0px)` },
          { transform: `translate(-100%, -100%)` },
        ],
        { duration: 2000, iterations: Infinity },
      );
      return () => animation?.cancel();
    },
  );

  createEventListener(safeDocument()?.body, "click", () => {
    const elementValue = element();
    if (elementValue) {
      // getRect(elementValue).then(console.log);
    }
  });

  createResizeObserver(element, ({ width, height }, element) => {
    console.log(element.clientLeft);
  });

  return (
    <div
      ref={setElement}
      style={{
        position: "fixed",
        inset: "auto 0 0 auto",
        background: "skyblue",
        width: "50%",
        height: "50%",
      }}
    />
  );
}
