import {
	ANGLE_ORDER,
	ARRAY_TYPE,
	EPSILON,
	IndexedCollection,
	RANDOM,
} from "./common";
import { ReadonlyMat3, mat3Create } from "./mat3";
import {
	ReadonlyVec3,
	Vec3,
	vec3Create,
	vec3Cross,
	vec3Dot,
	vec3FromValues,
	vec3Len,
	vec3Normalize,
} from "./vec3";
import {
	vec4Add,
	vec4Clone,
	vec4Copy,
	vec4Dot,
	vec4ExactEquals,
	vec4FromValues,
	vec4Length,
	vec4Lerp,
	vec4Normalize,
	vec4Scale,
	vec4Set,
	vec4SquaredLength,
} from "./vec4";

export type Quat = [number, number, number, number] | IndexedCollection;
export type ReadonlyQuat =
	| readonly [number, number, number, number]
	| IndexedCollection;

/**
 * Creates a new identity Quat
 *
 * @returns {Quat} a new quaternion
 */
export function quatCreate(): Quat {
	let out = new ARRAY_TYPE(4);
	if (ARRAY_TYPE != Float32Array) {
		out[0] = 0;
		out[1] = 0;
		out[2] = 0;
	}
	out[3] = 1;
	return out;
}

/**
 * Set a Quat to the identity quaternion
 *
 * @param {Quat} out the receiving quaternion
 * @returns {Quat} out
 */
export function quatIdentity(out: Quat): Quat {
	out[0] = 0;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	return out;
}

/**
 * Sets a Quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyVec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {Quat} out
 **/
export function quatSetAxisAngle(
	out: Quat,
	axis: ReadonlyVec3,
	rad: number,
): Quat {
	rad = rad * 0.5;
	let s = Math.sin(rad);
	out[0] = s * axis[0];
	out[1] = s * axis[1];
	out[2] = s * axis[2];
	out[3] = Math.cos(rad);
	return out;
}

/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {ReadonlyQuat} q     quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */
export function quatGetAxisAngle(out_axis: Vec3, q: ReadonlyQuat): number {
	let rad = Math.acos(q[3]) * 2.0;
	let s = Math.sin(rad / 2.0);
	if (s > EPSILON) {
		out_axis[0] = q[0] / s;
		out_axis[1] = q[1] / s;
		out_axis[2] = q[2] / s;
	} else {
		// If s is zero, return any axis (no rotation - axis does not matter)
		out_axis[0] = 1;
		out_axis[1] = 0;
		out_axis[2] = 0;
	}
	return rad;
}

/**
 * Gets the angular distance between two unit quaternions
 *
 * @param  {ReadonlyQuat} a     Origin unit quaternion
 * @param  {ReadonlyQuat} b     Destination unit quaternion
 * @return {Number}     Angle, in radians, between the two quaternions
 */
export function quatGetAngle(a: ReadonlyQuat, b: ReadonlyQuat): number {
	let dotproduct = quatDot(a, b);

	return Math.acos(2 * dotproduct * dotproduct - 1);
}

/**
 * Multiplies two Quat's
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {Quat} out
 */
export function quatMultiply(
	out: Quat,
	a: ReadonlyQuat,
	b: ReadonlyQuat,
): Quat {
	let ax = a[0],
		ay = a[1],
		az = a[2],
		aw = a[3];
	let bx = b[0],
		by = b[1],
		bz = b[2],
		bw = b[3];

	out[0] = ax * bw + aw * bx + ay * bz - az * by;
	out[1] = ay * bw + aw * by + az * bx - ax * bz;
	out[2] = az * bw + aw * bz + ax * by - ay * bx;
	out[3] = aw * bw - ax * bx - ay * by - az * bz;
	return out;
}

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {Quat} out Quat receiving operation result
 * @param {ReadonlyQuat} a Quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {Quat} out
 */
