import { LayoutObserver } from '@chloranthy/layout-observer'
import { createEffect, onCleanup } from 'solid-js'
import { createSingletonRoot } from '@solid-primitives/rootless'
import { Directive } from '@solid-primitives/utils'
import { mat2d } from 'gl-matrix'

export { createComputedStyle } from '@chloranthy/layout-observer'
export { createReactiveBuilder } from './createReactiveBuilder'

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
