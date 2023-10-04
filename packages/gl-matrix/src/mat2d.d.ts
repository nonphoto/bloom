import { Mat2d, ReadonlyMat2d } from './types.d.ts'

export function create(): Mat2d
export function clone(a: ReadonlyMat2d): Mat2d
export function copy(out: Mat2d, a: ReadonlyMat2d): Mat2d
export function identity(out: Mat2d): Mat2d
export function fromValues(
  a: number,
  b: number,
  c: number,
  d: number,
  tx: number,
  ty: number,
): Mat2d
export function set(
  out: Mat2d,
  a: number,
  b: number,
  c: number,
  d: number,
  tx: number,
  ty: number,
): Mat2d
export function invert(out: Mat2d, a: ReadonlyMat2d): Mat2d
export function determinant(a: ReadonlyMat2d): number
export function multiply(out: Mat2d, a: ReadonlyMat2d, b: ReadonlyMat2d): Mat2d
export function rotate(out: Mat2d, a: ReadonlyMat2d, rad: number): Mat2d
export function scale(out: Mat2d, a: ReadonlyMat2d, v: ReadonlyVec2): Mat2d
export function translate(out: Mat2d, a: ReadonlyMat2d, v: ReadonlyVec2): Mat2d
export function fromRotation(out: Mat2d, rad: number): Mat2d
export function fromScaling(out: Mat2d, v: ReadonlyVec2): Mat2d
export function fromTranslation(out: Mat2d, v: ReadonlyVec2): Mat2d
export function str(a: ReadonlyMat2d): string
export function frob(a: ReadonlyMat2d): number
export function add(out: Mat2d, a: ReadonlyMat2d, b: ReadonlyMat2d): Mat2d
export function subtract(out: Mat2d, a: ReadonlyMat2d, b: ReadonlyMat2d): Mat2d
export function multiplyScalar(out: Mat2d, a: ReadonlyMat2d, b: number): Mat2d
export function multiplyScalarAndAdd(
  out: Mat2d,
  a: ReadonlyMat2d,
  b: ReadonlyMat2d,
  scale: number,
): Mat2d
export function exactEquals(a: ReadonlyMat2d, b: ReadonlyMat2d): boolean
export function equals(a: ReadonlyMat2d, b: ReadonlyMat2d): boolean
export function mul(out: Mat2d, a: ReadonlyMat2d, b: ReadonlyMat2d): Mat2d
export function sub(out: Mat2d, a: ReadonlyMat2d, b: ReadonlyMat2d): Mat2d
export function zero(out: Mat2d): Mat2d

export { Mat2d, ReadonlyMat2d }
