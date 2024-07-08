import type * as CSS from "csstype";
import { safeDocument } from "./dom";
import type { Range } from "./range";
import { Spring, springDuration, springPosition } from "./spring";

export type Behavior<T> = (t: number) => T;
export type MaybeBehavior<T> = Behavior<T> | T;

const maxDuration = 10_000;
const frameDuration = 1_000 / 60;

let RANGES: Range[] | undefined = undefined;
let TIMELINES: Set<AnimationTimeline> | undefined = undefined;

const time: Behavior<number> = (t) => {
	const timeline = safeDocument()?.timeline;
	if (TIMELINES && timeline) {
		TIMELINES.add(timeline);
	}
	return t;
};

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
	| Omit<KeyframeAnimationOptions, "duration" | "easing" | "timeline">
	| undefined;

export function behaviorAnimate<T extends keyof BehaviorAnimateProperties>(
	element: Element,
	property: T,
	behavior: Behavior<BehaviorAnimateProperties[T]>,
	options: BehaviorAnimateOptions,
): () => Generator<Animation> {
	return function* () {
		let t = performance.now();
		const timelines: Set<AnimationTimeline> = (TIMELINES = new Set());
		const ranges: Range[] = (RANGES = []);
		behavior(t);
		TIMELINES = undefined;
		RANGES = undefined;
		if (ranges.length === 0) {
			ranges.push([-Infinity, Infinity]);
		}
		const timeline = timelines.values().next();
		if (timelines.size === 1 && timeline) {
			for (const range of ranges) {
				if (t < range[0]) {
					// TODO: implement timeouts for ScrollTimelines
					yield element.animate(null, { duration: range[0] - t });
					t = range[0];
				}
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
						easing: "linear",
						timeline: timeline.value,
					});
				}
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
		(t) => springPosition(spring, time(t)),
	);
}

export function tweenBehavior(duration: number): Behavior<number> {
	return withRanges(
		() => [[0, duration]],
		(t) => Math.min(Math.max(time(t) / duration, 0), 1),
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
