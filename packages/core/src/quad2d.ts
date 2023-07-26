import { mat2, mat2d, vec2 } from 'gl-matrix'
import * as Rect from './rect'
import * as common from './common'

/**
 * A quad in 2-dimensional space. A quad is a four-sided shape that can be freely transformed by a transformation matrix. Unlike {@link Rect}, its edges are not necessarily axis-aligned.
 */
export type Type = {
  /**
   * The scaling and shearing component of the quad.
   */
  ij: mat2

  /**
   * The translation component of the quad.
   */
  k: vec2
}

export class Instance implements Type {
  ij = mat2.create()
  k = vec2.create()
}

export function create(): Instance {
  return new Instance()
}

/**
 * Create a new quad from a rectangle. The quad will have a translation and scaling that matches the rectangle's position and size.
 */
export function fromRect(out: Type, rect: Readonly<Rect.Type>): Type {
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
export function fromPositionSize(out: Type, position: Readonly<vec2>, size: Readonly<vec2>) {
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
export function transformMat2d(out: Type, quad: Readonly<Type>, matrix: Readonly<mat2d>): Type {
  mat2.multiply(out.ij, quad.ij, matrix as mat2)
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
  source: Readonly<Type>,
  target: Readonly<Type>,
): mat2d {
  mat2.invert(out as mat2, source.ij)
  mat2.multiply(out as mat2, target.ij, out as mat2)
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
  out: Type,
  source: Readonly<Type>,
  aspectRatio: number,
  compare: (a: number, b: number) => number,
) {
  common.setAspectRatio(out.ij, 0, 3, source.ij[0], source.ij[3], aspectRatio, compare)
  vec2.copy(out.k, source.k)
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
  out: Type,
  source: Readonly<Type>,
  target: Readonly<Type>,
  compare: (a: number, b: number) => number,
): Type {
  common.fit(out.ij, 0, 3, source.ij[0], source.ij[3], target.ij[0], target.ij[3], compare)
  vec2.copy(out.k, target.k)
  return out
}

/**
 * @see {@link fit}
 */
export function contain(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
  return fit(out, source, target, Math.min)
}

/**
 * @see {@link fit}
 */
export function cover(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
  return fit(out, source, target, Math.max)
}

/**
 * Returns true if the two quads are approximately equal.
 * @param a - The first quad.
 * @param b - The second quad.
 * @returns True if `a` and `b` are approximately equal, false otherwise.
 */
export function equals(a: Readonly<Type>, b: Readonly<Type>) {
  return mat2.equals(a.ij, b.ij) && vec2.equals(a.k, b.k)
}
