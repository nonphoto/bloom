import classes from './ScrollingLayout.module.css'
import { transform } from '@chloranthy/solid'
import { Rect } from '@chloranthy/core'
import { createRAF } from '@solid-primitives/raf'
import { mat2d } from 'gl-matrix'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { useLayoutObserver } from '@chloranthy/layout-observer'

transform

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      transform: mat2d | undefined
    }
  }
}

export default function ScrollingLayout() {
  const [parentTransform, setParentTransform] = createSignal<mat2d>(mat2d.create(), {
    equals: false,
  })

  const [innerElement, setInnerElement] = createSignal<HTMLElement>()
  const [fixedElement, setFixedElement] = createSignal<HTMLElement>()

  const [, start] = createRAF(function raf(t) {
    setParentTransform(prev => mat2d.fromRotation(prev, t * 0.001))
  })

  createEffect(() => {
    start()
  })

  const layout = useLayoutObserver()
  const innerRect = layout.useRect(innerElement)
  const innerMatrix = layout.useMatrix(innerElement)
  const shadowRect = layout.useRect(fixedElement)

  const shadowTransform = createMemo<mat2d>(
    prev => {
      const innerRectValue = innerRect()
      const innerMatrixValue = innerMatrix()
      const shadowRectValue = shadowRect()
      if (innerRectValue && innerMatrixValue && shadowRectValue) {
        Rect.divide(prev, innerRectValue, shadowRectValue)
        mat2d.multiply(prev, prev, innerMatrixValue)
      }
      return prev
    },
    mat2d.create(),
    { equals: false },
  )

  return (
    <>
      <div
        id="test"
        class={`${classes.container} ${classes.outer}`}
        use:transform={parentTransform()}
      >
        <div class={classes.container}>
          <div class={classes.sticky}></div>
          <div class={classes.absolute} ref={setInnerElement}></div>
        </div>
      </div>
      <div class={classes.shadow} ref={setFixedElement} use:transform={shadowTransform()} />
    </>
  )
}
