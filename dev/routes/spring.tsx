import { createEventListener } from "@solid-primitives/event-listener";
import { comp, map } from "@thi.ng/transducers";
import { Vec } from "@thi.ng/vectors";
import { createSignal } from "solid-js";
import {
  createSpring2,
  safeDocument,
  springPosition2,
  styleTranslate,
} from "~/../src";
import { createAnimation } from "../../src/solid/animation";

export default function SpringRoute() {
  const [element, setElement] = createSignal<HTMLElement>();
  const [target, setTarget] = createSignal<Vec | undefined>(undefined, {
    equals: false,
  });

  createEventListener(safeDocument()?.body, "click", () => {
    setTarget(() => [
      window.innerWidth * Math.random(),
      window.innerHeight * Math.random(),
    ]);
  });

  const spring = createSpring2(undefined, undefined, target, 0.01, 0.01);

  createAnimation(element, "transform", () =>
    comp(springPosition2(spring()), map(styleTranslate)),
  );

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
