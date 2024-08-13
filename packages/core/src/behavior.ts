import { partial } from "@thi.ng/compose";
import { comp, map, partition, range, Transducer } from "@thi.ng/transducers";
import {
	AsyncTransducer,
	comp as compAsync,
	map as mapAsync,
	run as runAsync,
} from "@thi.ng/transducers-async";
import type * as CSS from "csstype";

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
): Transducer<CSSProperties[T], IterableIterator<Keyframe>> {
	return comp(
		partition(maxKeyframes + 1, maxKeyframes),
		map((values) => map(partial(keyframe, property), values)),
	);
}

export function animate(
	element: Element,
	options: AnimateOptions = {},
): Transducer<IterableIterator<Keyframe>, Animation> {
	return map((keyframes) => {
		const keyframesArray = [...keyframes];
		return element.animate(keyframesArray, {
			...options,
			duration: keyframesArray.length * frameDuration,
		});
	});
}

export function run(tx: AsyncTransducer<number, Animation>) {
	let current: Animation;

	runAsync(
		compAsync(
			tx,
			mapAsync((animation) => ((current = animation), animation.finished)),
		),
		console.log,
		range(),
	);

	return {
		cancel() {
			current.cancel();
		},
		pause() {
			current.pause();
		},
		play() {
			current.play();
		},
	};
}
