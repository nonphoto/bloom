import { Mat2, ReadonlyMat2 } from './types.d.ts'

export function create(): Mat2
export function clone(a: ReadonlyMat2): Mat2
export function copy(out: Mat2, a: ReadonlyMat2): Mat2
export function identity(out: Mat2): Mat2
export function fromValues(m00: number, m01: number, m10: number, m11: number): Mat2
export function set(out: Mat2, m00: number, m01: number, m10: number, m11: number): Mat2
export function transpose(out: Mat2, a: ReadonlyMat2): Mat2
export function invert(out: Mat2, a: ReadonlyMat2): Mat2
export function adjoint(out: Mat2, a: ReadonlyMat2): Mat2
export function determinant(a: ReadonlyMat2): number
export function multiply(out: Mat2, a: ReadonlyMat2, b: ReadonlyMat2): Mat2
export function rotate(out: Mat2, a: ReadonlyMat2, rad: number): Mat2
export function scale(out: Mat2, a: ReadonlyMat2, v: ReadonlyVec2): Mat2
export function fromRotation(out: Mat2, rad: number): Mat2
export function fromScaling(out: Mat2, v: ReadonlyVec2): Mat2
export function str(a: ReadonlyMat2): string
export function frob(a: ReadonlyMat2): number
export function LDU(L: ReadonlyMat2, D: ReadonlyMat2, U: ReadonlyMat2, a: ReadonlyMat2): any[]
export function add(out: Mat2, a: ReadonlyMat2, b: ReadonlyMat2): Mat2
export function subtract(out: Mat2, a: ReadonlyMat2, b: ReadonlyMat2): Mat2
export function exactEquals(a: ReadonlyMat2, b: ReadonlyMat2): boolean
export function equals(a: ReadonlyMat2, b: ReadonlyMat2): boolean
export function multiplyScalar(out: Mat2, a: ReadonlyMat2, b: number): Mat2
export function multiplyScalarAndAdd(
  out: Mat2,
  a: ReadonlyMat2,
  b: ReadonlyMat2,
  scale: number,
): Mat2
export function mul(out: Mat2, a: ReadonlyMat2, b: ReadonlyMat2): Mat2
export function sub(out: Mat2, a: ReadonlyMat2, b: ReadonlyMat2): Mat2

export { Mat2, ReadonlyMat2 }