export function quatRotateX(out: Quat, a: ReadonlyQuat, rad: number): Quat {
	rad *= 0.5;

	let ax = a[0],
		ay = a[1],
		az = a[2],
		aw = a[3];
	let bx = Math.sin(rad),
		bw = Math.cos(rad);

	out[0] = ax * bw + aw * bx;
	out[1] = ay * bw + az * bx;
	out[2] = az * bw - ay * bx;
	out[3] = aw * bw - ax * bx;
	return out;
}

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {Quat} out Quat receiving operation result
 * @param {ReadonlyQuat} a Quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {Quat} out
 */
export function quatRotateY(out: Quat, a: ReadonlyQuat, rad: number): Quat {
	rad *= 0.5;

	let ax = a[0],
		ay = a[1],
		az = a[2],
		aw = a[3];
	let by = Math.sin(rad),
		bw = Math.cos(rad);

	out[0] = ax * bw - az * by;
	out[1] = ay * bw + aw * by;
	out[2] = az * bw + ax * by;
	out[3] = aw * bw - ay * by;
	return out;
}

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {Quat} out Quat receiving operation result
 * @param {ReadonlyQuat} a Quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {Quat} out
 */
export function quatRotateZ(out: Quat, a: ReadonlyQuat, rad: number): Quat {
	rad *= 0.5;

	let ax = a[0],
		ay = a[1],
		az = a[2],
		aw = a[3];
	let bz = Math.sin(rad),
		bw = Math.cos(rad);

	out[0] = ax * bw + ay * bz;
	out[1] = ay * bw - ax * bz;
	out[2] = az * bw + aw * bz;
	out[3] = aw * bw - az * bz;
	return out;
}

/**
 * Calculates the W component of a Quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a Quat to calculate W component of
 * @returns {Quat} out
 */
export function quatCalculateW(out: Quat, a: ReadonlyQuat): Quat {
	let x = a[0],
		y = a[1],
		z = a[2];

	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
	return out;
}

/**
 * Calculate the exponential of a unit quaternion.
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a Quat to calculate the exponential of
 * @returns {Quat} out
 */
export function quatExp(out: Quat, a: ReadonlyQuat): Quat {
	let x = a[0],
		y = a[1],
		z = a[2],
		w = a[3];

	let r = Math.sqrt(x * x + y * y + z * z);
	let et = Math.exp(w);
	let s = r > 0 ? (et * Math.sin(r)) / r : 0;

	out[0] = x * s;
	out[1] = y * s;
	out[2] = z * s;
	out[3] = et * Math.cos(r);

	return out;
}

/**
 * Calculate the natural logarithm of a unit quaternion.
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a Quat to calculate the exponential of
 * @returns {Quat} out
 */
export function quatLn(out: Quat, a: ReadonlyQuat): Quat {
	let x = a[0],
		y = a[1],
		z = a[2],
		w = a[3];

	let r = Math.sqrt(x * x + y * y + z * z);
	let t = r > 0 ? Math.atan2(r, w) / r : 0;

	out[0] = x * t;
	out[1] = y * t;
	out[2] = z * t;
	out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);

	return out;
}

/**
 * Calculate the scalar power of a unit quaternion.
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a Quat to calculate the exponential of
 * @param {Number} b amount to scale the quaternion by
 * @returns {Quat} out
 */
export function quatPow(out: Quat, a: ReadonlyQuat, b: number): Quat {
	quatLn(out, a);
	quatScale(out, out, b);
	quatExp(out, out);
	return out;
}

/**
 * Performs a spherical linear interpolation between two Quat
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {Quat} out
 */
export function quatSlerp(
	out: Quat,
	a: ReadonlyQuat,
	b: ReadonlyQuat,
	t: number,
): Quat {
	// benchmarks:
	//    http://jsperf.com/quaternion-slerp-implementations
	let ax = a[0],
		ay = a[1],
		az = a[2],
		aw = a[3];
	let bx = b[0],
		by = b[1],
		bz = b[2],
		bw = b[3];

	let omega, cosom, sinom, scale0, scale1;

	// calc cosine
	cosom = ax * bx + ay * by + az * bz + aw * bw;
	// adjust signs (if necessary)
	if (cosom < 0.0) {
		cosom = -cosom;
		bx = -bx;
		by = -by;
		bz = -bz;
		bw = -bw;
	}
	// calculate coefficients
	if (1.0 - cosom > EPSILON) {
		// standard case (slerp)
		omega = Math.acos(cosom);
		sinom = Math.sin(omega);
		scale0 = Math.sin((1.0 - t) * omega) / sinom;
		scale1 = Math.sin(t * omega) / sinom;
	} else {
		// "from" and "to" quaternions are very close
		//  ... so we can do a linear interpolation
		scale0 = 1.0 - t;
		scale1 = t;
	}
	// calculate final values
	out[0] = scale0 * ax + scale1 * bx;
	out[1] = scale0 * ay + scale1 * by;
	out[2] = scale0 * az + scale1 * bz;
	out[3] = scale0 * aw + scale1 * bw;

	return out;
}

