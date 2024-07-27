import type * as CSS from "csstype";
import { clamp } from "./common";
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

function isPositive(n: number): boolean {
	return n > 0;
}

function isInProgress(t: number, starts: number[], ends: number[]) {
	for (let i = 0; i < starts.length; i++) {
		if (t >= starts[i]! && t < ends[i]!) {
			return true;
		}
	}
	return false;
}

function nextStart(t: number, starts: number[]) {
	let min = Infinity;
	for (let i = 0; i < starts.length; i++) {
		if (starts[i]! > t) {
			min = Math.min(starts[i]!, min);
		}
	}
	return min === Infinity ? 0 : min;
}

export function behaviorAnimate<T extends keyof BehaviorAnimateProperties>(
	element: Element,
	property: T,
	behavior: Behavior<BehaviorAnimateProperties[T]>,
	options: BehaviorAnimateOptions,
): () => Generator<Animation> {
	return function* () {
		const starts: number[] = [];
		const ends: number[] = [];
		let i = 0;
		let delay = 0;
		let t = performance.now();

		useRange = (dt, duration) => {
			starts[i] = -dt;
			ends[i] = -dt + duration;
			i++;
		};

		while (ends.length === 0 || ends.some(isPositive)) {
			if (!isInProgress(t, starts, ends)) {
				delay = nextStart(t, starts) - t;
				t += delay;
			}

			const keyframes = [];
			const end = t + maxDuration;
			const duration = end - t;

			while (t < duration) {
				i = 0;
				keyframes.push({ [property]: behavior(t) });
				starts.length = ends.length = i;
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
