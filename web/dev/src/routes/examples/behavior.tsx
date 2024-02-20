import { delay, toControls, toGenerator, tween } from "@chloranthy/core";

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export default function () {
  const x = delay(500, (t) => easeInOutCubic(tween(1000)(t)));
  const transform = (t: number) => `translateX(${x(t) * 300}px)`;

  const element = (
    <div
      style={{ width: "100px", height: "100px", background: "skyblue" }}
      onClick={() => {
        animation.play();
      }}
    >
      Hello
    </div>
  ) as Element;

  const animation = toControls(toGenerator(element, "transform", transform));

  return element;
}
