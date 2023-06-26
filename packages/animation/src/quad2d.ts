import { mat2, mat2d, vec2 } from 'gl-matrix'
import { Rect } from './rect'

export namespace Quad2d {
  export type Type = {
    ij: mat2
    k: vec2
  }

  export class Instance implements Type {
    ij = mat2.create()
    k = vec2.create()
  }

  export function create(): Instance {
    return new Instance()
  }

  export function fromRect(out: Type, rect: Readonly<Rect.Type>): Type {
    const w = rect.width / 2,
      h = rect.height / 2
    out.ij[0] = w
    out.ij[1] = 0
    out.ij[2] = 0
    out.ij[3] = h
    out.k[0] = rect.x + w
    out.k[1] = rect.y + h
    return out
  }

  export function fromPositionSize(out: Type, position: Readonly<vec2>, size: Readonly<vec2>) {
    const w = size[0] / 2,
      h = size[1] / 2
    out.ij[0] = w
    out.ij[1] = 0
    out.ij[2] = 0
    out.ij[3] = h
    out.k[0] = position[0]
    out.k[1] = position[1]
    return out
  }

  export function transformMat2d(out: Type, quad: Readonly<Type>, matrix: Readonly<mat2d>): Type {
    mat2.multiply(out.ij, quad.ij, matrix as mat2)
    out.k[0] = quad.k[0] + matrix[4]
    out.k[1] = quad.k[1] + matrix[5]
    return out
  }

  export function untransformMat2d(
    out: mat2d,
    source: Readonly<Type>,
    target: Readonly<Type>,
  ): mat2d {
    mat2.invert(out as mat2, source.ij)
    mat2.multiply(out as mat2, target.ij, out as mat2)
    out[4] = target.k[0] - source.k[0]
    out[5] = target.k[1] - source.k[1]
    return out
  }

  export function fit(
    out: Type,
    source: Readonly<Type>,
    target: Readonly<Type>,
    compare: (a: number, b: number) => number,
  ): Type {
    const sx = target.ij[0] / source.ij[0]
    const sy = target.ij[3] / source.ij[3]
    const s = compare(sx, sy)
    vec2.copy(out.k, target.k)
    out.ij[0] = source.ij[0] * s
    out.ij[3] = source.ij[3] * s
    return out
  }

  export function contain(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
    return fit(out, source, target, Math.min)
  }

  export function cover(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
    return fit(out, source, target, Math.max)
  }

  export function equals(a: Readonly<Type>, b: Readonly<Type>) {
    return mat2.equals(a.ij, b.ij) && vec2.equals(a.k, b.k)
  }
}
