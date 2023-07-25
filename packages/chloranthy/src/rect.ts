import { mat2d, vec2 } from 'gl-matrix'
import * as common from './common'

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

  export function create(): Instance {
    return new Instance()
  }

  export function cx(rect: Readonly<Type>): number {
    return rect.x + rect.width / 2
  }

  export function cy(rect: Readonly<Type>): number {
    return rect.y + rect.height / 2
  }

  export function setcx(rect: Type, cx: number) {
    rect.x = cx - rect.width / 2
  }

  export function setcy(rect: Type, cy: number) {
    rect.y = cy - rect.height / 2
  }

  export function position(out: vec2, rect: Type): vec2 {
    return vec2.set(out, cx(rect), cy(rect))
  }

  export function size(out: vec2, rect: Type): vec2 {
    return vec2.set(out, rect.width, rect.height)
  }

  export function setAspectRatio(
    out: Type,
    source: Readonly<Type>,
    aspectRatio: number,
    compare: (a: number, b: number) => number,
  ): Type {
    common.setAspectRatio(out, 'width', 'height', source.width, source.height, aspectRatio, compare)
    setcx(out, cx(source))
    setcy(out, cy(source))
    return out
  }

  export function fit(
    out: Type,
    source: Readonly<Type>,
    target: Readonly<Type>,
    compare: (a: number, b: number) => number,
  ): Type {
    common.fit(
      out,
      'width',
      'height',
      source.width,
      source.height,
      target.width,
      target.height,
      compare,
    )
    setcx(out, cx(target))
    setcy(out, cy(target))
    return out
  }

  export function contain(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
    return fit(out, source, target, Math.min)
  }

  export function cover(out: Type, source: Readonly<Type>, target: Readonly<Type>): Type {
    return fit(out, source, target, Math.max)
  }

  export function untransformMat2d(out: mat2d, source: Type, target: Type) {
    out[0] = target.width / source.width
    out[1] = 0
    out[2] = 0
    out[3] = target.height / source.height
    out[4] = cx(target) - cx(source)
    out[5] = cy(target) - cy(source)
    return out
  }
}
