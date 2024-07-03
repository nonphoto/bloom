import { ARRAY_TYPE, EPSILON, type IndexedCollection } from "./common";
import type { ReadonlyMat2d } from "./mat2d";
import type { ReadonlyMat4 } from "./mat4";
import type { ReadonlyQuat } from "./quat";
import type { ReadonlyVec2 } from "./vec2";

// prettier-ignore
export type ReadonlyMat3 =
  | readonly [
      number, number, number,
      number, number, number,
      number, number, number
    ]
  | IndexedCollection;

// prettier-ignore
export type Mat3 =
  | [number, number, number,
     number, number, number,
     number, number, number]
  | IndexedCollection;

/**
 * Creates a new identity Mat3
 *
 * @returns {Mat3} a new 3x3 matrix
 */
export function mat3Create(): Mat3 {
	let out = new ARRAY_TYPE(9);
	if (ARRAY_TYPE != Float32Array) {
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[5] = 0;
		out[6] = 0;
		out[7] = 0;
	}
	out[0] = 1;
	out[4] = 1;
	out[8] = 1;
	return out;
}

/**
 * Copies the upper-left 3x3 values into the given Mat3.
 *
 * @param {Mat3} out the receiving 3x3 matrix
 * @param {ReadonlyMat4} a   the source 4x4 matrix
 * @returns {Mat3} out
 */
export function mat3FromMat4(out: Mat3, a: ReadonlyMat4): Mat3 {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[4];
	out[4] = a[5];
	out[5] = a[6];
	out[6] = a[8];
	out[7] = a[9];
	out[8] = a[10];
	return out;
}

/**
 * Creates a new Mat3 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat3} a matrix to clone
 * @returns {Mat3} a new 3x3 matrix
 */
export function mat3Clone(a: ReadonlyMat3): Mat3 {
	let out = new ARRAY_TYPE(9);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	return out;
}

/**
 * Copy the values from one Mat3 to another
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Mat3} out
 */
export function mat3Copy(out: Mat3, a: ReadonlyMat3): Mat3 {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	return out;
}

/**
 * Create a new Mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {Mat3} A new Mat3
 */
export function mat3FromValues(
	m00: number,
	m01: number,
	m02: number,
	m10: number,
	m11: number,
	m12: number,
	m20: number,
	m21: number,
	m22: number,
): Mat3 {
	let out = new ARRAY_TYPE(9);
	out[0] = m00;
	out[1] = m01;
	out[2] = m02;
	out[3] = m10;
	out[4] = m11;
	out[5] = m12;
	out[6] = m20;
	out[7] = m21;
	out[8] = m22;
	return out;
}

/**
 * Set the components of a Mat3 to the given values
 *
 * @param {Mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {Mat3} out
 */
export function mat3Set(
	out: Mat3,
	m00: number,
	m01: number,
	m02: number,
	m10: number,
	m11: number,
	m12: number,
	m20: number,
	m21: number,
	m22: number,
): Mat3 {
	out[0] = m00;
	out[1] = m01;
	out[2] = m02;
	out[3] = m10;
	out[4] = m11;
	out[5] = m12;
	out[6] = m20;
	out[7] = m21;
	out[8] = m22;
	return out;
}

/**
 * Set a Mat3 to the identity matrix
 *
 * @param {Mat3} out the receiving matrix
 * @returns {Mat3} out
 */
export function mat3Identity(out: Mat3): Mat3 {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 1;
	out[5] = 0;
	out[6] = 0;
	out[7] = 0;
	out[8] = 1;
	return out;
}

/**
 * Transpose the values of a Mat3
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Mat3} out
 */
export function mat3Transpose(out: Mat3, a: ReadonlyMat3): Mat3 {
	// If we are transposing ourselves we can skip a few steps but have to cache some values
	if (out === a) {
		let a01 = a[1],
			a02 = a[2],
			a12 = a[5];
		out[1] = a[3];
		out[2] = a[6];
		out[3] = a01;
		out[5] = a[7];
		out[6] = a02;
		out[7] = a12;
	} else {
		out[0] = a[0];
		out[1] = a[3];
		out[2] = a[6];
		out[3] = a[1];
		out[4] = a[4];
		out[5] = a[7];
		out[6] = a[2];
		out[7] = a[5];
		out[8] = a[8];
	}

	return out;
}

/**
 * Inverts a Mat3
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Mat3} out
 */
