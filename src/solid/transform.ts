import { ReactiveWeakMap } from "@solid-primitives/map";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { access, Directive, MaybeAccessor } from "@solid-primitives/utils";
import { Mat } from "@thi.ng/matrices";
import { createComputed } from "solid-js";

export const useTransforms = createHydratableSingletonRoot(() => {
	return new ReactiveWeakMap<HTMLElement, Mat>();
});

function maybeSet<T extends WeakKey, U>(
	map: WeakMap<T, U>,
	key: T,
	value: U | undefined,
) {
	if (value != null) {
		map.set(key, value);
	} else {
		map.delete(key);
	}
}

export function createSetTransform(
	element: MaybeAccessor<HTMLElement | null | undefined>,
	value: MaybeAccessor<Mat | undefined>,
): void {
	const transforms = useTransforms();

	createComputed(() => {
		const elementValue = access(element);
		if (elementValue) {
			createComputed(() => {
				maybeSet(transforms, elementValue, access(value));
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
export const setTransform: Directive<Mat | undefined> = (target, value) => {
	if (target instanceof HTMLElement) {
		createSetTransform(target, value);
	}
};
