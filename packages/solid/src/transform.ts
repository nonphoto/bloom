import { Mat2d } from "@bloom-motion/core/src/index.ts";
import { access, Directive, MaybeAccessor } from "@solid-primitives/utils";
import { createComputed } from "solid-js";
import { useLayoutTree } from "./layout";

export function createSetTransform(
	element: MaybeAccessor<HTMLElement | null | undefined>,
	value: MaybeAccessor<Mat2d | undefined>,
): void {
	const layoutTree = useLayoutTree();

	createComputed(() => {
		const elementValue = access(element);
		if (elementValue) {
			createComputed(() => {
				layoutTree.setTransform(elementValue, access(value));
			});
		}
	});
}

/**
 * A directive for setting the transformation matrix of an element.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the transform.
 * @param target - The target element.
 * @param value - The transform to set on the element.
 */
export const setTransform: Directive<Mat2d | undefined> = (target, value) => {
	if (target instanceof HTMLElement) {
		createSetTransform(target, value);
	}
};
