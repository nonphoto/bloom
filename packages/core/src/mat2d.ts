import { ARRAY_TYPE, EPSILON, type IndexedCollection } from "./common";
import type { ReadonlyVec2, Vec2 } from "./vec2";

// prettier-ignore
export type Mat2d =
  | [number, number,
     number, number,
     number, number]
  | IndexedCollection;

// prettier-ignore
export type ReadonlyMat2d =
  | readonly [
      number, number,
      number, number,
      number, number
    ]
  | IndexedCollection;

/**
 * Creates a new identity Mat2d
 *
 * @returns {Mat2d} a new 2x3 matrix
 */
export function mat2dCreate(): Mat2d {
	let out = new ARRAY_TYPE(6);
	if (ARRAY_TYPE != Float32Array) {
		out[1] = 0;
		out[2] = 0;
		out[4] = 0;
		out[5] = 0;
	}
	out[0] = 1;
	out[3] = 1;
	return out;
}

/**
 * Creates a new Mat2d initialized with values from an existing matrix
 *
 * @param {ReadonlyMat2d} a matrix to clone
 * @returns {Mat2d} a new 2x3 matrix
 */
export function mat2dClone(a: ReadonlyMat2d): Mat2d {
	let out = new ARRAY_TYPE(6);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	return out;
}

/**
 * Copy the values from one Mat2d to another
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {Mat2d} out
 */
export function mat2dCopy(out: Mat2d, a: ReadonlyMat2d): Mat2d {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	return out;
}

/**
 * Set a Mat2d to the identity matrix
 *
 * @param {Mat2d} out the receiving matrix
 * @returns {Mat2d} out
 */
export function mat2dIdentity(out: Mat2d): Mat2d {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	out[4] = 0;
	out[5] = 0;
	return out;
}

/**
 * Create a new Mat2d with the given values
 *
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {Mat2d} A new Mat2d
 */
export function mat2dFromValues(
	a: number,
	b: number,
	c: number,
	d: number,
	tx: number,
	ty: number,
): Mat2d {
	let out = new ARRAY_TYPE(6);
	out[0] = a;
	out[1] = b;
	out[2] = c;
	out[3] = d;
	out[4] = tx;
	out[5] = ty;
	return out;
}

/**
 * Set the components of a Mat2d to the given values
 *
 * @param {Mat2d} out the receiving matrix
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {Mat2d} out
 */
export function mat2dSet(
	out: Mat2d,
	a: number,
	b: number,
	c: number,
	d: number,
	tx: number,
	ty: number,
): Mat2d {
	out[0] = a;
	out[1] = b;
	out[2] = c;
	out[3] = d;
	out[4] = tx;
	out[5] = ty;
	return out;
}

/**
 * Inverts a Mat2d
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {Mat2d} out
 */
export function mat2dInvert(out: Mat2d, a: ReadonlyMat2d): Mat2d | null {
	let aa = a[0],
		ab = a[1],
		ac = a[2],
		ad = a[3];
	let atx = a[4],
		aty = a[5];

	let det = aa * ad - ab * ac;
	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = ad * det;
	out[1] = -ab * det;
	out[2] = -ac * det;
	out[3] = aa * det;
	out[4] = (ac * aty - ad * atx) * det;
	out[5] = (ab * atx - aa * aty) * det;
	return out;
}

/**
 * Calculates the determinant of a Mat2d
 *
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {Number} determinant of a
 */
export function mat2dDeterminant(a: ReadonlyMat2d): number {
	return a[0] * a[3] - a[1] * a[2];
}

/**
 * Multiplies two Mat2d's
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {Mat2d} out
 */