/**
 * Generates a random unit quaternion
 *
 * @param {Quat} out the receiving quaternion
 * @returns {Quat} out
 */
export function quatRandom(out: Quat): Quat {
	// Implementation of http://planning.cs.uiuc.edu/node198.html
	// TODO: Calling random 3 times is probably not the fastest solution
	let u1 = RANDOM();
	let u2 = RANDOM();
	let u3 = RANDOM();

	let sqrt1MinusU1 = Math.sqrt(1 - u1);
	let sqrtU1 = Math.sqrt(u1);

	out[0] = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
	out[1] = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
	out[2] = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
	out[3] = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
	return out;
}

/**
 * Calculates the inverse of a Quat
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a Quat to calculate inverse of
 * @returns {Quat} out
 */
export function quatInvert(out: Quat, a: ReadonlyQuat): Quat {
	let a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3];
	let dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
	let invDot = dot ? 1.0 / dot : 0;

	// TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

	out[0] = -a0 * invDot;
	out[1] = -a1 * invDot;
	out[2] = -a2 * invDot;
	out[3] = a3 * invDot;
	return out;
}

/**
 * Calculates the conjugate of a Quat
 * If the quaternion is normalized, this function is faster than Quat.inverse and produces the same result.
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a Quat to calculate conjugate of
 * @returns {Quat} out
 */
export function quatConjugate(out: Quat, a: ReadonlyQuat): Quat {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	out[3] = a[3];
	return out;
}

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyMat3} m rotation matrix
 * @returns {Quat} out
 * @function
 */
export function quatFromMat3(out: Quat, m: ReadonlyMat3): Quat {
	// Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	// article "quaternion Calculus and Fast Animation".
	let fTrace = m[0] + m[4] + m[8];
	let fRoot;

	if (fTrace > 0.0) {
		// |w| > 1/2, may as well choose w > 1/2
		fRoot = Math.sqrt(fTrace + 1.0); // 2w
		out[3] = 0.5 * fRoot;
		fRoot = 0.5 / fRoot; // 1/(4w)
		out[0] = (m[5] - m[7]) * fRoot;
		out[1] = (m[6] - m[2]) * fRoot;
		out[2] = (m[1] - m[3]) * fRoot;
	} else {
		// |w| <= 1/2
		let i = 0;
		if (m[4] > m[0]) i = 1;
		if (m[8] > (m[i * 3 + i] as number)) i = 2;
		let j = (i + 1) % 3;
		let k = (i + 2) % 3;

		fRoot = Math.sqrt(
			(m[i * 3 + i] as number) -
				(m[j * 3 + j] as number) -
				(m[k * 3 + k] as number) +
				1.0,
		);
		out[i] = 0.5 * fRoot;
		fRoot = 0.5 / fRoot;
		out[3] = ((m[j * 3 + k] as number) - (m[k * 3 + j] as number)) * fRoot;
		out[j] = ((m[j * 3 + i] as number) + (m[i * 3 + j] as number)) * fRoot;
		out[k] = ((m[k * 3 + i] as number) + (m[i * 3 + k] as number)) * fRoot;
	}

	return out;
}

/**
 * Creates a quaternion from the given euler angle x, y, z using the provided intrinsic order for the conversion.
 *
 * @param {Quat} out the receiving quaternion
 * @param {Number} x Angle to rotate around X axis in degrees.
 * @param {Number} y Angle to rotate around Y axis in degrees.
 * @param {Number} z Angle to rotate around Z axis in degrees.
 * @param {'zyx'|'xyz'|'yxz'|'yzx'|'zxy'|'zyx'} order Intrinsic order for conversion, default is zyx.
 * @returns {Quat} out
 * @function
 */
