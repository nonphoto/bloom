import { mix } from "./common";
import { Mat2d } from "./mat2d";
import { ReadonlyVec2, Vec2, vec2Set } from "./vec2";

/**
 * A rectangle in 2-dimensional space. The rectangle cannot rotate and thus its edges are always axis-aligned. A Rect is a subRect of DOMRect.
 */
export interface Rect {
	/**
	 * The x position of the top left corner.
	 */
	x: number;

	/**
	 * The y position of the top left corner.
	 */
	y: number;

	/**
	 * The width of the rectangle.
	 */
	width: number;

	/**
	 * The height of the rectangle.
	 */
	height: number;
}

export type ReadonlyRect = Readonly<Rect>;

/**
 * Creates a new Rect.
 */
export function rectCreate(): Rect {
	return {
		x: 0,
		y: 0,
		width: 1,
		height: 1,
	};
}

export function rectFromPositionSize(
	out: Rect,
	position: ReadonlyVec2,
	size: ReadonlyVec2,
): Rect {
	out.width = size[0];
	out.height = size[1];
	out.x = position[0] - size[0] / 2;
	out.y = position[1] - size[1] / 2;
	return out;
}

/**
 * Returns the x position of the rectangle's center point.
 */
export function rectCenterX(rect: ReadonlyRect): number {
	return rect.x + rect.width / 2;
}

/**
 * Moves the rectangle so that the center point's x position is cx.
 */
export function rectSetCenterX(
	out: Rect,
	rect: ReadonlyRect,
	cx: number,
): Rect {
	out.x = cx - rect.width / 2;
	return out;
}

/**
 * Returns the y position of the rectangle's center point.
 */
export function rectCenterY(rect: ReadonlyRect): number {
	return rect.y + rect.height / 2;
}

/**
 * Moves the rectangle so that the center point's y position is cy.
 */
export function rectSetCenterY(
	out: Rect,
	rect: ReadonlyRect,
	cy: number,
): Rect {
	out.y = cy - rect.height / 2;
	return out;
}

/**
 * Returns the center point of the rectangle as a vector.
 */
export function rectCenter(out: Vec2, rect: ReadonlyRect): Vec2 {
	return vec2Set(out, rectCenterX(rect), rectCenterY(rect));
}

export function rectSetCenter(
	out: Rect,
	rect: ReadonlyRect,
	center: Vec2,
): Rect {
	rectSetCenterX(out, rect, center[0]);
	rectSetCenterX(out, rect, center[1]);
	return out;
}

export function rectCopyCenter(
	out: Rect,
	source: ReadonlyRect,
	target: ReadonlyRect,
): Rect {
	rectSetCenterX(out, source, rectCenterX(target));
	rectSetCenterY(out, source, rectCenterY(target));
	return out;
}

/**
 * Returns the width and height of the rectangle as a vector.
 */
export function rectSize(out: Vec2, rect: ReadonlyRect): Vec2 {
	return vec2Set(out, rect.width, rect.height);
}

/**
 * Sets the width and height of a rectangle to match that of a source rectangle while maintaining an aspect ratio.
 * @param out - The receiving rectangle.
 * @param source - The source rectangle.
 * @param aspectRatio - The aspect ratio to set the rectangle to.
 * @param compare - Compares two numbers and returns a third representing the rectangle scale.
 * @returns The receiving rectangle with the position of the source rectangle, and a set aspect ratio.
 */
export function rectSetAspectRatio(
	out: Rect,
	source: ReadonlyRect,
	aspectRatio: number,
	compare: (a: number, b: number) => number,
): Rect {
	const sy =
		source.height === 0
			? aspectRatio
			: (source.width * aspectRatio) / source.height;
	const s = compare(1, sy);
	out.width = source.width * s;
	out.height = source.height * s;
	rectCopyCenter(out, out, source);
	return out;
}

/**
 * Sets the width and height of a rectangle to match that of a target rectangle while maintaining the aspect ratio of a source rectangle.
 * @param out - The receiving rectangle.
 * @param source - The source rectangle. The aspect ratio of this rectangle is maintained.
 * @param target - The target rectangle. The size and position of this rectangle is used.
 * @param compare - Compares two numbers and returns a third representing the rectangle scale.
 * @returns The receiving rectangle with the position and size of the target rectangle, and the aspect ratio of the source rectangle.
 */
export function rectFit(
	out: Rect,
	source: ReadonlyRect,
	target: ReadonlyRect,
	compare: (a: number, b: number) => number,
): Rect {
	const sx = target.width / source.width;
	const sy = target.height / source.height;
	const s = compare(sx, sy);
	out.width = source.width * s;
	out.height = source.height * s;
	rectCopyCenter(out, out, target);
	return out;
}

export function rectContain(
	out: Rect,
	source: ReadonlyRect,
	target: ReadonlyRect,
): Rect {
	return rectFit(out, source, target, Math.min);
}

export function rectCover(
	out: Rect,
	source: ReadonlyRect,
	target: ReadonlyRect,
): Rect {
	return rectFit(out, source, target, Math.max);
}

export function rectMix(
	out: Rect,
	source: ReadonlyRect,
	target: ReadonlyRect,
	t: number,
): Rect {
	out.x = mix(source.x, target.x, t);
	out.y = mix(source.y, target.y, t);
	out.width = mix(source.width, target.width, t);
	out.height = mix(source.height, target.height, t);
	return out;
}

/**
 * Returns the transformation matrix that transforms space from one rectangle to another.
 *
 * @remarks There is no `transformMat2d` function because rectangles are always axis aligned; therefore they cannot be transformed by a matrix.
 *
 * @param out - The receiving matrix.
 * @param source - The source rectangle.
 * @param target - The target rectangle.
 * @returns The receiving matrix that represents a transformation from the source rectangle to the target rectangle.
 */
export function rectUntransformMat2d(out: Mat2d, source: Rect, target: Rect) {
	out[0] = target.width / source.width;
	out[1] = 0;
	out[2] = 0;
	out[3] = target.height / source.height;
	out[4] = rectCenterX(target) - rectCenterX(source);
	out[5] = rectCenterY(target) - rectCenterY(source);
	return out;
}
