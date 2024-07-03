import {
	ARRAY_TYPE,
	EPSILON,
	type IndexedCollection,
	RANDOM,
	round,
} from "./common";
import type { ReadonlyMat4 } from "./mat4";
import type { ReadonlyQuat } from "./quat";

declare type Vec4 = [number, number, number, number] | IndexedCollection;
declare type ReadonlyVec4 =
	| readonly [number, number, number, number]
	| IndexedCollection;

/**
 * Creates a new, empty Vec4
 *
 * @returns {Vec4} a new 4D vector
 */
export function vec4Create(): Vec4 {
	let out = new ARRAY_TYPE(4);
	if (ARRAY_TYPE != Float32Array) {
		out[0] = 0;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
	}
	return out;
}

/**
 * Creates a new Vec4 initialized with values from an existing vector
 *
 * @param {ReadonlyVec4} a vector to clone
 * @returns {Vec4} a new 4D vector
 */
export function vec4Clone(a: ReadonlyVec4): Vec4 {
	let out = new ARRAY_TYPE(4);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	return out;
}

/**
 * Creates a new Vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {Vec4} a new 4D vector
 */
export function vec4FromValues(
	x: number,
	y: number,
	z: number,
	w: number,
): Vec4 {
	let out = new ARRAY_TYPE(4);
	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = w;
	return out;
}

/**
 * Copy the values from one Vec4 to another
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the source vector
 * @returns {Vec4} out
 */
export function vec4Copy(out: Vec4, a: ReadonlyVec4): Vec4 {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	return out;
}

/**
 * Set the components of a Vec4 to the given values
 *
 * @param {Vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {Vec4} out
 */
export function vec4Set(
	out: Vec4,
	x: number,
	y: number,
	z: number,
	w: number,
): Vec4 {
	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = w;
	return out;
}

/**
 * Adds two Vec4's
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Vec4} out
 */
export function vec4Add(out: Vec4, a: ReadonlyVec4, b: ReadonlyVec4): Vec4 {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	out[3] = a[3] + b[3];
	return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Vec4} out
 */
export function vec4Subtract(
	out: Vec4,
	a: ReadonlyVec4,
	b: ReadonlyVec4,
): Vec4 {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	out[3] = a[3] - b[3];
	return out;
}

/**
 * Multiplies two Vec4's
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Vec4} out
 */
export function vec4Multiply(
	out: Vec4,
	a: ReadonlyVec4,
	b: ReadonlyVec4,
): Vec4 {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	out[2] = a[2] * b[2];
	out[3] = a[3] * b[3];
	return out;
}

/**
 * Divides two Vec4's
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Vec4} out
 */
export function vec4Divide(out: Vec4, a: ReadonlyVec4, b: ReadonlyVec4): Vec4 {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	out[2] = a[2] / b[2];
	out[3] = a[3] / b[3];
	return out;
}

/**
 * Math.ceil the components of a Vec4
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to ceil
 * @returns {Vec4} out
 */
export function vec4Ceil(out: Vec4, a: ReadonlyVec4): Vec4 {
	out[0] = Math.ceil(a[0]);
	out[1] = Math.ceil(a[1]);
	out[2] = Math.ceil(a[2]);
	out[3] = Math.ceil(a[3]);
	return out;
}

/**
 * Math.floor the components of a Vec4
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to floor
 * @returns {Vec4} out
 */
export function vec4Floor(out: Vec4, a: ReadonlyVec4): Vec4 {
	out[0] = Math.floor(a[0]);
	out[1] = Math.floor(a[1]);
	out[2] = Math.floor(a[2]);
	out[3] = Math.floor(a[3]);
	return out;
}

/**
 * Returns the minimum of two Vec4's
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Vec4} out
 */
export function vec4Min(out: Vec4, a: ReadonlyVec4, b: ReadonlyVec4): Vec4 {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	out[2] = Math.min(a[2], b[2]);
	out[3] = Math.min(a[3], b[3]);
	return out;
}

/**
 * Returns the maximum of two Vec4's
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Vec4} out
 */
export function vec4Max(out: Vec4, a: ReadonlyVec4, b: ReadonlyVec4): Vec4 {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	out[2] = Math.max(a[2], b[2]);
	out[3] = Math.max(a[3], b[3]);
	return out;
}

/**
 * symmetric round the components of a Vec4
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to round
 * @returns {Vec4} out
 */
export function vec4Round(out: Vec4, a: ReadonlyVec4): Vec4 {
	out[0] = round(a[0]);
	out[1] = round(a[1]);
	out[2] = round(a[2]);
	out[3] = round(a[3]);
	return out;
}

/**
 * Scales a Vec4 by a scalar number
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {Vec4} out
 */
export function vec4Scale(out: Vec4, a: ReadonlyVec4, b: number): Vec4 {
	out[0] = a[0] * b;
	out[1] = a[1] * b;
	out[2] = a[2] * b;
	out[3] = a[3] * b;
	return out;
}

