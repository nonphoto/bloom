import { Body } from './body'
import { spring as coreSpring } from '@nonphoto/spring'
import { glMatrix } from 'gl-matrix'

/**
 * A 1-dimensional physics body
 */
export interface Type extends Body<number> {}

/**
 * Creates a new 1-dimensional physics body
 */
export class Instance implements Type {
  p = 0
  v = 0
}

/**
 * Copies the properties of one body to another
 */
export function copy(out: Type, body: Readonly<Type>): Type {
  out.p = body.p
  out.v = body.v
  return out
}

/**
 * Sets the properties of a body
 */
export function set(out: Type, p?: number, v?: number): Type {
  out.p = p ?? out.p
  out.v = v ?? out.v
  return out
}

/**
 * Returns true if the body is at rest.
 */
export function isAtRest(body: Readonly<Type>, p: number): boolean {
  return glMatrix.equals(body.p, p) && glMatrix.equals(body.v, 0)
}

/**
 * Applies a spring force to the body.
 *
 * @param out - The receiving body.
 * @param start - A body representing the start position of the spring.
 * @param end - A body representing the end position of the spring.
 * @param halflife - The spring halflife.
 * @param dampingRatio - The spring damping ratio.
 * @param dt - The elapsed time.
 * @returns The receiving body with the spring force applied over the elapsed time.
 */
export function spring(
  out: Type,
  start: Readonly<Type>,
  end: Readonly<Type>,
  halflife: number,
  dampingRatio: number,
  dt: number,
) {
  coreSpring(out, 'p', out, 'v', start.p, start.v, end.p, end.v, halflife, dampingRatio, dt)
  return out
}
