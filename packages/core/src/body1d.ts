import { Body } from './body.js'
import { spring as coreSpring } from '@nonphoto/spring'
import { equals } from '@chloranthy/gl-matrix'

/**
 * A 1-dimensional physics body
 */
export interface Body1d extends Body<number> {}

/**
 * Creates a new 1-dimensional physics body
 */
export function create(): Body1d {
  return {
    p: 0,
    v: 0,
  }
}

/**
 * Copies the properties of one body to another
 */
export function copy(out: Body1d, body: Readonly<Body1d>): Body1d {
  out.p = body.p
  out.v = body.v
  return out
}

/**
 * Sets the properties of a body
 */
export function set(out: Body1d, p?: number, v?: number): Body1d {
  out.p = p ?? out.p
  out.v = v ?? out.v
  return out
}

/**
 * Returns true if the body is at rest.
 */
export function isAtRest(body: Readonly<Body1d>, p: number): boolean {
  return equals(body.p, p) && equals(body.v, 0)
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
  out: Body1d,
  start: Readonly<Body1d>,
  end: Readonly<Body1d>,
  halflife: number,
  dampingRatio: number,
  dt: number,
) {
  coreSpring(out, 'p', out, 'v', start.p, start.v, end.p, end.v, halflife, dampingRatio, dt)
  return out
}
