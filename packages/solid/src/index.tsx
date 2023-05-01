import { createSingletonRoot } from '@solid-primitives/rootless'
import { Layout, LayoutObserver, rect } from '@chloranthy/core'
import { createElementSize } from '@solid-primitives/resize-observer'
import { Accessor, createEffect, createMemo, on, onCleanup } from 'solid-js'
import { access, Directive } from '@solid-primitives/utils'
import { mat2d } from 'gl-matrix'

export const useLayoutObserver = createSingletonRoot(() => {
  const layoutObserver = new LayoutObserver()

  const size = createElementSize(document.documentElement)

  createEffect(
    on(
      () => size.width && size.height,
      () => {
        layoutObserver.measureAll()
      },
    ),
  )

  onCleanup(() => {
    layoutObserver.disconnectAll()
  })

  return layoutObserver
})

export function makeLayout(layoutObserver: LayoutObserver, element: HTMLElement): Layout {
  const layout = layoutObserver.connect(element)
  onCleanup(() => {
    layout.disconnect()
  })
  return layout
}

export function createLayout(target: HTMLElement): Layout
export function createLayout(
  target: Accessor<HTMLElement | false | undefined | null>,
): Accessor<Layout | undefined>
export function createLayout(
  target: Accessor<HTMLElement | false | undefined | null> | HTMLElement,
): Accessor<Layout | undefined> | Layout {
  const layoutObserver = useLayoutObserver()

  if (typeof target === 'function') {
    return createMemo(() => {
      const element = access(target)
      if (element) {
        return makeLayout(layoutObserver, element)
      }
    })
  } else {
    return makeLayout(layoutObserver, target)
  }
}

export type LayoutDirectiveProps = {
  intrinsicTransform?: mat2d
  onLayoutRect?: (rect: rect.Rect | undefined) => void
  onExtrinsicTransform?: (matrix: mat2d | undefined) => void
}

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      layout: LayoutDirectiveProps
    }
  }
}

export const layout: Directive<LayoutDirectiveProps> = (target, props) => {
  const layoutObserver = useLayoutObserver()

  if (target instanceof HTMLElement) {
    const layout = makeLayout(layoutObserver, target)

    createEffect(() => {
      const { intrinsicTransform, onLayoutRect, onExtrinsicTransform } = props()

      if (intrinsicTransform) {
        layout.setIntrinsicTransform(intrinsicTransform)
      }

      onLayoutRect?.(layout.layoutRect())

      onExtrinsicTransform?.(layout.extrinsicTransform())
    })
  }
}
