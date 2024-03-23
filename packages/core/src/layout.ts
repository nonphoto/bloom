import { withValue } from "./common";
import {
	Mat2d,
	mat2dCopy,
	mat2dCreate,
	mat2dFromTranslation,
	mat2dMultiply,
	mat2dTranslate,
	mat2dTranslateNegative,
} from "./mat2d";
import { Rect, rectCenter } from "./rect";
import { Vec2, vec2Create, vec2Sub } from "./vec2";

export type Layout = {
	offsetCenter: Vec2;
	intermediateMatrix: () => Mat2d;
	matrix: () => Mat2d;
};

export function layoutCreate(
	parent: Layout | null,
	rect: Rect,
	transform: () => Mat2d,
	scroll: () => Vec2,
): Layout {
	const offsetCenter = rectCenter(vec2Create(), rect);

	const layoutDelta = (() => {
		if (parent) {
			return vec2Sub(vec2Create(), offsetCenter, parent.offsetCenter);
		} else {
			return offsetCenter;
		}
	})();

	const offsetMatrix = withValue(mat2dCreate(), (offsetMatrix) => {
		if (parent) {
			return mat2dTranslate(
				offsetMatrix,
				parent.intermediateMatrix(),
				layoutDelta,
			);
		} else {
			return mat2dFromTranslation(offsetMatrix, layoutDelta);
		}
	});

	const intermediateMatrix = withValue(mat2dCreate(), (intermediateMatrix) => {
		mat2dCopy(intermediateMatrix, offsetMatrix());
		const transformValue = transform();
		if (transformValue) {
			mat2dMultiply(intermediateMatrix, intermediateMatrix, transformValue);
		}
		return mat2dTranslate(intermediateMatrix, intermediateMatrix, scroll());
	});

	const matrix = withValue(mat2dCreate(), (matrix) => {
		mat2dTranslateNegative(matrix, matrix, offsetCenter);
		return mat2dMultiply(matrix, matrix, offsetMatrix());
	});

	return {
		offsetCenter,
		intermediateMatrix,
		matrix,
	};
}
