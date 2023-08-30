import { Vec2, set as vec2Set } from '@chloranthy/gl-matrix/vec2'
import type { Mat2d } from '@chloranthy/gl-matrix/mat2d'
import { fit as commonFit, setAspectRatio as commonSetAspectRatio } from './common.js'

/**
 * A rectangle in 2-dimensional space. The rectangle cannot rotate and thus its edges are always axis-aligned. A Rect is a subRect of DOMRect.
 */
export interface Rect {
  /**
   * The x position of the top left corner.
   */
  x: number

  /**
   * The y position of the top left corner.
   */
  y: number

  /**
   * The width of the rectangle.
   */
  width: number

  /**
   * The height of the rectangle.
   */
  height: number
}

/**
 * Creates a new Rect.
 */
export function create(): Rect {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }
}

export function fromPositionSize(out: Rect, position: Readonly<Vec2>, size: Readonly<Vec2>): Rect {
  setPosition(out, position)
  setSize(out, size)
  return out
}

/**
 * Returns the x position of the rectangle's center point.
 */
export function cx(rect: Readonly<Rect>): number {
  return rect.x + rect.width / 2
}

/**
 * Returns the y position of the rectangle's center point.
 */
export function cy(rect: Readonly<Rect>): number {
  return rect.y + rect.height / 2
}

/**
 * Moves the rectangle so that the center point's x position is cx.
 */
export function setcx(rect: Rect, cx: number) {
  rect.x = cx - rect.width / 2
}

/**
 * Moves the rectangle so that the center point's y position is cy.
 */
export function setcy(rect: Rect, cy: number) {
  rect.y = cy - rect.height / 2
}

/**
 * Returns the center point of the rectangle as a vector.
 */
export function position(out: Vec2, rect: Readonly<Rect>): Vec2 {
  return vec2Set(out, cx(rect), cy(rect))
}

/**
 * Returns the width and height of the rectangle as a vector.
 */
export function size(out: Vec2, rect: Readonly<Rect>): Vec2 {
  return vec2Set(out, rect.width, rect.height)
}

/**
 * Sets the center point of the rectangle to a vector.
 */
export function setPosition(out: Rect, position: Readonly<Vec2>): Rect {
  setcx(out, position[0])
  setcy(out, position[1])
  return out
}

export function setSize(out: Rect, size: Readonly<Vec2>): Rect {
  out.width = size[0]
  out.height = size[1]
  return out
}

/**
 * Sets the width and height of a rectangle to match that of a source rectangle while maintaining an aspect ratio.
 * @param out - The receiving rectangle.
 * @param source - The source rectangle.
 * @param aspectRatio - The aspect ratio to set the rectangle to.
 * @param compare - Compares two numbers and returns a third representing the rectangle scale.
 * @returns The receiving rectangle with the position of the source rectangle, and a set aspect ratio.
 */
export function setAspectRatio(
  out: Rect,
  source: Readonly<Rect>,
  aspectRatio: number,
  compare: (a: number, b: number) => number,
): Rect {
  commonSetAspectRatio(out, 'width', 'height', source.width, source.height, aspectRatio, compare)
  setcx(out, cx(source))
  setcy(out, cy(source))
  return out
}

/**
 * Sets the width and height of a rectangle to match that of a target rectangle while maintaining the aspect ratio of a source rectangle.
 * @param out - The receiving rectangle.
 * @param source - The source rectangle. The aspect ratio of this rectangle is maintained.
 * @param target - The target rectangle. The size and position of this rectangle is used.
 * @param compare - Compares two numbers and returns a third representing the rectangle scale.
 * @returns The receiving rectangle with the position and size of the target rectangle, and the aspect ratio of the source rectangle.
 */
export function fit(
  out: Rect,
  source: Readonly<Rect>,
  target: Readonly<Rect>,
  compare: (a: number, b: number) => number,
): Rect {
  commonFit(
    out,
    'width',
    'height',
    source.width,
    source.height,
    target.width,
    target.height,
    compare,
  )
  setcx(out, cx(target))
  setcy(out, cy(target))
  return out
}

export function contain(out: Rect, source: Readonly<Rect>, target: Readonly<Rect>): Rect {
  return fit(out, source, target, Math.min)
}

export function cover(out: Rect, source: Readonly<Rect>, target: Readonly<Rect>): Rect {
  return fit(out, source, target, Math.max)
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
export function untransformMat2d(out: Mat2d, source: Rect, target: Rect) {
  out[0] = target.width / source.width
  out[1] = 0
  out[2] = 0
  out[3] = target.height / source.height
  out[4] = cx(target) - cx(source)
  out[5] = cy(target) - cy(source)
  return out
}
