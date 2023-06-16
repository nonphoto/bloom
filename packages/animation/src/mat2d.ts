import { vec2, mat2d } from 'gl-matrix'
import { Rect } from './rect'

export namespace Mat2d {
  export type Type = mat2d

  export const create = mat2d.create

  export const translate = mat2d.translate

  export const scale = mat2d.scale

  export function fromRect(out: Type, rect: Readonly<Rect.Type>): Type {
    out[0] = rect.width
    out[1] = 0
    out[2] = 0
    out[3] = rect.height
    out[4] = Rect.getCenterX(rect)
    out[5] = Rect.getCenterY(rect)
    return out
  }

  export function fit(
    out: Type,
    source: Readonly<Type>,
    target: Readonly<Type>,
    compare: (a: number, b: number) => number,
  ): Type {
    const sx = target[0] / source[0]
    const sy = target[3] / source[3]
    const s = compare(sx, sy)
    mat2d.copy(out, target)
    out[0] *= s
    out[1] *= s
    return out
  }

  export function contain(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
    return fit(out, source, target, Math.min)
  }

  export function cover(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
    return fit(out, source, target, Math.max)
  }

  export class DecompositionError extends Error {
    message = `Unable to decompose non-transformation matrix`
  }

  export function decompose(
    outTranslation: vec2,
    outScaling: vec2,
    outShearing: vec2,
    mat: mat2d,
  ): number {
    const a = mat[0]
    const b = mat[1]
    const c = mat[2]
    const d = mat[3]
    const e = mat[4]
    const f = mat[5]

    const delta = a * d - b * c

    outTranslation[0] = e
    outTranslation[1] = f

    if (a != 0 || b != 0) {
      const r = Math.sqrt(a * a + b * b)
      outScaling[0] = r
      outScaling[1] = delta / r
      outShearing[0] = Math.atan((a * c + b * d) / (r * r))
      outShearing[1] = 0
      return b > 0 ? Math.acos(a / r) : -Math.acos(a / r)
    } else if (c != 0 || d != 0) {
      const s = Math.sqrt(c * c + d * d)
      outScaling[0] = delta / s
      outScaling[1] = s
      outShearing[0] = 0
      outShearing[1] = Math.atan((a * c + b * d) / (s * s))
      return Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s))
    } else {
      throw new DecompositionError()
    }
  }
}
