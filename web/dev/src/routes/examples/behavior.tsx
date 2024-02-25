import {
  behaviorDelay,
  springBehavior,
  springCreate,
  toControls,
  toGenerator,
} from "@chloranthy/core";
import { createEffect, onCleanup } from "solid-js";

export default function () {
  createEffect(() => {
    const onClick = () => {
      animation.play();
    };

    document.body.addEventListener("click", onClick);
    onCleanup(() => {
      document.body.removeEventListener("click", onClick);
    });
  });

  const element = (
    <div
      style={{
        width: "100px",
        height: "100px",
        background: "skyblue",
      }}
    >
      Hello
    </div>
  ) as Element;

  const x = behaviorDelay(
    500,
    springBehavior(
      springCreate({ end: 300, halflife: 100 }),
    ),
  );

  const animation = toControls(
    toGenerator(element, "transform", (t: number) => `translateX(${x(t)}px)`, {
      fill: "forwards",
    }),
  );

  return element;
}
