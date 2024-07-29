import {
	Behavior,
	BehaviorAnimateOptions,
	CSSProperties,
	CSSPropertyBehaviors,
	animationGeneratorControls,
	behaviorAnimate,
	behaviorDelay,
} from "@bloom-motion/core/src/index.ts";
import { Directive, MaybeAccessor, access } from "@solid-primitives/utils";
import { createEffect, onCleanup } from "solid-js";

export function makeAnimation<T extends keyof CSSProperties>(
	element: Element,
	property: T,
	behavior: Behavior<CSSProperties[T]>,
	options?: BehaviorAnimateOptions,
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

export function createAnimation<T extends keyof CSSProperties>(
	element: MaybeAccessor<Element | null | undefined>,
	property: T,
	behavior: Behavior<CSSProperties[T]>,
	options?: BehaviorAnimateOptions,
) {
	createEffect(() => {
		const elementValue = access(element);
		if (elementValue) {
			makeAnimation(elementValue, property, behavior, options);
		}
	});
}

export function createAnimations(
	element: MaybeAccessor<Element | null | undefined>,
	behaviors: MaybeAccessor<Partial<CSSPropertyBehaviors>>,
	options?: BehaviorAnimateOptions,
) {
	createEffect(() => {
		const elementValue = access(element);
		if (elementValue) {
			for (const [property, behavior] of Object.entries(access(behaviors))) {
				makeAnimation(
					elementValue,
					property as keyof CSSProperties,
					behavior,
					options,
				);
			}
		}
	});
}

export type AnimateDirectiveValue = Partial<CSSPropertyBehaviors>;

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			animate: AnimateDirectiveValue;
		}
	}
}

export const animate: Directive<AnimateDirectiveValue> = (target, value) => {
	if (target instanceof HTMLElement) {
		return createAnimations(target, value);
	}
};
