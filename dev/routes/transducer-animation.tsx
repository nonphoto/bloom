import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { comp, map, run, take } from "@thi.ng/transducers";
import { styleTranslate } from "../../src";
import {
  animations,
  keyframes,
  springPosition,
  time,
  tuples,
} from "../../src/transducer";
import { onSettled } from "solid-js";

export default function () {
  let element: HTMLDivElement;

  onSettled(() => {
    let currentAnimation: Animation | null = null;
    run(
      comp(
        tuples(
          springPosition({
            position: 0,
            velocity: 0,
            target: 100,
            damping: dampingFromHalflife(100),
            stiffness: stiffnessFromDamping(1, dampingFromHalflife(100)),
          }),
          springPosition({
            position: 0,
            velocity: 0,
            target: 100,
            damping: dampingFromHalflife(200),
            stiffness: stiffnessFromDamping(1, dampingFromHalflife(200)),
          }),
        ),
        take(100),
        map(styleTranslate),
        keyframes("transform"),
        animations(element!),
      ),
      (animation) => {
        if (currentAnimation) {
          currentAnimation.cancel();
        }
        currentAnimation = animation;
        animation.play();
      },
      time(),
    );
  });

  return (
    <div style={{ height: "100svh" }}>
      <div
        ref={element!}
        style={{
          position: "fixed",
          inset: "0 auto auto 0",
          width: "100px",
          height: "100px",
          background: "skyblue",
        }}
      />
      <div
        ref={(element) => {
          element.animate(
            { transform: [`translateX(0px)`, `translateX(99px)`] },
            { duration: (1_000 / 60) * 100 },
          );
        }}
        style={{
          position: "fixed",
          inset: "100px auto auto 0",
          width: "100px",
          height: "100px",
          background: "pink",
        }}
      />
    </div>
  );
}
