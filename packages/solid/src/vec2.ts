import { Vec2, vec2Create } from "@bloom-motion/core";
import { Accessor, createSignal, Setter, SignalOptions } from "solid-js";

export function createVec2(
	options?: Omit<SignalOptions<Vec2>, "equals">,
): [state: Accessor<Vec2>, setState: Setter<Vec2>] {
	return createSignal<Vec2>(vec2Create(), { ...options, equals: false });
}
