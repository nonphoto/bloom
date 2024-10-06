import {
	catchMaybe,
	maybe,
	styleBorderRadius,
} from "@bloom-motion/core/src/index.ts";
import {
	Directive,
	MaybeAccessor,
	access,
	withAccess,
} from "@solid-primitives/utils";
import { createEffect } from "solid-js";
import { useRectObserver } from "./rectObserver";
import { useTransforms } from "./transform";

export function createSetBorderRadius(
	element: MaybeAccessor<HTMLElement | undefined>,
	value: MaybeAccessor<number | undefined>,
) {
	const rect = useRectObserver().use(element);
	const transforms = useTransforms();

	createEffect(() => {
		withAccess(element, (element) => {
			element.style.borderRadius =
				catchMaybe(() => {
					return styleBorderRadius(
						maybe(access(value)),
						maybe(rect()).size,
						maybe(transforms.get(element)),
					);
				})() ?? "";
		});
	});
}

/**
 * A directive for setting the border radius of an element.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the border radius relative to the element's view matrix, such that the radius always appears the same even if the element has transformations applied.
 * @param target - The target element.
 * @param value - The border radius to set on the element.
 */
export const borderRadius: Directive<number | undefined> = (target, value) => {
	if (target instanceof HTMLElement) {
		createSetBorderRadius(target, value);
	}
};
