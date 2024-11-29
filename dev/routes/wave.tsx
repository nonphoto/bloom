import { createEventListener } from "@solid-primitives/event-listener";
import { map } from "@thi.ng/transducers";
import { createSignal } from "solid-js";
import { safeDocument, styleTranslateX, useRectObserver } from "../../src";
import { createAnimation } from "../../src/solid/animation";

export default function WaveRoute() {
  const [element, setElement] = createSignal<HTMLElement>();
  const { invalidate } = useRectObserver();

  createAnimation(element, "transform", () =>
    map<number, string>((t) => styleTranslateX(500 + Math.sin(t / 1000) * 500)),
  );

  createEventListener(safeDocument()?.body, "click", () => {
    const elementValue = element();
    if (elementValue) {
      invalidate(elementValue);
    }
  });

  return (
    <div
      ref={setElement}
      style={{
        position: "fixed",
        inset: "0 auto auto 0",
        background: "skyblue",
        width: "4rem",
        height: "4rem",
      }}
    />
  );
}
