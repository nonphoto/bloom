import { MaybeAccessor } from '@solid-primitives/utils'

type ConstructorParameters<T extends new (...args: any[]) => {}> = T extends new (
  ...args: infer P
) => any
  ? P
  : never

type MapAccessors<T extends any[]> = {
  [K in keyof T]: MaybeAccessor<T[K]>
}

type MapAccessorParameters<T extends (...args: any) => any, R> = (
  ...args: MapAccessors<Parameters<T>> & unknown[]
) => R

export function createReactiveBuilder<T extends new (...args: any[]) => {}>(constructor: T) {
  type ReactiveBuilder = new (...args: ConstructorParameters<T>) => {
    [K in keyof InstanceType<T>]: InstanceType<T>[K] extends (...args: any[]) => any
      ? MapAccessorParameters<InstanceType<T>[K], ReactiveBuilder>
      : InstanceType<T>[K]
  }

  function createProxy(target: any) {
    return new Proxy(target, {
      get(t: typeof target, p: keyof typeof target) {
        if (p in t) {
          const value = t[p]
          if (typeof value === 'function') {
            return (...args: MapAccessors<Parameters<typeof value>>) => {
              value(...args)
            }
          }
        }
      },
    })
  }

  return class reactiveConstructor extends constructor {
    constructor(...superArgs: any[]) {
      super(...superArgs)
      return createProxy(this as unknown as ReactiveBuilder)
    }
  }
}
