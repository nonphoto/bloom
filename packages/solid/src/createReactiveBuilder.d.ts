import type { MaybeAccessor } from '@solid-primitives/utils'

type ConstructorParameters<T extends new (...args: any[]) => {}> = T extends new (
  ...args: infer P
) => any
  ? P
  : never

type MapAccessors<T extends any[]> = {
  [K in keyof T]: MaybeAccessor<T[K]>
}

type MapAccessorParameters<T extends (...args: any[]) => any, R> = (
  ...args: MapAccessors<Parameters<T>>
) => R

type ReactiveBuilder<T> = new () => {
  [K in keyof T]: MapAccessorParameters<T[K], ReactiveBuilder<T>>
}

export function createReactiveBuilder<T extends { [index: string]: any }>(
  builder: T,
): ReactiveBuilder<T>
