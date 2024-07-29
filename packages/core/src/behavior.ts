import type * as CSS from "csstype";
import { clamp } from "./common";
import { Spring, springDuration, springPosition } from "./spring";

export type Behavior<T> = (t: number) => T;
export type MaybeBehavior<T> = Behavior<T> | T;

const maxDuration = 10_000;
const frameDuration = 1_000 / 60;

let useRange: ((dt: number, duration: number) => void) | undefined;

export type CSSProperties = CSS.Properties;
export type CSSPropertyBehaviors = {
	[K in keyof CSSProperties]: Behavior<CSSProperties[K]>;
};
export type BehaviorAnimateOptions =
	| Omit<KeyframeAnimationOptions, "duration" | "delay" | "easing">
	| undefined;

function notDone([, end]: [number, number]): boolean {
	return end > 0;
}

function normalizeRanges(ranges: [number, number][]): [number, number][] {
	ranges = ranges
		.map(([start, end]): [number, number] =>
			start <= end ? [start, end] : [end, start],
		)
		.sort((a, b) => a[0] - b[0]);
	const result = [ranges[0]!];
	for (const [start, end] of ranges.slice(1)) {
		const [lastStart, lastEnd] = result.at(-1)!;
		if (start <= lastEnd) {
			result[result.length - 1] = [lastStart, Math.max(end, lastEnd)];
		} else {
			result.push([start, end]);
		}
	}
	return result;
}

export function behaviorAnimate<T extends keyof CSSProperties>(
	element: Element,
	property: T,
	behavior: Behavior<CSSProperties[T]>,
	options: BehaviorAnimateOptions = {},
): () => Generator<Animation> {
	return function* () {
		let ranges: [number, number][] = [];
		let t = performance.now();

		useRange = (dt, duration) => {
			ranges.push([-dt, -dt + duration]);
		};

		const firstValue = behavior(t);

		while (ranges.length === 0 || ranges.some(notDone)) {
			const normalized = normalizeRanges(ranges);
			let delay: number = 0;
			let duration: number = 0;
			for (let j = 0; j < normalized.length; j++) {
				const [rangeStart, rangeEnd] = normalized[j]!;
				if (
					(rangeStart > 0 && rangeStart < delay) ||
					(rangeStart <= 0 && rangeEnd >= 0)
				) {
					delay = Math.max(rangeStart, 0);
					duration = rangeEnd - delay;
				}
			}

			const end = t + Math.min(maxDuration, duration);
			const keyframes = [{ [property]: firstValue }];
			while (t < end) {
				ranges = [];
				t += frameDuration;
				keyframes.push({ [property]: behavior(t) });
			}

			yield element.animate(keyframes, {
				...options,
				duration,
				delay,
				easing: "linear",
				fill: "both",
			});
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
	const duration = springDuration(spring, 1);
	return (t) => {
		useRange?.(t, duration);
		return springPosition(spring, t);
	};
}

export function tweenBehavior(duration: number): Behavior<number> {
	return (t) => {
		useRange?.(t, duration);
		return clamp(0, 1, t / duration);
	};
}

export function behaviorDelay<T>(
	ms: number,
	behavior: Behavior<T>,
): Behavior<T> {
	return (t) => behavior(t - ms);
}
