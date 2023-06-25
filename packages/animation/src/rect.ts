import { mat2d, vec2 } from 'gl-matrix'

export namespace Rect {
  export interface Type {
    x: number
    y: number
    width: number
    height: number
  }

  export class Instance implements Type {
    x = 0
    y = 0
    width = 0
    height = 0
  }

  export function cx(rect: Type): number {
    return rect.x + rect.width / 2
  }

  export function cy(rect: Type): number {
    return rect.y + rect.height / 2
  }

  export function position(out: vec2, rect: Type): vec2 {
    return vec2.set(out, cx(rect), cy(rect))
  }

  export function size(out: vec2, rect: Type): vec2 {
    return vec2.set(out, rect.width, rect.height)
  }

  export function fit(
    out: Type,
    source: Readonly<Type>,
    target: Readonly<Type>,
    compare: (a: number, b: number) => number,
  ): Type {
    const sx = target.width / source.width
    const sy = target.height / source.height
    const s = compare(sx, sy)
    out.width *= s
    out.height *= s
    out.x = target.x
    out.y = target.y
    return out
  }

  export function contain(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
    return fit(out, source, target, Math.min)
  }

  export function cover(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
    return fit(out, source, target, Math.max)
  }

  export function untransform(out: mat2d, source: Type, target: Type) {
    out[0] = target.width / source.width
    out[1] = 0
    out[2] = 0
    out[3] = target.height / source.height
    out[4] = cx(target) - cx(source)
    out[5] = cy(target) - cy(source)
    return out
  }
}
