import { partial } from "@thi.ng/compose";
import {
	comp,
	iterator,
	map,
	partition,
	range,
	takeWhile,
	Transducer,
} from "@thi.ng/transducers";
import type * as CSS from "csstype";
import { Spring, springDuration, springPosition } from "./spring";

const maxKeyframes = 120;
const frameDuration = 1_000 / 60;

export type CSSProperties = CSS.Properties;
export type CSSPropertyIterables = {
	[K in keyof CSSProperties]: Iterable<CSSProperties[K]>;
};
export type AnimateOptions =
	| Omit<KeyframeAnimationOptions, "duration" | "delay" | "easing">
	| undefined;

export function keyframe<T extends keyof CSSProperties>(
	property: T,
	value: CSSProperties[T],
): Keyframe {
	return { [property]: value };
}

export function keyframes<T extends keyof CSSProperties>(
	property: T,
): Transducer<CSSProperties[T], Keyframe[]> {
	return comp(
		partition(maxKeyframes + 1, maxKeyframes, true),
		map((values) => [...map(partial(keyframe, property), values)]),
	);
}

export function animation(
	target: Element,
	options: AnimateOptions = {},
): Transducer<Keyframe[], Animation> {
	return map((keyframes) => {
		return target.animate(keyframes, {
			...options,
			duration: keyframes.length * frameDuration,
		});
	});
}

export async function run(
	tx: Transducer<number, Animation>,
	fnx: (animation: Animation) => void,
): Promise<void> {
	for (let animation of iterator(tx, range(0, Infinity, frameDuration))) {
		fnx(animation);
		await animation.finished;
	}
}

export function delay(ms: number) {
	return map((t: number) => t - ms);
}

export function duration(ms: number) {
	return takeWhile((t: number) => t < ms);
}

export function spring(s: Spring) {
	const duration = springDuration(s, 1);
	return comp(
		takeWhile((t: number) => t < duration),
		map((t: number) => springPosition(s, t)),
	);
}
