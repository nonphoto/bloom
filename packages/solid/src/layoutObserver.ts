import { createSingletonRoot } from '@solid-primitives/rootless'
import { LayoutObserver } from '@chloranthy/layout-observer'
import { onCleanup } from 'solid-js'

export const useLayoutObserver = createSingletonRoot(() => {
  const layoutObserver = new LayoutObserver()

  onCleanup(() => {
    layoutObserver.dispose()
  })

  return layoutObserver
})