export function quatFromEuler(
	out: Quat,
	x: number,
	y: number,
	z: number,
	order: "zyx" | "xyz" | "xzy" | "yxz" | "yzx" | "zxy" | "zyx" = ANGLE_ORDER,
): Quat {
	let halfToRad = Math.PI / 360;
	x *= halfToRad;
	z *= halfToRad;
	y *= halfToRad;

	let sx = Math.sin(x);
	let cx = Math.cos(x);
	let sy = Math.sin(y);
	let cy = Math.cos(y);
	let sz = Math.sin(z);
	let cz = Math.cos(z);

	switch (order) {
		case "xyz":
			out[0] = sx * cy * cz + cx * sy * sz;
			out[1] = cx * sy * cz - sx * cy * sz;
			out[2] = cx * cy * sz + sx * sy * cz;
			out[3] = cx * cy * cz - sx * sy * sz;
			break;

		case "xzy":
			out[0] = sx * cy * cz - cx * sy * sz;
			out[1] = cx * sy * cz - sx * cy * sz;
			out[2] = cx * cy * sz + sx * sy * cz;
			out[3] = cx * cy * cz + sx * sy * sz;
			break;

		case "yxz":
			out[0] = sx * cy * cz + cx * sy * sz;
			out[1] = cx * sy * cz - sx * cy * sz;
			out[2] = cx * cy * sz - sx * sy * cz;
			out[3] = cx * cy * cz + sx * sy * sz;
			break;

		case "yzx":
			out[0] = sx * cy * cz + cx * sy * sz;
			out[1] = cx * sy * cz + sx * cy * sz;
			out[2] = cx * cy * sz - sx * sy * cz;
			out[3] = cx * cy * cz - sx * sy * sz;
			break;

		case "zxy":
			out[0] = sx * cy * cz - cx * sy * sz;
			out[1] = cx * sy * cz + sx * cy * sz;
			out[2] = cx * cy * sz + sx * sy * cz;
			out[3] = cx * cy * cz - sx * sy * sz;
			break;

		case "zyx":
			out[0] = sx * cy * cz - cx * sy * sz;
			out[1] = cx * sy * cz + sx * cy * sz;
			out[2] = cx * cy * sz - sx * sy * cz;
			out[3] = cx * cy * cz + sx * sy * sz;
			break;

		default:
			throw new Error("Unknown angle order " + order);
	}

	return out;
}

/**
 * Returns a string representation of a quaternion
 *
 * @param {ReadonlyQuat} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
export function quatStr(a: ReadonlyQuat): string {
	return "Quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}

/**
 * Creates a new Quat initialized with values from an existing quaternion
 *
 * @param {ReadonlyQuat} a quaternion to clone
 * @returns {Quat} a new quaternion
 * @function
 */
export const quatClone = vec4Clone;

/**
 * Creates a new Quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {Quat} a new quaternion
 * @function
 */
export const quatFromValues = vec4FromValues;

/**
 * Copy the values from one Quat to another
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the source quaternion
 * @returns {Quat} out
 * @function
 */
export const quatCopy = vec4Copy;

/**
 * Set the components of a Quat to the given values
 *
 * @param {Quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {Quat} out
 * @function
 */
export const quatSet = vec4Set;

/**
 * Adds two Quat's
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {Quat} out
 * @function
 */
export const quatAdd = vec4Add;

/**
 * Alias for {@link quatMultiply}
 * @function
 */
export const quatMul = quatMultiply;

/**
 * Scales a Quat by a scalar number
 *
 * @param {Quat} out the receiving vector
 * @param {ReadonlyQuat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {Quat} out
 * @function
 */
export const quatScale = vec4Scale;

/**
 * Calculates the dot product of two Quat's
 *
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
export const quatDot = vec4Dot;

/**
 * Performs a linear interpolation between two Quat's
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {Quat} out
 * @function
 */
export const quatLerp = vec4Lerp;

