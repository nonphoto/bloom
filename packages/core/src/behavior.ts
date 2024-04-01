import { safeDocument } from "./dom";
import type { Range } from "./range";
import { Spring, springDuration, springPosition } from "./spring";

export type Behavior<T> = () => T;
export type MaybeBehavior<T> = Behavior<T> | T;

const maxDuration = 10_000;
const frameDuration = 1_000 / 60;

let RANGES: Range[] | undefined = undefined;
let TIMELINES: Set<AnimationTimeline> | undefined = undefined;
let TIME: number | undefined = undefined;

export function time(): number {
	const timeline = safeDocument()?.timeline;
	if (TIMELINES && timeline) {
		TIMELINES.add(timeline);
	}
	const time = timeline?.currentTime;
	return (typeof time === "number" ? time : performance.now()) + (TIME ?? 0);
}

export function withRanges<T>(
	fn: (ranges: Range[]) => Range[],
	behavior: Behavior<T>,
): Behavior<T> {
	return () => {
		const value = behavior();
		if (RANGES) {
			RANGES = fn(RANGES);
		}
		return value;
	};
}

export function toGenerator(
	element: Element,
	prop: string,
	behavior: Behavior<string>,
	options?: Pick<KeyframeAnimationOptions, "timeline" | "fill">,
): () => Generator<Animation> {
	return function* () {
		TIME = 0;
		const timelines: Set<AnimationTimeline> = (TIMELINES = new Set());
		const ranges: Range[] = (RANGES = []);
		behavior();
		TIMELINES = undefined;
		RANGES = undefined;
		if (ranges.length === 0) {
			ranges.push([-Infinity, Infinity]);
		}
		const timeline = timelines.values().next();
		if (timelines.size === 1 && timeline) {
			for (const range of ranges) {
				if (TIME < range[0]) {
					// TODO: implement timeouts for ScrollTimelines
					yield element.animate(null, { duration: range[0] - TIME });
					TIME = range[0];
				}
				while (TIME < range[1]) {
					const keyframes = [];
					const end = Math.min(range[1], TIME + maxDuration);
					const duration = end - TIME;
					while (TIME < end) {
						keyframes.push({ [prop]: behavior() });
						TIME += frameDuration;
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

export function toControls(generator: () => Generator<Animation>) {
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
		() => springPosition(spring, time()),
	);
}

export function tweenBehavior(duration: number): Behavior<number> {
	return withRanges(
		() => [[0, duration]],
		() => Math.min(Math.max(time() / duration, 0), 1),
	);
}

export function behaviorDelay<T>(
	ms: number,
	behavior: Behavior<T>,
): Behavior<T> {
	return withRanges(
		(ranges) => ranges.map(([start, end]) => [start + ms, end + ms]),
		() => {
			const t = time();
			TIME = t - ms;
			const b = behavior();
			TIME = t;
			return b;
		},
	);
}
