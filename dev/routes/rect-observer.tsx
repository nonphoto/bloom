import { createEventListener } from "@solid-primitives/event-listener";
import { map } from "@thi.ng/transducers";
import { createSignal } from "solid-js";
import {
  createLog,
  createRect,
  safeDocument,
  styleTranslateX,
  useRectObserver,
} from "../../src";
import { createAnimation } from "../../src/solid/animation";

export default function WaveRoute() {
  const [element, setElement] = createSignal<HTMLElement>();
  const { invalidate } = useRectObserver();

  const bodyRect = createRect(safeDocument()?.body);
  const width = () => bodyRect()?.size[0] ?? 1;

  createAnimation(
    element,
    map((t) => ({
      transform: styleTranslateX(
        width() / 2 + (Math.sin(t / 1000) * width()) / 2,
      ),
    })),
  );

  createEventListener(safeDocument()?.body, "click", () => {
    const elementValue = element();
    if (elementValue) {
      invalidate(elementValue);
    }
  });

  const rect = createRect(element);

  createLog(() => rect()?.pos);

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
