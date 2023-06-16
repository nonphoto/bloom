import { vec2 } from 'gl-matrix'
import { Body } from './body'
import { Body1d } from './body1d'
import { Spring } from './spring'
import { defaultEpsilon } from './utils'

export namespace Body2d {
  export interface Type extends Body<vec2> {}

  export class Instance implements Type {
    p = vec2.create()
    v = vec2.create()
    x: Body1d.Instance
    y: Body1d.Instance

    constructor() {
      const self = this
      this.x = Object.defineProperties(new Body1d.Instance(), {
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
      })
      this.y = Object.defineProperties(new Body1d.Instance(), {
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
      })
    }
  }

  export function isAtRest(body: Readonly<Type>, epsilon = defaultEpsilon): boolean {
    return (
      Math.abs(body.p[0]) <= epsilon &&
      Math.abs(body.p[1]) <= epsilon &&
      Math.abs(body.v[0]) <= epsilon &&
      Math.abs(body.v[1]) <= epsilon
    )
  }

  export function criticalSpring(
    out: Type,
    start: Readonly<Type>,
    end: Readonly<Type>,
    halflife: number,
    dt: number,
  ) {
    Spring.criticalSpring(
      out.p,
      0,
      out.v,
      0,
      start.p[0],
      start.v[0],
      end.p[0],
      end.v[0],
      halflife,
      dt,
    )
    Spring.criticalSpring(
      out.p,
      1,
      out.v,
      1,
      start.p[1],
      start.v[1],
      end.p[1],
      end.v[1],
      halflife,
      dt,
    )
    return out
  }

  export function simpleSpring(
    out: Type,
    start: Readonly<Type>,
    end: Readonly<vec2>,
    halflife: number,
    dt: number,
  ) {
    Spring.simpleSpring(out.p, 0, out.v, 0, start.p[0], start.v[0], end[0], halflife, dt)
    Spring.simpleSpring(out.p, 1, out.v, 1, start.p[1], start.v[1], end[1], halflife, dt)
    return out
  }
}
