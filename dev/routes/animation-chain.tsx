import { createEventListener } from "@solid-primitives/event-listener";
import { createEffect, createMemo, createSignal } from "solid-js";
import { safeDocument, styleTranslateX } from "../../src";
import { AnimationChain } from "../../src/animationChain";

function makeAnimationChain(element: HTMLElement) {
  return new AnimationChain(
    (function* () {
      while (true) {
        yield new Animation(
          new KeyframeEffect(
            element,
            {
              transform: ["translateX(0px)", "translateX(400px)"],
            },
            { duration: 5000, delay: -500 },
          ),
        );
      }
    })(),
  );
}

export default function AnimationChainRoute() {
  const [element, setElement] = createSignal<HTMLElement>();
  const [isRunning, setIsRunning] = createSignal(true);
  const [markerPosition, setMarkerPosition] = createSignal(0);

  const animation = createMemo(() => {
    const elementValue = element();
    if (elementValue) {
      return makeAnimationChain(elementValue);
    }
  });

  createEffect(
    () => animation(),
    (animation) => {
      animation?.play();
      return () => {
        animation?.animation?.cancel();
      };
    },
  );

  createEffect(
    () => [animation(), isRunning(), element()] as const,
    ([animation, isRunning, element]) => {
      if (animation) {
        if (isRunning) {
          animation.resume();
        } else {
          animation.interrupt();
          if (element) {
            setMarkerPosition(element.getBoundingClientRect().x);
          }
        }
      }
    },
  );

  createEventListener(safeDocument()?.body, "click", () => {
    setIsRunning((prev) => !prev);
  });

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: "0 auto auto 0",
          background: "lightpink",
          width: "4rem",
          height: "4rem",
          transform: styleTranslateX(markerPosition()),
        }}
      />
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
    </>
  );
}