/**
 * Adds two Vec4's after scaling the second operand by a scalar value
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {Vec4} out
 */
export function vec4ScaleAndAdd(
	out: Vec4,
	a: ReadonlyVec4,
	b: ReadonlyVec4,
	scale: number,
): Vec4 {
	out[0] = a[0] + b[0] * scale;
	out[1] = a[1] + b[1] * scale;
	out[2] = a[2] + b[2] * scale;
	out[3] = a[3] + b[3] * scale;
	return out;
}

/**
 * Calculates the euclidian distance between two Vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} distance between a and b
 */
export function vec4Distance(a: ReadonlyVec4, b: ReadonlyVec4): number {
	let x = b[0] - a[0];
	let y = b[1] - a[1];
	let z = b[2] - a[2];
	let w = b[3] - a[3];
	return Math.sqrt(x * x + y * y + z * z + w * w);
}

/**
 * Calculates the squared euclidian distance between two Vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
export function vec4SquaredDistance(a: ReadonlyVec4, b: ReadonlyVec4): number {
	let x = b[0] - a[0];
	let y = b[1] - a[1];
	let z = b[2] - a[2];
	let w = b[3] - a[3];
	return x * x + y * y + z * z + w * w;
}

/**
 * Calculates the length of a Vec4
 *
 * @param {ReadonlyVec4} a vector to calculate length of
 * @returns {Number} length of a
 */
export function vec4Length(a: ReadonlyVec4): number {
	let x = a[0];
	let y = a[1];
	let z = a[2];
	let w = a[3];
	return Math.sqrt(x * x + y * y + z * z + w * w);
}

/**
 * Calculates the squared length of a Vec4
 *
 * @param {ReadonlyVec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
export function vec4SquaredLength(a: ReadonlyVec4): number {
	let x = a[0];
	let y = a[1];
	let z = a[2];
	let w = a[3];
	return x * x + y * y + z * z + w * w;
}

/**
 * Negates the components of a Vec4
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to negate
 * @returns {Vec4} out
 */
export function vec4Negate(out: Vec4, a: ReadonlyVec4): Vec4 {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	out[3] = -a[3];
	return out;
}

/**
 * Returns the inverse of the components of a Vec4
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to invert
 * @returns {Vec4} out
 */
export function vec4Inverse(out: Vec4, a: ReadonlyVec4): Vec4 {
	out[0] = 1.0 / a[0];
	out[1] = 1.0 / a[1];
	out[2] = 1.0 / a[2];
	out[3] = 1.0 / a[3];
	return out;
}

/**
 * Normalize a Vec4
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {Vec4} out
 */
export function vec4Normalize(out: Vec4, a: ReadonlyVec4): Vec4 {
	let x = a[0];
	let y = a[1];
	let z = a[2];
	let w = a[3];
	let len = x * x + y * y + z * z + w * w;
	if (len > 0) {
		len = 1 / Math.sqrt(len);
	}
	out[0] = x * len;
	out[1] = y * len;
	out[2] = z * len;
	out[3] = w * len;
	return out;
}

/**
 * Calculates the dot product of two Vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} dot product of a and b
 */
