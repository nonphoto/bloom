import classes from './ScrollingLayout.module.css'
import { rect } from '@chloranthy/core'
import { layout, createLayout } from '@chloranthy/solid'
import { createRAF } from '@solid-primitives/raf'
import { mat2d } from 'gl-matrix'
import { createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js'

layout

export default function ScrollingLayout() {
  const [parentTransform, setParentTransform] = createSignal<mat2d>(mat2d.create(), {
    equals: false,
  })
  const [element, setElement] = createSignal<HTMLElement>()
  const [matrixElement, setMatrixElement] = createSignal<HTMLElement>()

  const [, start] = createRAF(function raf(t) {
    setParentTransform(prev => mat2d.fromRotation(prev, t * 0.0001))
  })

  createEffect(() => {
    start()
  })

  const layout = createLayout(element)

  const matrixLayout = createLayout(matrixElement)

  const transform = createMemo<mat2d>(
    prev => {
      if (layout() && matrixLayout()) {
        rect.divide(prev, layout()!.layoutRect(), matrixLayout()!.layoutRect())
        mat2d.multiply(prev, prev, layout()!.extrinsicTransform())
      }
      return prev
    },
    mat2d.create(),
    { equals: false },
  )

  createEffect(() => {
    matrixLayout()?.setIntrinsicTransform(transform())
  })

  return (
    <>
      <div
        class={`${classes.container} ${classes.outer}`}
        use:layout={{ intrinsicTransform: parentTransform }}
      >
        <div class={classes.container}>
          <div class={classes.sticky}></div>
          <div class={classes.fixed}></div>
          <div class={classes.absolute} ref={setElement}></div>
        </div>
      </div>
      <div class={classes.matrix} ref={setMatrixElement} />
    </>
  )
}
