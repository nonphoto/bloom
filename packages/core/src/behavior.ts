import {
	create as springCreate,
	duration as springDuration,
	SpringOptions,
	position as springPosition,
} from "@nonphoto/spring";
import { partial } from "@thi.ng/compose";
import {
	comp,
	iterator,
	map,
	multiplex,
	partition,
	range,
	syncTuples,
	takeWhile,
	Transducer,
	TxLike,
} from "@thi.ng/transducers";
import { Vec2, Vec3 } from "@thi.ng/vectors";
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

export function time() {
	return range(0, Infinity, frameDuration);
}

export async function run(
	tx: Transducer<number, Animation>,
	fnx: (animation: Animation) => void,
): Promise<void> {
	for (let animation of iterator(tx, time())) {
		fnx(animation);
		await animation.finished;
	}
}

export function vector(
	a: TxLike<number, number>,
	b: TxLike<number, number>,
): Transducer<number, Vec2>;
export function vector(
	a: TxLike<number, number>,
	b: TxLike<number, number>,
	c: TxLike<number, number>,
): Transducer<number, Vec3>;
export function vector(...args: any[]): any {
	return comp(
		multiplex(...(args as [TxLike<number, number>])),
		takeWhile((v) => v.some((x) => x != null)),
		syncTuples(args.length),
	);
}

export function delay(ms: number) {
	return map((t: number) => t - ms);
}

export function duration(ms: number) {
	return takeWhile((t: number) => t < ms);
}

export function spring(options: Partial<SpringOptions>) {
	const s = springCreate(options);
	const ms = springDuration(s);
	return comp(
		takeWhile((t: number) => t < ms),
		map((t: number) => springPosition(s, t)),
	);
}
