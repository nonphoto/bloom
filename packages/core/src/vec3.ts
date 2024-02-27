import {
	ARRAY_TYPE,
	EPSILON,
	IndexedCollection,
	RANDOM,
	round,
} from "./common";
import { ReadonlyMat3 } from "./mat3";
import { ReadonlyMat4 } from "./mat4";
import { ReadonlyQuat } from "./quat";

export type Vec3 = [number, number, number] | IndexedCollection;
export type ReadonlyVec3 =
	| readonly [number, number, number]
	| IndexedCollection;

/**
 * 3 Dimensional Vector
 * @module Vec3
 */

/**
 * Creates a new, empty Vec3
 *
 * @returns {Vec3} a new 3D vector
 */
export function vec3Create(): Vec3 {
	let out = new ARRAY_TYPE(3);
	if (ARRAY_TYPE != Float32Array) {
		out[0] = 0;
		out[1] = 0;
		out[2] = 0;
	}
	return out;
}

/**
 * Creates a new Vec3 initialized with values from an existing vector
 *
 * @param {ReadonlyVec3} a vector to clone
 * @returns {Vec3} a new 3D vector
 */
export function vec3Clone(a: ReadonlyVec3): Vec3 {
	var out = new ARRAY_TYPE(3);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	return out;
}

/**
 * Calculates the length of a Vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */
