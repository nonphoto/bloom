import {
	Spring,
	duration as springDuration,
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
	take,
	takeWhile,
	Transducer,
	TxLike,
} from "@thi.ng/transducers";
import { Vec2Like, Vec3Like } from "@thi.ng/vectors";
import { Properties } from "csstype";

const maxKeyframes = 120;
const frameDuration = 1_000 / 60;

export type CSSPropertyIterables = {
	[K in keyof Properties]: Iterable<Properties[K]>;
};

export type AnimateOptions =
	| Omit<KeyframeAnimationOptions, "duration" | "delay" | "easing">
	| undefined;

export type Accessor<T> = () => T;

export type MaybeAccessor<T> = Accessor<T> | T;

export type Behavior<T> = [Transducer<number, T>, AnimationTimeline];

export type MaybeBehavior<T> = Behavior<T> | MaybeAccessor<T>;

export function isBehavior(a: any): a is Behavior<ReturnType<(typeof a)[0]>> {
	return (
		Array.isArray(a) &&
		a.length === 2 &&
		typeof a[0] === "function" &&
		a[1] instanceof AnimationTimeline
	);
}

export function compB<T, U>(
	fn: (a: Transducer<number, T>) => Transducer<number, U>,
	[tx, timeline]: Behavior<T>,
): Behavior<U> {
	return [fn(tx), timeline];
}

export function mapB<T, U>(fn: (x: T) => U, a: T): U;
export function mapB<T, U>(fn: (x: T) => U, a: Accessor<T>): U;
export function mapB<T, U>(fn: (x: T) => U, a: MaybeAccessor<T>): U;
export function mapB<T, U>(fn: (x: T) => U, a: Behavior<T>): Behavior<U>;
export function mapB<T, U>(
	fn: (x: T) => U,
	a: MaybeBehavior<T>,
): MaybeBehavior<U>;
export function mapB<T, U>(
	fn: (a: T) => U,
	a: MaybeBehavior<T>,
): MaybeBehavior<U> {
	return isBehavior(a)
		? compB((tx) => comp(tx, map(fn)), a)
		: a instanceof Function
			? () => fn(a())
			: fn(a);
}

export function justB<T>(t: T): Behavior<T> {
	return [
		comp(
			map(() => t),
			take(1),
		),
		document.timeline,
	];
}

export function keyframe<T extends keyof Properties>(
	property: T,
	value: Properties[T],
): Keyframe {
	return { [property]: value };
}

export function keyframes<T extends keyof Properties>(
	property: T,
): Transducer<Properties[T], Keyframe[]> {
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
): Transducer<number, Vec2Like>;
export function vector(
	a: TxLike<number, number>,
	b: TxLike<number, number>,
	c: TxLike<number, number>,
): Transducer<number, Vec3Like>;
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

export function springB(s: Spring): Behavior<number> {
	const ms = springDuration(s);
	return [
		comp(
			takeWhile((t: number) => t < ms),
			map((t: number) => springPosition(s, t)),
		),
		document.timeline,
	];
}
