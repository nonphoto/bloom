import classes from './ScrollingLayout.module.css'
import { setTransform } from '@chloranthy/solid'
import { rectUntransformMat2d } from '@chloranthy/core'
import { createRAF } from '@solid-primitives/raf'
import { Mat2d, mat2dMultiply, mat2dCreate, mat2dFromRotation } from '@chloranthy/gl-matrix'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { useLayoutModel } from '@chloranthy/layout-model'

setTransform

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      setTransform: Mat2d | undefined
    }
  }
}

export default function ScrollingLayout() {
  const [parentTransform, setParentTransform] = createSignal<Mat2d>(mat2dCreate(), {
    equals: false,
  })

  const [innerElement, setInnerElement] = createSignal<HTMLElement>()
  const [fixedElement, setFixedElement] = createSignal<HTMLElement>()

  const [, start] = createRAF(function raf(t) {
    setParentTransform(prev => mat2dFromRotation(prev, t * 0.001))
  })

  createEffect(() => {
    start()
  })

  const layout = useLayoutModel()
  const innerRect = layout.useRect(innerElement)
  const innerMatrix = layout.useMatrix(innerElement)
  const shadowRect = layout.useRect(fixedElement)

  const shadowTransform = createMemo<Mat2d>(
    prev => {
      const innerRectValue = innerRect()
      const innerMatrixValue = innerMatrix()
      const shadowRectValue = shadowRect()
      if (innerRectValue && innerMatrixValue && shadowRectValue) {
        rectUntransformMat2d(prev, innerRectValue, shadowRectValue)
        mat2dMultiply(prev, prev, innerMatrixValue)
      }
      return prev
    },
    mat2dCreate(),
    { equals: false },
  )

  return (
    <>
      <div
        id="test"
        class={`${classes.container} ${classes.outer}`}
        use:setTransform={parentTransform()}
      >
        <div class={classes.container}>
          <div class={classes.sticky}></div>
          <div class={classes.absolute} ref={setInnerElement}></div>
        </div>
      </div>
      <div class={classes.shadow} ref={setFixedElement} use:setTransform={shadowTransform()} />
    </>
  )
}