export function vec3Length(a: ReadonlyVec3): number {
	let x = a[0];
	let y = a[1];
	let z = a[2];
	return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Creates a new Vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {Vec3} a new 3D vector
 */
export function vec3FromValues(x: number, y: number, z: number): Vec3 {
	let out = new ARRAY_TYPE(3);
	out[0] = x;
	out[1] = y;
	out[2] = z;
	return out;
}

/**
 * Copy the values from one Vec3 to another
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the source vector
 * @returns {Vec3} out
 */
export function vec3Copy(out: Vec3, a: ReadonlyVec3): Vec3 {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	return out;
}

/**
 * Set the components of a Vec3 to the given values
 *
 * @param {Vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {Vec3} out
 */
export function vec3Set(out: Vec3, x: number, y: number, z: number): Vec3 {
	out[0] = x;
	out[1] = y;
	out[2] = z;
	return out;
}

/**
 * Adds two Vec3's
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Vec3} out
 */
export function vec3Add(out: Vec3, a: ReadonlyVec3, b: ReadonlyVec3): Vec3 {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Vec3} out
 */
export function vec3Subtract(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
): Vec3 {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	return out;
}

/**
 * Multiplies two Vec3's
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Vec3} out
 */
export function vec3Multiply(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
): Vec3 {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	out[2] = a[2] * b[2];
	return out;
}

/**
 * Divides two Vec3's
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Vec3} out
 */
export function vec3Divide(out: Vec3, a: ReadonlyVec3, b: ReadonlyVec3): Vec3 {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	out[2] = a[2] / b[2];
	return out;
}

/**
 * Math.ceil the components of a Vec3
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to ceil
 * @returns {Vec3} out
 */
export function vec3Ceil(out: Vec3, a: ReadonlyVec3): Vec3 {
	out[0] = Math.ceil(a[0]);
	out[1] = Math.ceil(a[1]);
	out[2] = Math.ceil(a[2]);
	return out;
}

/**
 * Math.floor the components of a Vec3
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to floor
 * @returns {Vec3} out
 */
export function vec3Floor(out: Vec3, a: ReadonlyVec3): Vec3 {
	out[0] = Math.floor(a[0]);
	out[1] = Math.floor(a[1]);
	out[2] = Math.floor(a[2]);
	return out;
}

/**
 * Returns the minimum of two Vec3's
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Vec3} out
 */
export function vec3Min(out: Vec3, a: ReadonlyVec3, b: ReadonlyVec3): Vec3 {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	out[2] = Math.min(a[2], b[2]);
	return out;
}

/**
 * Returns the maximum of two Vec3's
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Vec3} out
 */
export function vec3Max(out: Vec3, a: ReadonlyVec3, b: ReadonlyVec3): Vec3 {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	out[2] = Math.max(a[2], b[2]);
	return out;
}

/**
 * symmetric round the components of a Vec3
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to round
 * @returns {Vec3} out
 */
export function vec3Round(out: Vec3, a: ReadonlyVec3): Vec3 {
	out[0] = round(a[0]);
	out[1] = round(a[1]);
	out[2] = round(a[2]);
	return out;
}

/**
 * Scales a Vec3 by a scalar number
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {Vec3} out
 */
export function vec3Scale(out: Vec3, a: ReadonlyVec3, b: number): Vec3 {
	out[0] = a[0] * b;
	out[1] = a[1] * b;
	out[2] = a[2] * b;
	return out;
}

/**
 * Adds two Vec3's after scaling the second operand by a scalar value
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {Vec3} out
 */
export function vec3ScaleAndAdd(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
	scale: number,
): Vec3 {
	out[0] = a[0] + b[0] * scale;
	out[1] = a[1] + b[1] * scale;
	out[2] = a[2] + b[2] * scale;
	return out;
}

/**
 * Calculates the euclidian distance between two Vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} distance between a and b
 */
export function vec3Distance(a: ReadonlyVec3, b: ReadonlyVec3): number {
	let x = b[0] - a[0];
	let y = b[1] - a[1];
	let z = b[2] - a[2];
	return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calculates the squared euclidian distance between two Vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
export function vec3SquaredDistance(a: ReadonlyVec3, b: ReadonlyVec3): number {
	let x = b[0] - a[0];
	let y = b[1] - a[1];
	let z = b[2] - a[2];
	return x * x + y * y + z * z;
}

/**
 * Calculates the squared length of a Vec3
 *
 * @param {ReadonlyVec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
export function vec3SquaredLength(a: ReadonlyVec3): number {
	let x = a[0];
	let y = a[1];
	let z = a[2];
	return x * x + y * y + z * z;
}

/**
 * Negates the components of a Vec3
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to negate
 * @returns {Vec3} out
 */
export function vec3Negate(out: Vec3, a: ReadonlyVec3): Vec3 {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	return out;
}

/**
 * Returns the inverse of the components of a Vec3
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to invert
 * @returns {Vec3} out
 */
export function vec3Inverse(out: Vec3, a: ReadonlyVec3): Vec3 {
	out[0] = 1.0 / a[0];
	out[1] = 1.0 / a[1];
	out[2] = 1.0 / a[2];
	return out;
}

/**
 * Normalize a Vec3
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {Vec3} out
 */
export function vec3Normalize(out: Vec3, a: ReadonlyVec3): Vec3 {
	let x = a[0];
	let y = a[1];
	let z = a[2];
	let len = x * x + y * y + z * z;
	if (len > 0) {
		//TODO: evaluate use of glm_invsqrt here?
		len = 1 / Math.sqrt(len);
	}
	out[0] = a[0] * len;
	out[1] = a[1] * len;
	out[2] = a[2] * len;
	return out;
}

/**
 * Calculates the dot product of two Vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} dot product of a and b
 */
export function vec3Dot(a: ReadonlyVec3, b: ReadonlyVec3): number {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Computes the cross product of two Vec3's
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Vec3} out
 */
export function vec3Cross(out: Vec3, a: ReadonlyVec3, b: ReadonlyVec3): Vec3 {
	let ax = a[0],
		ay = a[1],
		az = a[2];
	let bx = b[0],
		by = b[1],
		bz = b[2];

	out[0] = ay * bz - az * by;
	out[1] = az * bx - ax * bz;
	out[2] = ax * by - ay * bx;
	return out;
}

/**
 * Performs a linear interpolation between two Vec3's
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {Vec3} out
 */
export function vec3Lerp(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
	t: number,
): Vec3 {
	let ax = a[0];
	let ay = a[1];
	let az = a[2];
	out[0] = ax + t * (b[0] - ax);
	out[1] = ay + t * (b[1] - ay);
	out[2] = az + t * (b[2] - az);
	return out;
}

/**
 * Performs a spherical linear interpolation between two Vec3's
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {Vec3} out
 */
export function vec3Slerp(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
	t: number,
): Vec3 {
	let angle = Math.acos(Math.min(Math.max(vec3Dot(a, b), -1), 1));
	let sinTotal = Math.sin(angle);

	let ratioA = Math.sin((1 - t) * angle) / sinTotal;
	let ratioB = Math.sin(t * angle) / sinTotal;
	out[0] = ratioA * a[0] + ratioB * b[0];
	out[1] = ratioA * a[1] + ratioB * b[1];
	out[2] = ratioA * a[2] + ratioB * b[2];

	return out;
}

/**
 * Performs a hermite interpolation with two control points
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {Vec3} out
 */
export function vec3Hermite(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
	c: ReadonlyVec3,
	d: ReadonlyVec3,
	t: number,
): Vec3 {
	let factorTimes2 = t * t;
	let factor1 = factorTimes2 * (2 * t - 3) + 1;
	let factor2 = factorTimes2 * (t - 2) + t;
	let factor3 = factorTimes2 * (t - 1);
	let factor4 = factorTimes2 * (3 - 2 * t);

	out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

	return out;
}

/**
 * Performs a bezier interpolation with two control points
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {Vec3} out
 */
export function vec3Bezier(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
	c: ReadonlyVec3,
	d: ReadonlyVec3,
	t: number,
): Vec3 {
	let inverseFactor = 1 - t;
	let inverseFactorTimesTwo = inverseFactor * inverseFactor;
	let factorTimes2 = t * t;
	let factor1 = inverseFactorTimesTwo * inverseFactor;
	let factor2 = 3 * t * inverseFactorTimesTwo;
	let factor3 = 3 * factorTimes2 * inverseFactor;
	let factor4 = factorTimes2 * t;

	out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

	return out;
}

/**
 * Generates a random vector with the given scale
 *
 * @param {Vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If omitted, a unit vector will be returned
 * @returns {Vec3} out
 */
export function vec3Random(out: Vec3, scale: number): Vec3 {
	scale = scale === undefined ? 1.0 : scale;

	let r = RANDOM() * 2.0 * Math.PI;
	let z = RANDOM() * 2.0 - 1.0;
	let zScale = Math.sqrt(1.0 - z * z) * scale;

	out[0] = Math.cos(r) * zScale;
	out[1] = Math.sin(r) * zScale;
	out[2] = z * scale;
	return out;
}

/**
 * Transforms the Vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {Vec3} out
 */
export function vec3TransformMat4(
	out: Vec3,
	a: ReadonlyVec3,
	m: ReadonlyMat4,
): Vec3 {
	let x = a[0],
		y = a[1],
		z = a[2];
	let w = m[3] * x + m[7] * y + m[11] * z + m[15];
	w = w || 1.0;
	out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
	out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
	out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
	return out;
}

/**
 * Transforms the Vec3 with a mat3.
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat3} m the 3x3 matrix to transform with
 * @returns {Vec3} out
 */
export function vec3TransformMat3(
	out: Vec3,
	a: ReadonlyVec3,
	m: ReadonlyMat3,
): Vec3 {
	let x = a[0],
		y = a[1],
		z = a[2];
	out[0] = x * m[0] + y * m[3] + z * m[6];
	out[1] = x * m[1] + y * m[4] + z * m[7];
	out[2] = x * m[2] + y * m[5] + z * m[8];
	return out;
}

/**
 * Transforms the Vec3 with a quat
 * Can also be used for dual quaternions. (Multiply it with the real part)
 *
 * @param {Vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {Vec3} out
 */
export function vec3TransformQuat(
	out: Vec3,
	a: ReadonlyVec3,
	q: ReadonlyQuat,
): Vec3 {
	// benchmarks: https://jsperf.com/quaternion-transform-Vec3-implementations-fixed
	let qx = q[0],
		qy = q[1],
		qz = q[2],
		qw = q[3];
	let x = a[0],
		y = a[1],
		z = a[2];
	// var qvec = [qx, qy, qz];
	// var uv = Vec3.cross([], qvec, a);
	let uvx = qy * z - qz * y,
		uvy = qz * x - qx * z,
		uvz = qx * y - qy * x;
	// var uuv = Vec3.cross([], qvec, uv);
	let uuvx = qy * uvz - qz * uvy,
		uuvy = qz * uvx - qx * uvz,
		uuvz = qx * uvy - qy * uvx;
	// Vec3.scale(uv, uv, 2 * w);
	let w2 = qw * 2;
	uvx *= w2;
	uvy *= w2;
	uvz *= w2;
	// Vec3.scale(uuv, uuv, 2);
	uuvx *= 2;
	uuvy *= 2;
	uuvz *= 2;
	// return Vec3.add(out, a, Vec3.add(out, uv, uuv));
	out[0] = x + uvx + uuvx;
	out[1] = y + uvy + uuvy;
	out[2] = z + uvz + uuvz;
	return out;
}

/**
 * Rotate a 3D vector around the x-axis
 * @param {Vec3} out The receiving Vec3
 * @param {ReadonlyVec3} a The Vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {Vec3} out
 */
export function vec3RotateX(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
	rad: number,
): Vec3 {
	let p = [],
		r = [];
	//Translate point to the origin
	p[0] = a[0] - b[0];
	p[1] = a[1] - b[1];
	p[2] = a[2] - b[2];

	//perform rotation
	r[0] = p[0];
	r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
	r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);

	//translate to correct position
	out[0] = r[0] + b[0];
	out[1] = r[1] + b[1];
	out[2] = r[2] + b[2];

	return out;
}

/**
 * Rotate a 3D vector around the y-axis
 * @param {Vec3} out The receiving Vec3
 * @param {ReadonlyVec3} a The Vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {Vec3} out
 */
export function vec3RotateY(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
	rad: number,
): Vec3 {
	let p = [],
		r = [];
	//Translate point to the origin
	p[0] = a[0] - b[0];
	p[1] = a[1] - b[1];
	p[2] = a[2] - b[2];

	//perform rotation
	r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
	r[1] = p[1];
	r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);

	//translate to correct position
	out[0] = r[0] + b[0];
	out[1] = r[1] + b[1];
	out[2] = r[2] + b[2];

	return out;
}

