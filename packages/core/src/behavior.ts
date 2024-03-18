import type { Range } from "./range";
import { Spring, springDuration, springPosition } from "./spring";

export type Behavior<T> = (t: number) => T;
export type MaybeBehavior<T> = Behavior<T> | T;

const maxDuration = 10_000;
const frameDuration = 1_000 / 60;

let RANGES: Range[] | undefined = undefined;

export function withRanges<T>(
	fn: (ranges: Range[]) => Range[],
	b: Behavior<T>,
): Behavior<T> {
	return (t) => {
		const value = b(t);
		if (RANGES) {
			RANGES = fn(RANGES);
		}
		return value;
	};
}

export function isBehavior<T>(value: any): value is Behavior<T> {
	return typeof value === "function" && value.length === 1;
}

export function getRanges<T>(b: Behavior<T>, t: number): [Range[], T] {
	let prevRanges = RANGES;
	RANGES = [];
	const value = b(t);
	const ranges = RANGES;
	RANGES = prevRanges;
	return [ranges, value];
}

export function toGenerator(
	element: Element,
	prop: string,
	b: Behavior<string>,
	options?: Pick<KeyframeAnimationOptions, "timeline" | "fill">,
): () => Generator<Animation> {
	return function* () {
		let time = performance.now();
		const [ranges] = getRanges(b, time);
		if (ranges.length === 0) {
			ranges.push([-Infinity, Infinity]);
		}
		for (const range of ranges) {
			if (time < range[0]) {
				yield element.animate(null, { duration: range[0] - time });
				time = range[0];
			}
			while (time < range[1]) {
				const keyframes = [];
				const end = Math.min(range[1], time + maxDuration);
				const duration = end - time;
				while (time < end) {
					keyframes.push({ [prop]: b(time) });
					time += frameDuration;
				}
				yield element.animate(keyframes, {
					duration,
					easing: "linear",
					...(options ?? {}),
				});
			}
		}
	};
}

export function toControls(g: () => Generator<Animation>) {
	let animation: Animation;

	return {
		cancel() {
			if (animation) {
				animation.cancel();
			}
		},
		async play() {
			if (animation) {
				animation.cancel();
			}
			try {
				for (animation of g()) {
					await animation.finished;
				}
			} catch (error) {
				if (!(error instanceof DOMException)) {
					throw error;
				}
			}
		},
	};
}

export function springBehavior(s: Spring): Behavior<number> {
	return withRanges(
		() => [[0, springDuration(s, 0.1)]],
		(t: number) => springPosition(s, t),
	);
}

export function tweenBehavior(duration: number): Behavior<number> {
	return withRanges(
		() => [[0, duration]],
		(t) => Math.min(Math.max(t / duration, 0), 1),
	);
}

export function behaviorDelay<T>(ms: number, b: Behavior<T>): Behavior<T> {
	return withRanges(
		(ranges) => ranges.map(([start, end]) => [start + ms, end + ms]),
		(t) => b(t - ms),
	);
}
