import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { createEventListener } from "@solid-primitives/event-listener";
import { comp, map } from "@thi.ng/transducers";
import { Vec } from "@thi.ng/vectors";
import { createSignal } from "solid-js";
import {
  createAnimation,
  createSpring2,
  safeDocument,
  styleTranslate,
} from "../../src";
import { keyframes, springPosition2 } from "../../src/transducer";

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

  const damping = dampingFromHalflife(100);
  const stiffness = stiffnessFromDamping(1, damping);
  const spring = createSpring2(target, { damping, stiffness });

  createAnimation(element, () =>
    comp(
      springPosition2(spring()),
      map(styleTranslate),
      keyframes("transform"),
    ),
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