/**
 * Rotate a 3D vector around the z-axis
 * @param {Vec3} out The receiving Vec3
 * @param {ReadonlyVec3} a The Vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {Vec3} out
 */
export function vec3RotateZ(
	out: Vec3,
	a: ReadonlyVec3,
	b: ReadonlyVec3,
	rad: number,
): Vec3 {
	let p = [],
		r = [];
	//Translate point to the origin
	p[0] = a[0] - b[0];
	p[1] = a[1] - b[1];
	p[2] = a[2] - b[2];

	//perform rotation
	r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
	r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
	r[2] = p[2];

	//translate to correct position
	out[0] = r[0] + b[0];
	out[1] = r[1] + b[1];
	out[2] = r[2] + b[2];

	return out;
}

/**
 * Get the angle between two 3D vectors
 * @param {ReadonlyVec3} a The first operand
 * @param {ReadonlyVec3} b The second operand
 * @returns {Number} The angle in radians
 */
export function vec3Angle(a: ReadonlyVec3, b: ReadonlyVec3): number {
	let ax = a[0],
		ay = a[1],
		az = a[2],
		bx = b[0],
		by = b[1],
		bz = b[2],
		mag = Math.sqrt(
			(ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz),
		),
		cosine = mag && vec3Dot(a, b) / mag;
	return Math.acos(Math.min(Math.max(cosine, -1), 1));
}

