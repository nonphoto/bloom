import { vec2, Vec2 } from "@thi.ng/vectors";
import { Accessor, createSignal, Setter, SignalOptions } from "solid-js";

export function createVec2(
  x?: number,
  y?: number,
  options?: Omit<SignalOptions<Vec2>, "equals">,
): [state: Accessor<Vec2>, setState: Setter<Vec2>] {
  return createSignal<Vec2>(vec2(x, y), { ...options, equals: false });
}
