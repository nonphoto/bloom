import { vec2 } from 'gl-matrix'
import { Axis } from './axis'

export class Axis2 {
  p: vec2
  v: vec2
  x: Axis
  y: Axis

  constructor()
  constructor(x: number, y: number)
  constructor(x?: number, y?: number) {
    this.p = [x ?? 0, y ?? 0]
    this.v = [0, 0]
    this.x = Axis.createProxy<number>(this.p, 0, this.v, 0)
    this.y = Axis.createProxy<number>(this.p, 1, this.v, 1)
  }

  static copy(out: Axis2, a: Axis2): Axis2 {
    vec2.copy(out.p, a.p)
    vec2.copy(out.v, a.v)
    return out
  }

  static zero(a: Axis2): Axis2 {
    return Axis2.set(a, 0, 0, 0, 0)
  }

  static set(a: Axis2, px: number, py: number, vx: number, vy: number): Axis2 {
    vec2.set(a.p, px, py)
    vec2.set(a.v, vx, vy)
    return a
  }

  static equals(a: Axis2, b: Axis2): boolean {
    return Axis.equals(a.x, b.x) && Axis.equals(a.y, b.y)
  }

  static exactEquals(a: Axis2, b: Axis2): boolean {
    return Axis.exactEquals(a.x, b.x) && Axis.exactEquals(a.y, b.y)
  }

  static criticalSpring(out: Axis2, start: Axis2, end: Axis2, halflife: number, dt: number) {
    Axis.criticalSpring(out.x, start.x, end.x, halflife, dt)
    Axis.criticalSpring(out.y, start.y, end.y, halflife, dt)
    return out
  }

  static isAtRest(a: Axis2) {
    return Axis.isAtRest(a.x) && Axis.isAtRest(a.y)
  }
}
