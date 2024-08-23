import { centroid, Rect } from "@thi.ng/geom";
import { identity23, Mat, mul23, set23, translation23 } from "@thi.ng/matrices";
import { neg, sub2, Vec, vec2, Vec2 } from "@thi.ng/vectors";
import { withValue } from "./utils";

export type Layout = {
	offsetCenter: Vec;
	rect: Rect;
	intermediateMatrix: () => Mat;
	matrix: () => Mat;
	transform: () => Mat | undefined;
	scroll: () => Vec2;
};

export function layoutCreate(
	parent: Layout | null,
	rect: Rect,
	transform: () => Mat | undefined,
	scroll: () => Vec2,
): Layout {
	const offsetCenter = centroid(rect)!;
	const layoutDelta =
		parent && offsetCenter
			? sub2(vec2(), offsetCenter, parent.offsetCenter)
			: offsetCenter;
	const offsetTranslation = translation23([], neg([], offsetCenter));
	const layoutTranslation = translation23([], layoutDelta);
	const scrollTranslation = identity23([]);
	const offsetMatrix = withValue([], (offsetMatrix: Mat) => {
		if (parent) {
			return mul23(
				offsetMatrix,
				parent.intermediateMatrix(),
				layoutTranslation,
			);
		} else {
			return set23(offsetMatrix, layoutTranslation);
		}
	});
	const intermediateMatrix = withValue([], (intermediateMatrix: Mat) => {
		const transformValue = transform();
		if (transformValue) {
			mul23(intermediateMatrix, offsetMatrix(), transformValue);
		} else {
			set23(intermediateMatrix, offsetMatrix());
		}
		translation23(scrollTranslation, scroll());
		return mul23(null, intermediateMatrix, scroll());
	});

	const matrix = withValue([], (matrix: Mat) => {
		mul23(null, matrix, offsetTranslation);
		return mul23(null, matrix, offsetMatrix());
	});

	return {
		rect,
		offsetCenter,
		intermediateMatrix,
		matrix,
		transform,
		scroll,
	};
}
