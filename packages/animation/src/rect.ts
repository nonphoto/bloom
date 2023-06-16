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

  export function getCenterX(rect: Type): number {
    return rect.x + rect.width / 2
  }

  export function getCenterY(rect: Type): number {
    return rect.y + rect.height / 2
  }

  export function getTranslation(out: vec2, rect: Type): vec2 {
    return vec2.set(out, getCenterX(rect), getCenterY(rect))
  }

  export function getScaling(out: vec2, rect: Type): vec2 {
    return vec2.set(out, rect.width, rect.height)
  }

  export function fromTranslationScaling(
    out: Type,
    translation: Readonly<vec2>,
    scaling: Readonly<vec2>,
  ): Type {
    out.x = translation[0]
    out.y = translation[1]
    out.width = scaling[0]
    out.height = scaling[1]
    return out
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

  export function divide(out: mat2d, a: Type, b: Type) {
    out[0] = a.width / b.width
    out[1] = 0
    out[2] = 0
    out[3] = a.height / b.height
    out[4] = a.x + a.width / 2 - (b.x + b.width / 2)
    out[5] = a.y + a.height / 2 - (b.y + b.height / 2)
    return out
  }
}
