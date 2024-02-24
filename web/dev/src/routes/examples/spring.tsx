import {
  springCreate,
  springDecay,
  springDuration,
  springPosition,
} from "@chloranthy/core";
import { createWindowSize } from "@solid-primitives/resize-observer";
import { createEffect } from "solid-js";

export default function () {
  const size = createWindowSize();
  const canvas = (
    <canvas
      style={{
        width: "100svw",
        height: "100svh",
      }}
    />
  ) as HTMLCanvasElement;

  const w = () => size.width * 2;
  const h = () => size.height * 2;

  createEffect(() => {
    canvas.width = w();
    canvas.height = h();

    const step = 2;

    const spring = springCreate({
      start: h(),
      end: h() / 3,
      halflife: w() * 0.1,
      dampingRatio: 1,
    });

    const context = canvas.getContext("2d")!;
    context.lineWidth = 2;

    context.beginPath();
    context.moveTo(0, spring.end);
    context.lineTo(w(), spring.end);
    context.strokeStyle = "lightgray";
    context.stroke();

    context.beginPath();
    context.moveTo(0, h());
    for (let x = 0; x < w(); x += step) {
      const y = springPosition(spring, x);
      context.lineTo(x, y);
    }
    context.strokeStyle = "#0000ff";
    context.stroke();

    context.beginPath();
    const x = springDuration(spring, 1);
    context.moveTo(x, 0);
    context.lineTo(x, h());
    context.strokeStyle = "#ff0000";
    context.stroke();
  });

  return canvas;
}
