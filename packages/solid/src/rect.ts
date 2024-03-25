import {
	Rect,
	catchMaybe,
	mat2dCreate,
	mat2dInvert,
	mat2dMultiply,
	maybe,
	rectUntransformMat2d,
} from "@chloranthy/core";
import { Directive, MaybeAccessor, access } from "@solid-primitives/utils";
import { createMemo } from "solid-js";
import { useMatrix, useRect } from "./layout";
import { createSetTransform } from "./transform";

export function createSetRect(
	element: MaybeAccessor<HTMLElement | undefined>,
	value: MaybeAccessor<Rect | undefined>,
) {
	const rect = useRect(element);
	const matrix = useMatrix(element);
	const inverseMatrix = mat2dCreate();
	const targetTransform = createMemo(
		catchMaybe((out) => {
			rectUntransformMat2d(out, maybe(rect()), maybe(access(value)));
			mat2dInvert(inverseMatrix, maybe(matrix()));
			return mat2dMultiply(out, inverseMatrix, out);
		}),
		mat2dCreate(),
		{ equals: false },
	);

	createSetTransform(element, targetTransform);
}

/**
 * A directive for setting the layout rectangle of an element. Setting the rect will update the element's transform such that it visually matches the placement of the rect on screen.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the rect's transform.
 * @param target - The target element.
 * @param value - The rect to set on the element's transform to.
 */
export const rect: Directive<Rect | undefined> = (target, value) => {
	if (target instanceof HTMLElement) {
		createSetRect(target, value);
	}
};
