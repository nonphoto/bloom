import createRAF from "@solid-primitives/raf";
import { createEffect } from "solid-js";
import { Clock } from "./clock";

/**
 * A callback for an animation frame.
 * @param time - The time that the animation frame occurred.
 * @param deltaTime - The time since the last animation frame occurred.
 */
export type TimeCallback = (time: number, deltaTime: number) => void;

/**
 * Creates a new effect that calls the callback on every animation frame.
 * @param fn - The callback to call on animation frame.
 */
export function createTimeCallback(fn: TimeCallback): void {
  const clock = new Clock();
  const startTime = clock.time;

  const [, start] = createRAF(() => {
    clock.tick();
    fn(clock.time - startTime, clock.deltaTime);
  });

  createEffect(() => {
    start();
  });
}