/**
 * Calculates the length of a Quat
 *
 * @param {ReadonlyQuat} a vector to calculate length of
 * @returns {Number} length of a
 */
export const quatLength = vec4Length;

/**
 * Alias for {@link Quat.length}
 * @function
 */
export const quatLen = quatLength;

/**
 * Calculates the squared length of a Quat
 *
 * @param {ReadonlyQuat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
export const quatSquaredLength = vec4SquaredLength;

/**
 * Alias for {@link quatSquaredLength}
 * @function
 */
export const quatSqrLen = quatSquaredLength;

/**
 * Normalize a Quat
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quaternion to normalize
 * @returns {Quat} out
 * @function
 */
export const quatNormalize = vec4Normalize;

/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyQuat} a The first quaternion.
 * @param {ReadonlyQuat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export const quatExactEquals = vec4ExactEquals;

/**
 * Returns whether or not the quaternions point approximately to the same direction.
 *
 * Both quaternions are assumed to be unit length.
 *
 * @param {ReadonlyQuat} a The first unit quaternion.
 * @param {ReadonlyQuat} b The second unit quaternion.
 * @returns {Boolean} True if the quaternions are equal, false otherwise.
 */
export function quatEquals(a: ReadonlyQuat, b: ReadonlyQuat): boolean {
	return Math.abs(quatDot(a, b)) >= 1 - EPSILON;
}

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {Quat} out the receiving quaternion.
 * @param {ReadonlyVec3} a the initial vector
 * @param {ReadonlyVec3} b the destination vector
 * @returns {Quat} out
 */
export const rotationTo = (function () {
	let tmpvec3 = vec3Create();
	let xUnitVec3 = vec3FromValues(1, 0, 0);
	let yUnitVec3 = vec3FromValues(0, 1, 0);

	return function (out: Quat, a: ReadonlyVec3, b: ReadonlyVec3): Quat {
		let dot = vec3Dot(a, b);
		if (dot < -0.999999) {
			vec3Cross(tmpvec3, xUnitVec3, a);
			if (vec3Len(tmpvec3) < 0.000001) vec3Cross(tmpvec3, yUnitVec3, a);
			vec3Normalize(tmpvec3, tmpvec3);
			quatSetAxisAngle(out, tmpvec3, Math.PI);
			return out;
		} else if (dot > 0.999999) {
			out[0] = 0;
			out[1] = 0;
			out[2] = 0;
			out[3] = 1;
			return out;
		} else {
			vec3Cross(tmpvec3, a, b);
			out[0] = tmpvec3[0];
			out[1] = tmpvec3[1];
			out[2] = tmpvec3[2];
			out[3] = 1 + dot;
			return quatNormalize(out, out);
		}
	};
})();

/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {Quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {ReadonlyQuat} c the third operand
 * @param {ReadonlyQuat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {Quat} out
 */
export const sqlerp = (function () {
	let temp1 = quatCreate();
	let temp2 = quatCreate();

	return function (
		out: Quat,
		a: ReadonlyQuat,
		b: ReadonlyQuat,
		c: ReadonlyQuat,
		d: ReadonlyQuat,
		t: number,
	) {
		quatSlerp(temp1, a, d, t);
		quatSlerp(temp2, b, c, t);
		quatSlerp(out, temp1, temp2, 2 * t * (1 - t));

		return out;
	};
})();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {ReadonlyVec3} view  the vector representing the viewing direction
 * @param {ReadonlyVec3} right the vector representing the local "right" direction
 * @param {ReadonlyVec3} up    the vector representing the local "up" direction
 * @returns {Quat} out
 */
export const setAxes = (function () {
	let matr = mat3Create();

	return function (
		out: ReadonlyVec3,
		view: ReadonlyVec3,
		right: ReadonlyVec3,
		up: ReadonlyVec3,
	) {
		matr[0] = right[0];
		matr[3] = right[1];
		matr[6] = right[2];

		matr[1] = up[0];
		matr[4] = up[1];
		matr[7] = up[2];

		matr[2] = -view[0];
		matr[5] = -view[1];
		matr[8] = -view[2];

		return quatNormalize(out, quatFromMat3(out, matr));
	};
})();
