import { criticalSpring } from './spring'
import { defaultEpsilon } from './utils'

export class Axis {
  p: number
  v: number

  constructor(p?: number, v?: number) {
    this.p = p ?? 0
    this.v = v ?? 0
  }

  static createProxy<T extends string | number, U extends string | number = T>(
    p: Record<T, number>,
    pKey: T,
    v: Record<U, number>,
    vKey: U,
  ): Axis {
    const result = Object.defineProperties(new Axis(), {
      p: {
        get() {
          return p[pKey]
        },
        set(value: number) {
          p[pKey] = value
        },
      },
      v: {
        get() {
          return v[vKey]
        },
        set(value: number) {
          v[vKey] = value
        },
      },
    })
    return result
  }

  static copy(out: Axis, a: Axis) {
    out.p = a.p
    out.p = a.p
    return out
  }

  static clone(a: Axis) {
    return Axis.copy(new Axis(), a)
  }

  static zero(a: Axis) {
    return Axis.set(a, 0, 0)
  }

  static set(a: Axis, p: number, v: number) {
    a.p = p
    a.v = v
    return a
  }

  static exactEquals(a: Axis, b: Axis) {
    return a.p === b.p && a.v === b.v
  }

  static equals(a: Axis, b: Axis, epsilon: number = defaultEpsilon) {
    return Math.abs(b.p - a.p) <= epsilon && Math.abs(b.v - a.v) <= epsilon
  }

  static criticalSpring = criticalSpring

  static isAtRest(a: Axis, b: Axis, epsilon: number = defaultEpsilon) {
    return Math.abs(a.p - b.p) <= epsilon && Math.abs(a.v - b.v) <= epsilon
  }
}
