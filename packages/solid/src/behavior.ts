import {
	Behavior,
	BehaviorAnimateOptions,
	BehaviorAnimateProperties,
	animationGeneratorControls,
	behaviorAnimate,
	behaviorDelay,
} from "@chloranthy/core/src/index.ts";
import { MaybeAccessor, access } from "@solid-primitives/utils";
import { createEffect, onCleanup } from "solid-js";

export function makeAnimation<T extends keyof BehaviorAnimateProperties>(
	element: Element,
	property: T,
	behavior: Behavior<BehaviorAnimateProperties[T]>,
	options: BehaviorAnimateOptions,
) {
	createEffect(() => {
		const controls = animationGeneratorControls(
			behaviorAnimate(
				element,
				property,
				behaviorDelay(performance.now(), behavior),
				options,
			),
		);
		controls.play();
		onCleanup(() => {
			controls.cancel();
		});
	});
}

export function createAnimation<T extends keyof BehaviorAnimateProperties>(
	element: MaybeAccessor<Element | null | undefined>,
	property: T,
	behavior: Behavior<BehaviorAnimateProperties[T]>,
	options: BehaviorAnimateOptions,
) {
	createEffect(() => {
		const elementValue = access(element);
		if (elementValue) {
			makeAnimation(elementValue, property, behavior, options);
		}
	});
}

export function createAnimations<T extends BehaviorAnimateProperties>(
	element: MaybeAccessor<Element | null | undefined>,
	behaviors: { [P in keyof T]: Behavior<T[P]> },
	options: BehaviorAnimateOptions,
) {
	createEffect(() => {
		const elementValue = access(element);
		if (elementValue) {
			const entries = Object.entries(behaviors);
			for (const [property, behavior] of entries) {
				makeAnimation(elementValue, property, behavior, options);
			}
		}
	});
}
