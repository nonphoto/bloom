import { Vec2, ReadonlyVec2 } from './types.d.ts'

export function create(): Vec2
export function clone(a: ReadonlyVec2): Vec2
export function fromValues(x: number, y: number): Vec2
export function copy(out: Vec2, a: ReadonlyVec2): Vec2
export function set(out: Vec2, x: number, y: number): Vec2
export function add(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2): Vec2
export function subtract(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2): Vec2
export function multiply(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2): Vec2
export function divide(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2): Vec2
export function ceil(out: Vec2, a: ReadonlyVec2): Vec2
export function floor(out: Vec2, a: ReadonlyVec2): Vec2
export function min(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2): Vec2
export function max(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2): Vec2
export function round(out: Vec2, a: ReadonlyVec2): Vec2
export function scale(out: Vec2, a: ReadonlyVec2, b: number): Vec2
export function scaleAndAdd(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2, scale: number): Vec2
export function distance(a: ReadonlyVec2, b: ReadonlyVec2): number
export function squaredDistance(a: ReadonlyVec2, b: ReadonlyVec2): number
export function length(a: ReadonlyVec2): number
export function squaredLength(a: ReadonlyVec2): number
export function negate(out: Vec2, a: ReadonlyVec2): Vec2
export function inverse(out: Vec2, a: ReadonlyVec2): Vec2
export function normalize(out: Vec2, a: ReadonlyVec2): Vec2
export function dot(a: ReadonlyVec2, b: ReadonlyVec2): number
export function cross(out: vec3, a: ReadonlyVec2, b: ReadonlyVec2): vec3
export function lerp(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2, t: number): Vec2
export function random(out: Vec2, scale?: number): Vec2
export function transformMat2(out: Vec2, a: ReadonlyVec2, m: ReadonlyMat2): Vec2
export function transformMat2d(out: Vec2, a: ReadonlyVec2, m: ReadonlyMat2d): Vec2
export function transformMat3(out: Vec2, a: ReadonlyVec2, m: ReadonlyMat3): Vec2
export function transformMat4(out: Vec2, a: ReadonlyVec2, m: ReadonlyMat4): Vec2
export function rotate(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2, rad: number): Vec2
export function angle(a: ReadonlyVec2, b: ReadonlyVec2): number
export function zero(out: Vec2): Vec2
export function str(a: ReadonlyVec2): string
export function exactEquals(a: ReadonlyVec2, b: ReadonlyVec2): boolean
export function equals(a: ReadonlyVec2, b: ReadonlyVec2): boolean
export function len(a: ReadonlyVec2): number
export function sub(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2): Vec2
export function mul(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2): Vec2
export function div(out: Vec2, a: ReadonlyVec2, b: ReadonlyVec2): Vec2
export function dist(a: ReadonlyVec2, b: ReadonlyVec2): number
export function sqrDist(a: ReadonlyVec2, b: ReadonlyVec2): number
export function sqrLen(a: ReadonlyVec2): number
export function forEach(a: any, stride: any, offset: any, count: any, fn: any, arg: any): any

export { Vec2, ReadonlyVec2 }
