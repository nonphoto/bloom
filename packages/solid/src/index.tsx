import { LayoutObserver } from '@chloranthy/layout-observer'
import { createEffect, onCleanup } from 'solid-js'
import { createSingletonRoot } from '@solid-primitives/rootless'
import { Directive } from '@solid-primitives/utils'
import { mat2d } from 'gl-matrix'
import { createMaybeMemo, maybe } from './utils'

export { createComputedStyle } from '@chloranthy/layout-observer'
export * from './utils'

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      transform: mat2d | undefined
      borderRadius: number | undefined
    }
  }
}

export const useLayoutObserver = createSingletonRoot(() => {
  const layoutObserver = new LayoutObserver()

  onCleanup(() => {
    layoutObserver.dispose()
  })

  return layoutObserver
})

export const transform: Directive<mat2d | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutObserver()

    createEffect(() => {
      layout.setTransform(target, value())
    })
  }
}

function styleBorderRadius(radius: number, rect: DOMRect, transform: mat2d) {
  const x = (radius / (rect.width * transform[0])) * 100
  const y = (radius / (rect.height * transform[3])) * 100
  return `${x}% / ${y}%`
}

export const borderRadius: Directive<number | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutObserver()
    const rect = layout.useRect(target)
    const matrix = layout.useMatrix(target)
    const transform = layout.useTransform(target)

    const totalTransform = createMaybeMemo(mat2d.multiply, mat2d.create(), matrix, transform)

    createEffect(() => {
      target.style.borderRadius = maybe(styleBorderRadius, value, rect, totalTransform) ?? ''
    })
  }
}
