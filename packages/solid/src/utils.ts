import { MaybeAccessor as SolidMaybeAccessor, access } from '@solid-primitives/utils'
import { Accessor, createMemo } from 'solid-js'
import { mat2d } from 'gl-matrix'

/**
 * @private
 */
export type MaybeAccessor<T> = SolidMaybeAccessor<T>

/**
 * @private
 */
export type MapMaybeAccessor<T> = T extends any[]
  ? {
      [K in keyof T]: MaybeAccessor<T[K] | undefined>
    }
  : never

/**
 * @private
 */
export function maybe<F extends (...args: any[]) => any>(
  fn: F,
  ...args: MapMaybeAccessor<Parameters<F>>
): ReturnType<F> | undefined {
  const values = args.map(access)
  if (!values.some(value => value == null)) {
    return fn(...values)
  }
}

/**
 * @private
 */
export function createMaybeMemo<F extends (...args: any[]) => any>(
  fn: F,
  ...args: MapMaybeAccessor<Parameters<F>>
): Accessor<ReturnType<F> | undefined> {
  return createMemo<ReturnType<F> | undefined>(() => maybe(fn, ...args), undefined, {
    equals: false,
  })
}

/**
 * @private
 */
export function styleBorderRadius(radius: number, rect: DOMRect, transform: mat2d) {
  const x = (radius / (rect.width * transform[0])) * 100
  const y = (radius / (rect.height * transform[3])) * 100
  return `${x}% / ${y}%`
}

/**
 * @private
 */
export function safeWindow() {
  return typeof window !== 'undefined' ? window : undefined
}
