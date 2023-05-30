import { MaybeAccessor, access } from '@solid-primitives/utils'
import { Accessor, createMemo } from 'solid-js'

export type Maybe<T> = MaybeAccessor<T | undefined>

export type MapMaybe<T> = T extends any[]
  ? {
      [K in keyof T]: Maybe<T[K]>
    }
  : never

export function createMaybeMemo<F extends (...args: any[]) => any>(
  fn: F,
  ...args: MapMaybe<Parameters<F>>
): Accessor<ReturnType<F> | undefined> {
  return createMemo<ReturnType<F> | undefined>(
    () => {
      const values = args.map(access)
      if (!values.some(value => value == null)) {
        return fn(...values)
      }
    },
    undefined,
    { equals: false },
  )
}
