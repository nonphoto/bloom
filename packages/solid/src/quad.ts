import {
	catchMaybe,
	mat2dCreate,
	mat2dInvert,
	mat2dMultiply,
	maybe,
	Quad2d,
	quad2dCreate,
	quad2dFromRect,
	quad2dUntransformMat2d,
} from "@bloom/core/src/index.ts";
import { access, Directive, MaybeAccessor } from "@solid-primitives/utils";
import { createMemo } from "solid-js";
import { useMatrix, useRect } from "./layout";
import { createSetTransform } from "./transform";

export function createSetQuad(
	element: MaybeAccessor<HTMLElement | undefined>,
	value: MaybeAccessor<Quad2d | undefined>,
) {
	const rect = useRect(element);
	const matrix = useMatrix(element);
	const quad = quad2dCreate();
	const inverseMatrix = mat2dCreate();
	const targetTransform = createMemo(
		catchMaybe((out) => {
			quad2dFromRect(quad, maybe(rect()));
			quad2dUntransformMat2d(out, quad, maybe(access(value)));
			mat2dInvert(inverseMatrix, maybe(matrix()));
			return mat2dMultiply(out, inverseMatrix, out);
		}),
		mat2dCreate(),
		{ equals: false },
	);

	createSetTransform(element, targetTransform);
}

/**
 * A directive for setting the quad of an element. Setting the quad will update the element's transform such that it visually matches the placement of the quad on screen.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the element's transform.
 * @param target - The target element.
 * @param value - The quad to set on the element's transform to.
 */
export const quad: Directive<Quad2d | undefined> = (target, value) => {
	if (target instanceof HTMLElement) {
		createSetQuad(target, value);
	}
};