export function vec4Dot(a: ReadonlyVec4, b: ReadonlyVec4): number {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/**
 * Returns the cross-product of three vectors in a 4-dimensional space
 *
 * @param {ReadonlyVec4} result the receiving vector
 * @param {ReadonlyVec4} U the first vector
 * @param {ReadonlyVec4} V the second vector
 * @param {ReadonlyVec4} W the third vector
 * @returns {Vec4} result
 */
export function vec4Cross(
	out: Vec4,
	u: ReadonlyVec4,
	v: ReadonlyVec4,
	w: ReadonlyVec4,
): Vec4 {
	let A = v[0] * w[1] - v[1] * w[0],
		B = v[0] * w[2] - v[2] * w[0],
		C = v[0] * w[3] - v[3] * w[0],
		D = v[1] * w[2] - v[2] * w[1],
		E = v[1] * w[3] - v[3] * w[1],
		F = v[2] * w[3] - v[3] * w[2];
	let G = u[0];
	let H = u[1];
	let I = u[2];
	let J = u[3];

	out[0] = H * F - I * E + J * D;
	out[1] = -(G * F) + I * C - J * B;
	out[2] = G * E - H * C + J * A;
	out[3] = -(G * D) + H * B - I * A;

	return out;
}

/**
 * Performs a linear interpolation between two Vec4's
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {Vec4} out
 */
export function vec4Lerp(
	out: Vec4,
	a: ReadonlyVec4,
	b: ReadonlyVec4,
	t: number,
): Vec4 {
	let ax = a[0];
	let ay = a[1];
	let az = a[2];
	let aw = a[3];
	out[0] = ax + t * (b[0] - ax);
	out[1] = ay + t * (b[1] - ay);
	out[2] = az + t * (b[2] - az);
	out[3] = aw + t * (b[3] - aw);
	return out;
}

/**
 * Generates a random vector with the given scale
 *
 * @param {Vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If omitted, a unit vector will be returned
 * @returns {Vec4} out
 */
export function vec4Random(out: Vec4, scale: number): Vec4 {
	scale = scale === undefined ? 1.0 : scale;

	// Marsaglia, George. Choosing a Point from the Surface of a
	// Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
	// http://projecteuclid.org/euclid.aoms/1177692644;
	var v1, v2, v3, v4;
	var s1, s2;
	var rand;

	rand = RANDOM();
	v1 = rand * 2 - 1;
	v2 = (4 * RANDOM() - 2) * Math.sqrt(rand * -rand + rand);
	s1 = v1 * v1 + v2 * v2;

	rand = RANDOM();
	v3 = rand * 2 - 1;
	v4 = (4 * RANDOM() - 2) * Math.sqrt(rand * -rand + rand);
	s2 = v3 * v3 + v4 * v4;

	var d = Math.sqrt((1 - s1) / s2);
	out[0] = scale * v1;
	out[1] = scale * v2;
	out[2] = scale * v3 * d;
	out[3] = scale * v4 * d;
	return out;
}

/**
 * Transforms the Vec4 with a mat4.
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {Vec4} out
 */
export function vec4TransformMat4(
	out: Vec4,
	a: ReadonlyVec4,
	m: ReadonlyMat4,
): Vec4 {
	let x = a[0],
		y = a[1],
		z = a[2],
		w = a[3];
	out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	return out;
}

/**
 * Transforms the Vec4 with a quat
 *
 * @param {Vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {Vec4} out
 */
export function vec4TransformQuat(
	out: Vec4,
	a: ReadonlyVec4,
	q: ReadonlyQuat,
): Vec4 {
	let x = a[0],
		y = a[1],
		z = a[2];
	let qx = q[0],
		qy = q[1],
		qz = q[2],
		qw = q[3];

	// calculate quat * vec
	let ix = qw * x + qy * z - qz * y;
	let iy = qw * y + qz * x - qx * z;
	let iz = qw * z + qx * y - qy * x;
	let iw = -qx * x - qy * y - qz * z;

	// calculate result * inverse quat
	out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	out[3] = a[3];
	return out;
}

/**
 * Set the components of a Vec4 to zero
 *
 * @param {Vec4} out the receiving vector
 * @returns {Vec4} out
 */
export function vec4Zero(out: Vec4): Vec4 {
	out[0] = 0.0;
	out[1] = 0.0;
	out[2] = 0.0;
	out[3] = 0.0;
	return out;
}

/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
export function vec4Str(a: ReadonlyVec4): string {
	return "Vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export function vec4ExactEquals(a: ReadonlyVec4, b: ReadonlyVec4): boolean {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export function vec4Equals(a: ReadonlyVec4, b: ReadonlyVec4): boolean {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3];
	let b0 = b[0],
		b1 = b[1],
		b2 = b[2],
		b3 = b[3];
	return (
		Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
		Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
		Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
		Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3))
	);
}

/**
 * Alias for {@link vec4Subtract}
 * @function
 */
export const vec4Sub = vec4Subtract;

/**
 * Alias for {@link vec4Multiply}
 * @function
 */
export const vec4Mul = vec4Multiply;

/**
 * Alias for {@link vec4Divide}
 * @function
 */
export const vec4Div = vec4Divide;

/**
 * Alias for {@link vec4Distance}
 * @function
 */
export const vec4Dist = vec4Distance;

/**
 * Alias for {@link vec4SquaredDistance}
 * @function
 */
export const vec4SqrDist = vec4SquaredDistance;

/**
 * Alias for {@link vec4Length}
 * @function
 */
export const vec4Len = vec4Length;

/**
 * Alias for {@link vec4SquaredLength}
 * @function
 */
export const vec4SqrLen = vec4SquaredLength;

/**
 * Perform some operation over an array of Vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each Vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of Vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
export const vec4ForEach = (function () {
	let vec = vec4Create();

	return function <T>(
		a: number[],
		stride: number,
		offset: number,
		count: number,
		fn: (out: Vec4, from: ReadonlyVec4, arg: T) => Vec4,
		arg: T,
	) {
		let i, l;
		if (!stride) {
			stride = 4;
		}

		if (!offset) {
			offset = 0;
		}

		if (count) {
			l = Math.min(count * stride + offset, a.length);
		} else {
			l = a.length;
		}

		for (i = offset; i < l; i += stride) {
			vec[0] = a[i] as number;
			vec[1] = a[i + 1] as number;
			vec[2] = a[i + 2] as number;
			vec[3] = a[i + 3] as number;
			fn(vec, vec, arg);
			a[i] = vec[0];
			a[i + 1] = vec[1];
			a[i + 2] = vec[2];
			a[i + 3] = vec[3];
		}

		return a;
	};
})();
