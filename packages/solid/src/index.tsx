import { LayoutObserver } from '@chloranthy/layout-observer'
import { Accessor, batch, createEffect, createSignal, onCleanup } from 'solid-js'
import { createSingletonRoot } from '@solid-primitives/rootless'
import { Directive } from '@solid-primitives/utils'
import { mat2d } from 'gl-matrix'
import { createMaybeMemo, maybe } from './utils'
import { Quad } from '@chloranthy/animation'
import { createRAF } from '@solid-primitives/raf'

export { createComputedStyle } from '@chloranthy/layout-observer'
export * from './utils'

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      quad: Quad | undefined
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

export const quad: Directive<Quad | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutObserver()
    const rect = layout.useRect(target)
    const matrix = layout.useMatrix(target)

    const quad = createMaybeMemo(Quad.fromDOMRect, Quad.create(), rect)

    const inverseMatrix = createMaybeMemo(mat2d.invert, mat2d.create(), matrix)

    const deltaMatrix = createMaybeMemo(Quad.divide, mat2d.create(), value, quad)

    const targetTransform = createMaybeMemo(
      mat2d.multiply,
      mat2d.create(),
      inverseMatrix,
      deltaMatrix,
    )

    transform(target, targetTransform)
  }
}

export function createTime(): [Accessor<number>, Accessor<number>] {
  const [time, setTime] = createSignal(0, { equals: false })
  const [deltaTime, setDeltaTime] = createSignal(0, { equals: false })
  let prevTime = 0

  const [, start] = createRAF(time => {
    batch(() => {
      setTime(time)
      setDeltaTime(time - prevTime)
      prevTime = time
    })
  })

  createEffect(() => {
    start()
  })

  return [time, deltaTime]
}

export function createTimeCallback(
  fn: (time: number, deltaTime: number, stop: VoidFunction) => void,
) {
  let time = 0
  let deltaTime = 0

  const [, start, stop] = createRAF(nextTime => {
    deltaTime = nextTime - time
    time = nextTime
    fn(time, deltaTime, stop)
  })

  createEffect(() => {
    start()
  })
}