export function mat2dMultiply(
	out: Mat2d,
	a: ReadonlyMat2d,
	b: ReadonlyMat2d,
): Mat2d {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3],
		a4 = a[4],
		a5 = a[5];
	let b0 = b[0],
		b1 = b[1],
		b2 = b[2],
		b3 = b[3],
		b4 = b[4],
		b5 = b[5];
	out[0] = a0 * b0 + a2 * b1;
	out[1] = a1 * b0 + a3 * b1;
	out[2] = a0 * b2 + a2 * b3;
	out[3] = a1 * b2 + a3 * b3;
	out[4] = a0 * b4 + a2 * b5 + a4;
	out[5] = a1 * b4 + a3 * b5 + a5;
	return out;
}

/**
 * Rotates a Mat2d by the given angle
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {Mat2d} out
 */
export function mat2dRotate(out: Mat2d, a: ReadonlyMat2d, rad: number): Mat2d {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3],
		a4 = a[4],
		a5 = a[5];
	let s = Math.sin(rad);
	let c = Math.cos(rad);
	out[0] = a0 * c + a2 * s;
	out[1] = a1 * c + a3 * s;
	out[2] = a0 * -s + a2 * c;
	out[3] = a1 * -s + a3 * c;
	out[4] = a4;
	out[5] = a5;
	return out;
}

/**
 * Scales the Mat2d by the dimensions in the given vec2
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {Mat2d} out
 **/
export function mat2dScale(
	out: Mat2d,
	a: ReadonlyMat2d,
	v: ReadonlyVec2,
): Mat2d {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3],
		a4 = a[4],
		a5 = a[5];
	let v0 = v[0],
		v1 = v[1];
	out[0] = a0 * v0;
	out[1] = a1 * v0;
	out[2] = a2 * v1;
	out[3] = a3 * v1;
	out[4] = a4;
	out[5] = a5;
	return out;
}

/**
 * Translates the Mat2d by the dimensions in the given vec2
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to translate the matrix by
 * @returns {Mat2d} out
 **/
export function mat2dTranslate(
	out: Mat2d,
	a: ReadonlyMat2d,
	v: ReadonlyVec2,
): Mat2d {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3],
		a4 = a[4],
		a5 = a[5];
	let v0 = v[0],
		v1 = v[1];
	out[0] = a0;
	out[1] = a1;
	out[2] = a2;
	out[3] = a3;
	out[4] = a0 * v0 + a2 * v1 + a4;
	out[5] = a1 * v0 + a3 * v1 + a5;
	return out;
}

/**
 * Translates the Mat2d by the dimensions in the given vec2
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to translate the matrix by
 * @returns {Mat2d} out
 **/
export function mat2dTranslateNegative(
	out: Mat2d,
	a: ReadonlyMat2d,
	v: ReadonlyVec2,
): Mat2d {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3],
		a4 = a[4],
		a5 = a[5];
	let v0 = v[0],
		v1 = v[1];
	out[0] = a0;
	out[1] = a1;
	out[2] = a2;
	out[3] = a3;
	out[4] = a0 * v0 + a2 * v1 - a4;
	out[5] = a1 * v0 + a3 * v1 - a5;
	return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     Mat2d.identity(dest);
 *     Mat2d.rotate(dest, dest, rad);
 *
 * @param {Mat2d} out Mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {Mat2d} out
 */