/**
 * Set the components of a Vec3 to zero
 *
 * @param {Vec3} out the receiving vector
 * @returns {Vec3} out
 */
export function vec3Zero(out: Vec3): Vec3 {
	out[0] = 0.0;
	out[1] = 0.0;
	out[2] = 0.0;
	return out;
}

/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
export function vec3Str(a: ReadonlyVec3): string {
	return "Vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export function vec3ExactEquals(a: ReadonlyVec3, b: ReadonlyVec3): boolean {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export function vec3Equals(a: ReadonlyVec3, b: ReadonlyVec3): boolean {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2];
	let b0 = b[0],
		b1 = b[1],
		b2 = b[2];
	return (
		Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
		Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
		Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2))
	);
}

/**
 * Alias for {@link vec3Subtract}
 * @function
 */
export const vec3Sub = vec3Subtract;

/**
 * Alias for {@link vec3Multiply}
 * @function
 */
export const vec3Mul = vec3Multiply;

/**
 * Alias for {@link vec3Divide}
 * @function
 */
export const vec3Div = vec3Divide;

/**
 * Alias for {@link vec3Distance}
 * @function
 */
export const vec3Dist = vec3Distance;

/**
 * Alias for {@link vec3SquaredDistance}
 * @function
 */
export const vec3SqrDist = vec3SquaredDistance;

/**
 * Alias for {@link vec3length}
 * @function
 */
export const vec3Len = vec3Length;

/**
 * Alias for {@link vec3SquaredLength}
 * @function
 */
export const vec3SqrLen = vec3SquaredLength;

/**
 * Perform some operation over an array of Vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each Vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of Vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
export const vec3ForEach = (function () {
	let vec = vec3Create();

	return function <T>(
		a: number[],
		stride: number,
		offset: number,
		count: number,
		fn: (out: Vec3, from: ReadonlyVec3, arg: T) => Vec3,
		arg: T,
	) {
		let i, l;
		if (!stride) {
			stride = 3;
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
			fn(vec, vec, arg);
			a[i] = vec[0];
			a[i + 1] = vec[1];
			a[i + 2] = vec[2];
		}

		return a;
	};
})();
