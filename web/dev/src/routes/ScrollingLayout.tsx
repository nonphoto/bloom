import classes from './ScrollingLayout.module.css'
import { transform, useLayoutObserver } from '@chloranthy/solid'
import { createRAF } from '@solid-primitives/raf'
import { mat2d } from 'gl-matrix'
import { createEffect, createMemo, createSignal } from 'solid-js'

transform

function divide(out: mat2d, a: DOMRect, b: DOMRect) {
  out[0] = a.width / b.width
  out[1] = 0
  out[2] = 0
  out[3] = a.height / b.height
  out[4] = a.x + a.width / 2 - (b.x + b.width / 2)
  out[5] = a.y + a.height / 2 - (b.y + b.height / 2)
  return out
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
  const fixedRect = layout.useRect(fixedElement)

  const fixedTransform = createMemo<mat2d>(
    prev => {
      const innerRectValue = innerRect()
      const innerMatrixValue = innerMatrix()
      const fixedRectValue = fixedRect()
      if (innerRectValue && innerMatrixValue && fixedRectValue) {
        divide(prev, innerRectValue, fixedRectValue)
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
      <div class={classes.matrix} ref={setFixedElement} use:transform={fixedTransform()} />
    </>
  )
}
