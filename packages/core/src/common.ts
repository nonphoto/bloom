/**
 * Common utilities
 * @module glMatrix
 */

export interface IndexedCollection extends Iterable<number> {
  readonly length: number
  [index: number]: number
}

// Configuration Constants
export const EPSILON = 0.000001
export let ARRAY_TYPE: Float32ArrayConstructor | ArrayConstructor = Array
export const RANDOM = Math.random
export const ANGLE_ORDER = 'zyx'

/**
 * Symmetric round
 * see https://www.npmjs.com/package/round-half-up-symmetric#user-content-detailed-background
 *
 * @param {Number} a value to round
 */
export function round(a: number): number {
  if (a >= 0) return Math.round(a)

  return a % 0.5 === 0 ? Math.floor(a) : Math.round(a)
}

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
 */
export function setMatrixArrayType(type: Float32ArrayConstructor | ArrayConstructor): void {
  ARRAY_TYPE = type
}

const degree = Math.PI / 180

/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */
export function toRadian(a: number): number {
  return a * degree
}

/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
export function equals(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b))
}

export function mix(a: number, b: number, t: number) {
  return a + t * (b - a)
}
