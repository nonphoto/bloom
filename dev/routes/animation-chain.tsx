import { createEventListener } from "@solid-primitives/event-listener";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { safeDocument } from "../../src";
import { AnimationChain } from "../../src/animationChain";

export default function AnimationChainRoute() {
  const [element, setElement] = createSignal<HTMLElement>();
  const [isRunning, setIsRunning] = createSignal(true);

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
                  transform: ["translateX(0px)", "translateX(100px)"],
                },
                { duration: 2000, delay: -500 },
              ),
            );
          }
        })(),
      );

      onCleanup(() => {
        animation.animation?.cancel();
      });

      createEffect(() => {
        if (isRunning()) {
          animation.play();
        } else {
          animation.interrupt();
        }
      });
    }
  });

  createEventListener(safeDocument()?.body, "click", () => {
    setIsRunning((prev) => !prev);
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
