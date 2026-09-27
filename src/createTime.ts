import { Accessor, createSignal } from "solid-js";
import { createTimeCallback } from "./createTimeCallback";

/**
 * A time and delta-time accessor pair.
 */
export type CreateTimeReturn = [
  /**
   * The time that the animation frame occurred. Updates every animation frame.
   */
  Accessor<number>,

  /**
   * The time since the last animation frame occurred. Updates every animation frame.
   */
  Accessor<number>,
];

/**
 * Creates a new time and delta-time accessor pair.
 */
export function createTime(): CreateTimeReturn {
  const [time, setTime] = createSignal(0, { equals: false });
  const [deltaTime, setDeltaTime] = createSignal(0, { equals: false });

  createTimeCallback((t, dt) => {
    setTime(t);
    setDeltaTime(dt);
  });

  return [time, deltaTime];
}