export function mat2dFromRotation(out: Mat2d, rad: number): Mat2d {
	let s = Math.sin(rad),
		c = Math.cos(rad);
	out[0] = c;
	out[1] = s;
	out[2] = -s;
	out[3] = c;
	out[4] = 0;
	out[5] = 0;
	return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     Mat2d.identity(dest);
 *     Mat2d.scale(dest, dest, vec);
 *
 * @param {Mat2d} out Mat2d receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {Mat2d} out
 */
export function mat2dFromScaling(out: Mat2d, v: ReadonlyVec2): Mat2d {
	out[0] = v[0];
	out[1] = 0;
	out[2] = 0;
	out[3] = v[1];
	out[4] = 0;
	out[5] = 0;
	return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     Mat2d.identity(dest);
 *     Mat2d.translate(dest, dest, vec);
 *
 * @param {Mat2d} out Mat2d receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {Mat2d} out
 */
export function mat2dFromTranslation(out: Mat2d, v: ReadonlyVec2): Mat2d {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	out[4] = v[0];
	out[5] = v[1];
	return out;
}

export function mat2dScaling(out: Vec2, a: ReadonlyMat2d): Vec2 {
	let m11 = a[0];
	let m12 = a[1];
	let m21 = a[2];
	let m22 = a[3];
	out[0] = Math.hypot(m11, m12);
	out[1] = Math.hypot(m21, m22);
	return out;
}

/**
 * Returns a string representation of a Mat2d
 *
 * @param {ReadonlyMat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
export function mat2dStr(a: ReadonlyMat2d): string {
	return (
		"Mat2d(" +
		a[0] +
		", " +
		a[1] +
		", " +
		a[2] +
		", " +
		a[3] +
		", " +
		a[4] +
		", " +
		a[5] +
		")"
	);
}

/**
 * Returns Frobenius norm of a Mat2d
 *
 * @param {ReadonlyMat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
export function mat2dFrob(a: ReadonlyMat2d): number {
	return Math.sqrt(
		a[0] * a[0] +
			a[1] * a[1] +
			a[2] * a[2] +
			a[3] * a[3] +
			a[4] * a[4] +
			a[5] * a[5] +
			1,
	);
}

/**
 * Adds two Mat2d's
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {Mat2d} out
 */
export function mat2dAdd(
	out: Mat2d,
	a: ReadonlyMat2d,
	b: ReadonlyMat2d,
): Mat2d {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	out[3] = a[3] + b[3];
	out[4] = a[4] + b[4];
	out[5] = a[5] + b[5];
	return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {Mat2d} out
 */
export function mat2dSubtract(
	out: Mat2d,
	a: ReadonlyMat2d,
	b: ReadonlyMat2d,
): Mat2d {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	out[3] = a[3] - b[3];
	out[4] = a[4] - b[4];
	out[5] = a[5] - b[5];
	return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {Mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {Mat2d} out
 */
export function mat2dMultiplyScalar(
	out: Mat2d,
	a: ReadonlyMat2d,
	b: number,
): Mat2d {
	out[0] = a[0] * b;
	out[1] = a[1] * b;
	out[2] = a[2] * b;
	out[3] = a[3] * b;
	out[4] = a[4] * b;
	out[5] = a[5] * b;
	return out;
}

/**
 * Adds two Mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param {Mat2d} out the receiving vector
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {Mat2d} out
 */
export function mat2dMultiplyScalarAndAdd(
	out: Mat2d,
	a: ReadonlyMat2d,
	b: ReadonlyMat2d,
	scale: number,
): Mat2d {
	out[0] = a[0] + b[0] * scale;
	out[1] = a[1] + b[1] * scale;
	out[2] = a[2] + b[2] * scale;
	out[3] = a[3] + b[3] * scale;
	out[4] = a[4] + b[4] * scale;
	out[5] = a[5] + b[5] * scale;
	return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
export function mat2dExactEquals(a: ReadonlyMat2d, b: ReadonlyMat2d): boolean {
	return (
		a[0] === b[0] &&
		a[1] === b[1] &&
		a[2] === b[2] &&
		a[3] === b[3] &&
		a[4] === b[4] &&
		a[5] === b[5]
	);
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
export function mat2dEquals(a: ReadonlyMat2d, b: ReadonlyMat2d): boolean {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3],
		a4 = a[4],
		a5 = a[5];
	let b0 = b[0],
		b1 = b[1],
		b2 = b[2],
		b3 = b[3],
		b4 = b[4],
		b5 = b[5];
	return (
		Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
		Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
		Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
		Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
		Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
		Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5))
	);
}

/**
 * Alias for {@link mat2dMultiply}
 * @function
 */
export const mat2dMul = mat2dMultiply;

/**
 * Alias for {@link mat2dSubtract}
 * @function
 */
export const mat2dSub = mat2dSubtract;
