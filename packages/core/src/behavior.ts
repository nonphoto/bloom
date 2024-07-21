import type * as CSS from "csstype";
import type { Range } from "./range";
import { Spring, springDuration, springPosition } from "./spring";

export type Behavior<T> = (t: number) => T;
export type MaybeBehavior<T> = Behavior<T> | T;

const maxDuration = 10_000;
const frameDuration = 1_000 / 60;

let RANGES: Range[] | undefined = undefined;

export function withRanges<T>(
	fn: (ranges: Range[]) => Range[],
	behavior: Behavior<T>,
): Behavior<T> {
	return (t) => {
		const value = behavior(t);
		if (RANGES) {
			RANGES = fn(RANGES);
		}
		return value;
	};
}

export type BehaviorAnimateProperties = CSS.Properties;
export type BehaviorAnimateOptions =
	| Omit<KeyframeAnimationOptions, "duration" | "delay" | "easing">
	| undefined;

export function behaviorAnimate<T extends keyof BehaviorAnimateProperties>(
	element: Element,
	property: T,
	behavior: Behavior<BehaviorAnimateProperties[T]>,
	options: BehaviorAnimateOptions,
): () => Generator<Animation> {
	return function* () {
		let t = performance.now();
		const ranges: Range[] = (RANGES = []);
		behavior(t);
		RANGES = undefined;
		if (ranges.length === 0) {
			ranges.push([-Infinity, Infinity]);
		}
		for (const range of ranges) {
			let delay = Math.min(range[0] - t, 0);
			while (t < range[1]) {
				const keyframes = [];
				const end = Math.min(range[1], t + maxDuration);
				const duration = end - t;
				while (t < end) {
					keyframes.push({ [property]: behavior(t) });
					t += frameDuration;
				}
				yield element.animate(keyframes, {
					...(options ?? {}),
					duration,
					delay,
					easing: "linear",
				});
				delay = 0;
			}
		}
	};
}

export function animationGeneratorControls(
	generator: () => Generator<Animation>,
) {
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
				for (animation of generator()) {
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

export function springBehavior(spring: Spring): Behavior<number> {
	return withRanges(
		() => [[0, springDuration(spring, 0.1)]],
		(t) => springPosition(spring, t),
	);
}

export function tweenBehavior(duration: number): Behavior<number> {
	return withRanges(
		() => [[0, duration]],
		(t) => Math.min(Math.max(t / duration, 0), 1),
	);
}

export function behaviorDelay<T>(
	ms: number,
	behavior: Behavior<T>,
): Behavior<T> {
	return withRanges(
		(ranges) => ranges.map(([start, end]) => [start + ms, end + ms]),
		(t) => behavior(t - ms),
	);
}
