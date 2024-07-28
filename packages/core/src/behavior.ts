import type * as CSS from "csstype";
import { clamp } from "./common";
import { Range, rangeUnion } from "./range";
import { Spring, springDuration, springPosition } from "./spring";

export type Behavior<T> = (t: number) => T;
export type MaybeBehavior<T> = Behavior<T> | T;

const maxDuration = 10_000;
const frameDuration = 1_000 / 60;

let useRange: ((dt: number, duration: number) => void) | undefined;

export type BehaviorAnimateProperties = CSS.Properties;
export type BehaviorAnimateOptions =
	| Omit<KeyframeAnimationOptions, "duration" | "delay" | "easing">
	| undefined;

function notDone([, end]: Range): boolean {
	return end > 0;
}

export function behaviorAnimate<T extends keyof BehaviorAnimateProperties>(
	element: Element,
	property: T,
	behavior: Behavior<BehaviorAnimateProperties[T]>,
	options: BehaviorAnimateOptions = {},
): () => Generator<Animation> {
	return function* () {
		let ranges: Range[] = [];
		let t = performance.now();

		useRange = (dt, duration) => {
			ranges.push([-dt, -dt + duration] as Range);
		};

		const firstValue = behavior(t);

		while (ranges.length === 0 || ranges.some(notDone)) {
			const normalizedRanges = rangeUnion(ranges);
			let delay: number = 0;
			let duration: number = 0;
			for (let j = 0; j < normalizedRanges.length; j++) {
				const [rangeStart, rangeEnd] = normalizedRanges[j]!;
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
