import { MaybeAccessor, access } from '@solid-primitives/utils'
import { Accessor, createMemo } from 'solid-js'
import { mat2d } from 'gl-matrix'

export type Maybe<T> = MaybeAccessor<T | undefined>

export type MapMaybe<T> = T extends any[]
  ? {
      [K in keyof T]: Maybe<T[K]>
    }
  : never

export function maybe<F extends (...args: any[]) => any>(
  fn: F,
  ...args: MapMaybe<Parameters<F>>
): ReturnType<F> | undefined {
  const values = args.map(access)
  if (!values.some(value => value == null)) {
    return fn(...values)
  }
}

export function createMaybeMemo<F extends (...args: any[]) => any>(
  fn: F,
  ...args: MapMaybe<Parameters<F>>
): Accessor<ReturnType<F> | undefined> {
  return createMemo<ReturnType<F> | undefined>(() => maybe(fn, ...args), undefined, {
    equals: false,
  })
}

export function styleBorderRadius(radius: number, rect: DOMRect, transform: mat2d) {
  const x = (radius / (rect.width * transform[0])) * 100
  const y = (radius / (rect.height * transform[3])) * 100
  return `${x}% / ${y}%`
}
