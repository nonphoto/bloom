import { createEventListener } from "@solid-primitives/event-listener";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { safeDocument, styleTranslateX } from "../../src";
import { AnimationChain } from "../../src/animationChain";

export default function AnimationChainRoute() {
  const [element, setElement] = createSignal<HTMLElement>();
  const [isRunning, setIsRunning] = createSignal(true);
  const [markerPosition, setMarkerPosition] = createSignal(0);

  createEffect(() => {
    const elementValue = element();
    if (elementValue) {
      const animation = new AnimationChain(
        (function* () {
          while (true) {
            yield new Animation(
              new KeyframeEffect(
                elementValue,
                {
                  transform: ["translateX(0px)", "translateX(200px)"],
                },
                { duration: 3000, delay: -500 },
              ),
            );
          }
        })(),
      );
      animation.play();

      onCleanup(() => {
        animation.animation?.cancel();
      });

      createEffect(() => {
        if (isRunning()) {
          animation.resume();
        } else {
          setMarkerPosition(elementValue.getBoundingClientRect().x);
          animation.interrupt();
        }
      });
    }
  });

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
