/**
 * Common utilities
 * @module glMatrix
 */

export interface IndexedCollection extends Iterable<number> {
  readonly length: number;
  [index: number]: number;
}

// Configuration Constants
export const EPSILON = 0.000001;
export let ARRAY_TYPE: Float32ArrayConstructor | ArrayConstructor = Array;
export const RANDOM = Math.random;
export const ANGLE_ORDER = "zyx";

/**
 * Symmetric round
 * see https://www.npmjs.com/package/round-half-up-symmetric#user-content-detailed-background
 *
 * @param {Number} a value to round
 */
export function round(a: number): number {
  if (a >= 0) return Math.round(a);

  return a % 0.5 === 0 ? Math.floor(a) : Math.round(a);
}

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
 */
export function setMatrixArrayType(
  type: Float32ArrayConstructor | ArrayConstructor,
): void {
  ARRAY_TYPE = type;
}

const degree = Math.PI / 180;

/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */
export function toRadian(a: number): number {
  return a * degree;
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
  return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}

export function mix(a: number, b: number, t: number) {
  return a + t * (b - a);
}

export function clamp(min: number, max: number, x: number) {
  return Math.min(Math.max(x, min), max);
}

export function copySign(x: number, y: number) {
  return Math.sign(x) === Math.sign(y) ? x : -x;
}

export function square(x: number) {
  return x * x;
}

export function fastNegExp(x: number) {
  // return 1 / (1 + 1.006722 * x + 0.453568 * x * x + 0.254559 * x * x * x);
  return 1 / (1 + 1.119186 * x + 0.097090 * x * x + 0.489114 * x * x * x);
}

// export function fastNegLog(y: number) {
//   return (1 + 1.006722 * x + 0.453568 * x * x + 0.254559 * x * x * x) = 1 / y;
// }

export function fastAtan(x: number) {
  const z = Math.abs(x);
  const w = z > 1 ? 1 / z : z;
  const y = (Math.PI / 4) * w - w * (w - 1) * (0.2447 + 0.0663 * w);
  return copySign(z > 1 ? Math.PI / 2 - y : y, x);
}