export function mat3Invert(out: Mat3, a: ReadonlyMat3): Mat3 | null {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2];
	let a10 = a[3],
		a11 = a[4],
		a12 = a[5];
	let a20 = a[6],
		a21 = a[7],
		a22 = a[8];

	let b01 = a22 * a11 - a12 * a21;
	let b11 = -a22 * a10 + a12 * a20;
	let b21 = a21 * a10 - a11 * a20;

	// Calculate the determinant
	let det = a00 * b01 + a01 * b11 + a02 * b21;

	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = b01 * det;
	out[1] = (-a22 * a01 + a02 * a21) * det;
	out[2] = (a12 * a01 - a02 * a11) * det;
	out[3] = b11 * det;
	out[4] = (a22 * a00 - a02 * a20) * det;
	out[5] = (-a12 * a00 + a02 * a10) * det;
	out[6] = b21 * det;
	out[7] = (-a21 * a00 + a01 * a20) * det;
	out[8] = (a11 * a00 - a01 * a10) * det;
	return out;
}

/**
 * Calculates the adjugate of a Mat3
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Mat3} out
 */
export function mat3Adjoint(out: Mat3, a: ReadonlyMat3): Mat3 {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2];
	let a10 = a[3],
		a11 = a[4],
		a12 = a[5];
	let a20 = a[6],
		a21 = a[7],
		a22 = a[8];

	out[0] = a11 * a22 - a12 * a21;
	out[1] = a02 * a21 - a01 * a22;
	out[2] = a01 * a12 - a02 * a11;
	out[3] = a12 * a20 - a10 * a22;
	out[4] = a00 * a22 - a02 * a20;
	out[5] = a02 * a10 - a00 * a12;
	out[6] = a10 * a21 - a11 * a20;
	out[7] = a01 * a20 - a00 * a21;
	out[8] = a00 * a11 - a01 * a10;
	return out;
}

/**
 * Calculates the determinant of a Mat3
 *
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Number} determinant of a
 */
export function mat3Determinant(a: ReadonlyMat3): number {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2];
	let a10 = a[3],
		a11 = a[4],
		a12 = a[5];
	let a20 = a[6],
		a21 = a[7],
		a22 = a[8];

	return (
		a00 * (a22 * a11 - a12 * a21) +
		a01 * (-a22 * a10 + a12 * a20) +
		a02 * (a21 * a10 - a11 * a20)
	);
}

/**
 * Multiplies two Mat3's
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {Mat3} out
 */
export function mat3Multiply(
	out: Mat3,
	a: ReadonlyMat3,
	b: ReadonlyMat3,
): Mat3 {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2];
	let a10 = a[3],
		a11 = a[4],
		a12 = a[5];
	let a20 = a[6],
		a21 = a[7],
		a22 = a[8];

	let b00 = b[0],
		b01 = b[1],
		b02 = b[2];
	let b10 = b[3],
		b11 = b[4],
		b12 = b[5];
	let b20 = b[6],
		b21 = b[7],
		b22 = b[8];

	out[0] = b00 * a00 + b01 * a10 + b02 * a20;
	out[1] = b00 * a01 + b01 * a11 + b02 * a21;
	out[2] = b00 * a02 + b01 * a12 + b02 * a22;

	out[3] = b10 * a00 + b11 * a10 + b12 * a20;
	out[4] = b10 * a01 + b11 * a11 + b12 * a21;
	out[5] = b10 * a02 + b11 * a12 + b12 * a22;

	out[6] = b20 * a00 + b21 * a10 + b22 * a20;
	out[7] = b20 * a01 + b21 * a11 + b22 * a21;
	out[8] = b20 * a02 + b21 * a12 + b22 * a22;
	return out;
}

/**
 * Translate a Mat3 by the given vector
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to translate
 * @param {ReadonlyVec2} v vector to translate by
 * @returns {Mat3} out
 */
export function mat3Translate(
	out: Mat3,
	a: ReadonlyMat3,
	v: ReadonlyVec2,
): Mat3 {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a10 = a[3],
		a11 = a[4],
		a12 = a[5],
		a20 = a[6],
		a21 = a[7],
		a22 = a[8],
		x = v[0],
		y = v[1];

	out[0] = a00;
	out[1] = a01;
	out[2] = a02;

	out[3] = a10;
	out[4] = a11;
	out[5] = a12;

	out[6] = x * a00 + y * a10 + a20;
	out[7] = x * a01 + y * a11 + a21;
	out[8] = x * a02 + y * a12 + a22;
	return out;
}

/**
 * Rotates a Mat3 by the given angle
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {Mat3} out
 */
export function mat3Rotate(out: Mat3, a: ReadonlyMat3, rad: number): Mat3 {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a10 = a[3],
		a11 = a[4],
		a12 = a[5],
		a20 = a[6],
		a21 = a[7],
		a22 = a[8],
		s = Math.sin(rad),
		c = Math.cos(rad);

	out[0] = c * a00 + s * a10;
	out[1] = c * a01 + s * a11;
	out[2] = c * a02 + s * a12;

	out[3] = c * a10 - s * a00;
	out[4] = c * a11 - s * a01;
	out[5] = c * a12 - s * a02;

	out[6] = a20;
	out[7] = a21;
	out[8] = a22;
	return out;
}

