import { Vec2, vec2Create } from '@nonphoto/gl-matrix'
import { Body } from './body.js'
import { Body1d, create as body1dCreate } from './body1d.js'
import { spring as coreSpring, simpleSpring as coreSimpleSpring } from '@nonphoto/spring'
import { equals } from './common.js'

/**
 * A 2-dimensional physics body
 */
export interface Body2d extends Body<Vec2> {
  x: Body1d
  y: Body1d
}

/**
 * Creates a new 2-dimensional physics body.
 * @remarks The x and y properties of the body are proxied to p and v properties' x and y components.
 */
export function create(): Body2d {
  const self: Body2d = {
    p: vec2Create(),
    v: vec2Create(),
    x: Object.defineProperties(body1dCreate(), {
      p: {
        get() {
          return self.p[0]
        },
        set(value: number) {
          self.p[0] = value
        },
      },
      v: {
        get() {
          return self.v[0]
        },
        set(value: number) {
          self.v[0] = value
        },
      },
    }),
    y: Object.defineProperties(body1dCreate(), {
      p: {
        get() {
          return self.p[1]
        },
        set(value: number) {
          self.p[1] = value
        },
      },
      v: {
        get() {
          return self.v[1]
        },
        set(value: number) {
          self.v[1] = value
        },
      },
    }),
  }

  return self
}

/**
 * Returns true if the body is at rest.
 */
export function isAtRest(body: Readonly<Body2d>, p: Vec2): boolean {
  return (
    equals(body.p[0], p[0]) &&
    equals(body.p[1], p[1]) &&
    equals(body.v[0], 0) &&
    equals(body.v[1], 0)
  )
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
  out: Body2d,
  start: Readonly<Body2d>,
  end: Readonly<Body2d>,
  halflife: number,
  dampingRatio: number,
  dt: number,
) {
  coreSpring(
    out.p,
    0,
    out.v,
    0,
    start.p[0],
    start.v[0],
    end.p[0],
    end.v[0],
    halflife,
    dampingRatio,
    dt,
  )
  coreSpring(
    out.p,
    1,
    out.v,
    1,
    start.p[1],
    start.v[1],
    end.p[1],
    end.v[1],
    halflife,
    dampingRatio,
    dt,
  )
  return out
}

/**
 * Applies a spring force to the body.
 *
 * @remarks The damping ratio is assumed to be 1, and the end velocity is assumed to be the zero vector.
 *
 * @param out - The receiving body.
 * @param start - A body representing the start position of the spring.
 * @param end - A 2d vector representing the end position of the spring.
 * @param halflife - The spring halflife.
 * @param dt - The elapsed time.
 * @returns The receiving body with the spring force applied over the elapsed time.
 */
export function simpleSpring(
  out: Body2d,
  start: Readonly<Body2d>,
  end: Readonly<Vec2>,
  halflife: number,
  dt: number,
) {
  coreSimpleSpring(out.p, 0, out.v, 0, start.p[0], start.v[0], end[0], halflife, dt)
  coreSimpleSpring(out.p, 1, out.v, 1, start.p[1], start.v[1], end[1], halflife, dt)
  return out
}
