import type { mat2, mat2d, vec2 } from 'gl-matrix'
import {
  create as mat2Create,
  multiply as mat2Multiply,
  invert as mat2Invert,
  equals as mat2Equals,
} from 'gl-matrix/esm/mat2.js'
import { create as vec2Create, copy as vec2Copy, equals as vec2Equals } from 'gl-matrix/esm/vec2.js'
import { Rect } from './rect.js'
import { fit as commonFit, setAspectRatio as commonSetAspectRatio } from './common.js'

/**
 * A quad in 2-dimensional space. A quad is a four-sided shape that can be freely transformed by a transformation matrix. Unlike {@link Rect}, its edges are not necessarily axis-aligned.
 */
export type Quad2d = {
  /**
   * The scaling and shearing component of the quad.
   */
  ij: mat2

  /**
   * The translation component of the quad.
   */
  k: vec2
}

export function create(): Quad2d {
  return {
    ij: mat2Create(),
    k: vec2Create(),
  }
}

/**
 * Create a new quad from a rectangle. The quad will have a translation and scaling that matches the rectangle's position and size.
 */
export function fromRect(out: Quad2d, rect: Readonly<Rect>): Quad2d {
  const w = rect.width / 2,
    h = rect.height / 2
  out.ij[0] = w
  out.ij[1] = 0
  out.ij[2] = 0
  out.ij[3] = h
  out.k[0] = rect.x + w
  out.k[1] = rect.y + h
  return out
}

/**
 * Create a new quad from a given position and size.
 */
export function fromPositionSize(out: Quad2d, position: Readonly<vec2>, size: Readonly<vec2>) {
  const w = size[0] / 2,
    h = size[1] / 2
  out.ij[0] = w
  out.ij[1] = 0
  out.ij[2] = 0
  out.ij[3] = h
  out.k[0] = position[0]
  out.k[1] = position[1]
  return out
}

/**
 * Transform a quad by the given transformation matrix.
 * @remarks This is equivalent to premultiplying the quad by the matrix.
 */
export function transformMat2d(
  out: Quad2d,
  quad: Readonly<Quad2d>,
  matrix: Readonly<mat2d>,
): Quad2d {
  mat2Multiply(out.ij, quad.ij, matrix as mat2)
  out.k[0] = quad.k[0] + matrix[4]
  out.k[1] = quad.k[1] + matrix[5]
  return out
}

/**
 * Returns the transformation matrix that transforms space from one quad to another.
 * @remarks This is equivalent to premultiplying the target quad by the inverse of the source quad.
 */
export function untransformMat2d(
  out: mat2d,
  source: Readonly<Quad2d>,
  target: Readonly<Quad2d>,
): mat2d {
  mat2Invert(out as mat2, source.ij)
  mat2Multiply(out as mat2, target.ij, out as mat2)
  out[4] = target.k[0] - source.k[0]
  out[5] = target.k[1] - source.k[1]
  return out
}

/**
 * Sets the scaling of a quad to match that of a source quad while maintaining an aspect ratio.
 * @param out - The receiving quad.
 * @param source - The source quad.
 * @param aspectRatio - The aspect ratio to set the quad to.
 * @param compare - Compares two numbers and returns a third representing the quad scaling.
 * @returns The receiving quad with the position of the source quad, and a set aspect ratio.
 */
export function setAspectRatio(
  out: Quad2d,
  source: Readonly<Quad2d>,
  aspectRatio: number,
  compare: (a: number, b: number) => number,
) {
  commonSetAspectRatio(out.ij, 0, 3, source.ij[0], source.ij[3], aspectRatio, compare)
  vec2Copy(out.k, source.k)
}

/**
 * Sets the scaling of a quad to match that of a target quad while maintaining the aspect ratio of a source quad.
 * @param out - The receiving quad.
 * @param source - The source quad. The aspect ratio of this quad is maintained.
 * @param target - The target quad. The size and position of this quad is used.
 * @param compare - Compares two numbers and returns a third representing the quad scale.
 * @returns The receiving quad with the position and size of the target quad, and the aspect ratio of the source quad.
 */
export function fit(
  out: Quad2d,
  source: Readonly<Quad2d>,
  target: Readonly<Quad2d>,
  compare: (a: number, b: number) => number,
): Quad2d {
  commonFit(out.ij, 0, 3, source.ij[0], source.ij[3], target.ij[0], target.ij[3], compare)
  vec2Copy(out.k, target.k)
  return out
}

/**
 * @see {@link fit}
 */
export function contain(out: Quad2d, source: Readonly<Quad2d>, target: Readonly<Quad2d>): Quad2d {
  return fit(out, source, target, Math.min)
}

/**
 * @see {@link fit}
 */
export function cover(out: Quad2d, source: Readonly<Quad2d>, target: Readonly<Quad2d>): Quad2d {
  return fit(out, source, target, Math.max)
}

/**
 * Returns true if the two quads are approximately equal.
 * @param a - The first quad.
 * @param b - The second quad.
 * @returns True if `a` and `b` are approximately equal, false otherwise.
 */
export function equals(a: Readonly<Quad2d>, b: Readonly<Quad2d>) {
  return mat2Equals(a.ij, b.ij) && vec2Equals(a.k, b.k)
}