/**
 * Scales the Mat3 by the dimensions in the given vec2
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to scale
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {Mat3} out
 **/
export function mat3Scale(out: Mat3, a: ReadonlyMat3, v: ReadonlyVec2): Mat3 {
	let x = v[0],
		y = v[1];

	out[0] = x * a[0];
	out[1] = x * a[1];
	out[2] = x * a[2];

	out[3] = y * a[3];
	out[4] = y * a[4];
	out[5] = y * a[5];

	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     Mat3.identity(dest);
 *     Mat3.translate(dest, dest, vec);
 *
 * @param {Mat3} out Mat3 receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {Mat3} out
 */
export function mat3FromTranslation(out: Mat3, v: ReadonlyVec2): Mat3 {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 1;
	out[5] = 0;
	out[6] = v[0];
	out[7] = v[1];
	out[8] = 1;
	return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     Mat3.identity(dest);
 *     Mat3.rotate(dest, dest, rad);
 *
 * @param {Mat3} out Mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {Mat3} out
 */
export function mat3FromRotation(out: Mat3, rad: number): Mat3 {
	let s = Math.sin(rad),
		c = Math.cos(rad);

	out[0] = c;
	out[1] = s;
	out[2] = 0;

	out[3] = -s;
	out[4] = c;
	out[5] = 0;

	out[6] = 0;
	out[7] = 0;
	out[8] = 1;
	return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     Mat3.identity(dest);
 *     Mat3.scale(dest, dest, vec);
 *
 * @param {Mat3} out Mat3 receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {Mat3} out
 */
export function mat3FromScaling(out: Mat3, v: ReadonlyVec2): Mat3 {
	out[0] = v[0];
	out[1] = 0;
	out[2] = 0;

	out[3] = 0;
	out[4] = v[1];
	out[5] = 0;

	out[6] = 0;
	out[7] = 0;
	out[8] = 1;
	return out;
}

/**
 * Copies the values from a mat2d into a Mat3
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to copy
 * @returns {Mat3} out
 **/
export function mat3FromMat2d(out: Mat3, a: ReadonlyMat2d): Mat3 {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = 0;

	out[3] = a[2];
	out[4] = a[3];
	out[5] = 0;

	out[6] = a[4];
	out[7] = a[5];
	out[8] = 1;
	return out;
}

/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param {Mat3} out Mat3 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {Mat3} out
 */
export function mat3FromQuat(out: Mat3, q: ReadonlyQuat): Mat3 {
	let x = q[0],
		y = q[1],
		z = q[2],
		w = q[3];
	let x2 = x + x;
	let y2 = y + y;
	let z2 = z + z;

	let xx = x * x2;
	let yx = y * x2;
	let yy = y * y2;
	let zx = z * x2;
	let zy = z * y2;
	let zz = z * z2;
	let wx = w * x2;
	let wy = w * y2;
	let wz = w * z2;

	out[0] = 1 - yy - zz;
	out[3] = yx - wz;
	out[6] = zx + wy;

	out[1] = yx + wz;
	out[4] = 1 - xx - zz;
	out[7] = zy - wx;

	out[2] = zx - wy;
	out[5] = zy + wx;
	out[8] = 1 - xx - yy;

	return out;
}

/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 *
 * @param {Mat3} out Mat3 receiving operation result
 * @param {ReadonlyMat4} a Mat4 to derive the normal matrix from
 *
 * @returns {Mat3} out
 */
export function mat3NormalFromMat4(out: Mat3, a: ReadonlyMat4): Mat3 | null {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a03 = a[3];
	let a10 = a[4],
		a11 = a[5],
		a12 = a[6],
		a13 = a[7];
	let a20 = a[8],
		a21 = a[9],
		a22 = a[10],
		a23 = a[11];
	let a30 = a[12],
		a31 = a[13],
		a32 = a[14],
		a33 = a[15];

	let b00 = a00 * a11 - a01 * a10;
	let b01 = a00 * a12 - a02 * a10;
	let b02 = a00 * a13 - a03 * a10;
	let b03 = a01 * a12 - a02 * a11;
	let b04 = a01 * a13 - a03 * a11;
	let b05 = a02 * a13 - a03 * a12;
	let b06 = a20 * a31 - a21 * a30;
	let b07 = a20 * a32 - a22 * a30;
	let b08 = a20 * a33 - a23 * a30;
	let b09 = a21 * a32 - a22 * a31;
	let b10 = a21 * a33 - a23 * a31;
	let b11 = a22 * a33 - a23 * a32;

	// Calculate the determinant
	let det =
		b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

	out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

	out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

	return out;
}

/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param {Mat3} out Mat3 frustum matrix will be written into
 * @param {number} width Width of your gl context
 * @param {number} height Height of gl context
 * @returns {Mat3} out
 */
export function mat3Projection(out: Mat3, width: number, height: number): Mat3 {
	out[0] = 2 / width;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = -2 / height;
	out[5] = 0;
	out[6] = -1;
	out[7] = 1;
	out[8] = 1;
	return out;
}

/**
 * Returns a string representation of a Mat3
 *
 * @param {ReadonlyMat3} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
export function mat3Str(a: ReadonlyMat3): string {
	return (
		"Mat3(" +
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
		", " +
		a[6] +
		", " +
		a[7] +
		", " +
		a[8] +
		")"
	);
}

/**
 * Returns Frobenius norm of a Mat3
 *
 * @param {ReadonlyMat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
export function mat3Frob(a: ReadonlyMat3): number {
	return Math.sqrt(
		a[0] * a[0] +
			a[1] * a[1] +
			a[2] * a[2] +
			a[3] * a[3] +
			a[4] * a[4] +
			a[5] * a[5] +
			a[6] * a[6] +
			a[7] * a[7] +
			a[8] * a[8],
	);
}

/**
 * Adds two Mat3's
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {Mat3} out
 */
export function mat3Add(out: Mat3, a: ReadonlyMat3, b: ReadonlyMat3): Mat3 {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	out[3] = a[3] + b[3];
	out[4] = a[4] + b[4];
	out[5] = a[5] + b[5];
	out[6] = a[6] + b[6];
	out[7] = a[7] + b[7];
	out[8] = a[8] + b[8];
	return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {Mat3} out
 */
export function mat3Subtract(
	out: Mat3,
	a: ReadonlyMat3,
	b: ReadonlyMat3,
): Mat3 {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	out[3] = a[3] - b[3];
	out[4] = a[4] - b[4];
	out[5] = a[5] - b[5];
	out[6] = a[6] - b[6];
	out[7] = a[7] - b[7];
	out[8] = a[8] - b[8];
	return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {Mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {Mat3} out
 */
export function mat3MultiplyScalar(
	out: Mat3,
	a: ReadonlyMat3,
	b: number,
): Mat3 {
	out[0] = a[0] * b;
	out[1] = a[1] * b;
	out[2] = a[2] * b;
	out[3] = a[3] * b;
	out[4] = a[4] * b;
	out[5] = a[5] * b;
	out[6] = a[6] * b;
	out[7] = a[7] * b;
	out[8] = a[8] * b;
	return out;
}

/**
 * Adds two Mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {Mat3} out the receiving vector
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {Mat3} out
 */
export function mat3MultiplyScalarAndAdd(
	out: Mat3,
	a: ReadonlyMat3,
	b: ReadonlyMat3,
	scale: number,
): Mat3 {
	out[0] = a[0] + b[0] * scale;
	out[1] = a[1] + b[1] * scale;
	out[2] = a[2] + b[2] * scale;
	out[3] = a[3] + b[3] * scale;
	out[4] = a[4] + b[4] * scale;
	out[5] = a[5] + b[5] * scale;
	out[6] = a[6] + b[6] * scale;
	out[7] = a[7] + b[7] * scale;
	out[8] = a[8] + b[8] * scale;
	return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
export function mat3ExactEquals(a: ReadonlyMat3, b: ReadonlyMat3): boolean {
	return (
		a[0] === b[0] &&
		a[1] === b[1] &&
		a[2] === b[2] &&
		a[3] === b[3] &&
		a[4] === b[4] &&
		a[5] === b[5] &&
		a[6] === b[6] &&
		a[7] === b[7] &&
		a[8] === b[8]
	);
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
export function mat3Equals(a: ReadonlyMat3, b: ReadonlyMat3): boolean {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3],
		a4 = a[4],
		a5 = a[5],
		a6 = a[6],
		a7 = a[7],
		a8 = a[8];
	let b0 = b[0],
		b1 = b[1],
		b2 = b[2],
		b3 = b[3],
		b4 = b[4],
		b5 = b[5],
		b6 = b[6],
		b7 = b[7],
		b8 = b[8];
	return (
		Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
		Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
		Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
		Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
		Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
		Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
		Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
		Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
		Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8))
	);
}

/**
 * Alias for {@link mat3Multiply}
 * @function
 */
export const mat3Mul = mat3Multiply;

/**
 * Alias for {@link mat3Subtract}
 * @function
 */
export const mat3Sub = mat3Subtract;
