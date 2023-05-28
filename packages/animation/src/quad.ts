import { Axis2 } from './axis2'
import { Axis } from './axis'
import { mat2d, vec2 } from 'gl-matrix'

export class Quad {
  translation: Axis2
  scaling: Axis2
  rotation: Axis

  constructor() {
    this.translation = new Axis2()
    this.scaling = new Axis2(1, 1)
    this.rotation = new Axis()
  }

  static create() {
    return new Quad()
  }

  static fromDOMRect(out: Quad, source: DOMRect): Quad {
    out.translation.p[0] = source.x + source.width / 2
    out.translation.p[1] = source.y + source.height / 2
    out.scaling.p[0] = source.width
    out.scaling.p[1] = source.height
    return out
  }

  static divide(out: mat2d, a: Quad, b: Quad): mat2d {
    const v0 = a.scaling.p[0] / b.scaling.p[0]
    const v1 = a.scaling.p[1] / b.scaling.p[1]
    const rad = a.rotation.p - b.rotation.p
    const s = Math.sin(rad)
    const c = Math.cos(rad)
    out[0] = c * v0
    out[1] = s * v0
    out[2] = -s * v1
    out[3] = c * v1
    out[4] = a.translation.p[0] - b.translation.p[0]
    out[5] = a.translation.p[1] - b.translation.p[1]
    return out
  }

  static fit(
    out: Quad,
    source: Quad,
    target: Quad,
    compare: (a: number, b: number) => number,
  ): Quad {
    const sx = target.scaling.p[0] / source.scaling.p[0]
    const sy = target.scaling.p[1] / source.scaling.p[1]
    Axis2.copy(out.translation, target.translation)
    vec2.scale(out.scaling.p, source.scaling.p, compare(sx, sy))
    vec2.copy(out.scaling.v, target.scaling.v)
    Axis.copy(out.rotation, target.rotation)
    return out
  }

  static contain(out: Quad, source: Quad, target: Quad): Quad {
    return Quad.fit(out, source, target, Math.min)
  }

  static cover(out: Quad, source: Quad, target: Quad): Quad {
    return Quad.fit(out, source, target, Math.max)
  }

  static copy(out: Quad, a: Quad): Quad {
    Axis2.copy(out.translation, a.translation)
    Axis2.copy(out.scaling, a.scaling)
    Axis.copy(out.rotation, a.rotation)
    return out
  }

  static zero(out: Quad) {
    Axis2.zero(out.translation)
    Axis2.set(out.scaling, 1, 1, 0, 0)
    Axis.zero(out.rotation)
    return out
  }
}
