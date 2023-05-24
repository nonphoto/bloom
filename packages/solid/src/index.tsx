import { LayoutObserver } from '@chloranthy/layout-observer'
import { createEffect, onCleanup } from 'solid-js'
import { createSingletonRoot } from '@solid-primitives/rootless'
import { Directive } from '@solid-primitives/utils'
import { mat2d } from 'gl-matrix'

export const useLayoutObserver = createSingletonRoot(() => {
  const layoutObserver = new LayoutObserver()

  onCleanup(() => {
    layoutObserver.dispose()
  })

  return layoutObserver
})

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      transform: mat2d
    }
  }
}

export const transform: Directive<mat2d> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutObserver()

    createEffect(() => {
      layout.setTransform(target, value())
    })
  }
}

type Constructor<T> = new (...args: any[]) => T

export function createReactiveBuilder<T extends Constructor<{}>>(Base: T) {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args)
      return new Proxy(this, {
        get(target, prop) {
          if (prop in target) {
            // TODO
          }
        },
      })
    }
  }
}
