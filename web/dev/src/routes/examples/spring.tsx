import {
  dampingRatioToStiffness,
  decay,
  duration,
  halflifeToDamping,
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

    const damping = halflifeToDamping(w() * 0.1);
    const stiffness = dampingRatioToStiffness(0.99, damping);
    const startPosition = h();
    const endPosition = h() / 3;
    const step = 2;

    const context = canvas.getContext("2d")!;
    context.lineWidth = 3;

    context.beginPath();
    context.moveTo(0, endPosition);
    context.lineTo(w(), endPosition);
    context.strokeStyle = "lightgray";
    context.stroke();

    context.beginPath();
    context.moveTo(0, h());
    for (let x = 0; x < 10_000; x += step) {
      const y = springPosition(
        x,
        startPosition,
        0,
        endPosition,
        0,
        stiffness,
        damping,
      );
      context.lineTo(x, y);
    }
    context.strokeStyle = "#0000ff";
    context.stroke();

    context.beginPath();
    context.moveTo(0, h());
    let logged = false;
    for (let x = 0; x < 10_000; x += step) {
      const y = decay(
        x,
        startPosition,
        0,
        endPosition,
        0,
        stiffness,
        damping,
      );
      if (!logged && y < 10) {
        console.log(x);
        logged = true;
      }
      context.lineTo(x, y);
    }
    context.strokeStyle = "#0000ff44";
    context.stroke();

    context.beginPath();
    const x = duration(
      startPosition,
      0,
      endPosition,
      0,
      stiffness,
      damping,
      1,
    );
    context.moveTo(x, 0);
    context.lineTo(x, h());
    context.strokeStyle = "#ff0000";
    context.stroke();
  });

  return canvas;
}
