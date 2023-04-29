import { debugComputation } from '@solid-devtools/logger'
import classes from './ScrollingLayout.module.css'
import { LayoutObserver, rect } from '@chloranthy/core'
import { createRAF } from '@solid-primitives/raf'
import { mat2d } from 'gl-matrix'
import { createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js'

export default function ScrollingLayout() {
  const layoutObserver = new LayoutObserver()

  onCleanup(() => {
    layoutObserver.disconnectAll()
  })

  const [element, setElement] = createSignal<HTMLElement>()
  const [parentElement, setParentElement] = createSignal<HTMLElement>()
  const [matrixElement, setMatrixElement] = createSignal<HTMLElement>()

  createEffect(() => {
    const accessedElement = element()
    const accessedMatrixElement = matrixElement()
    if (accessedElement && accessedMatrixElement) {
      const [{ extrinsicTransform, layoutRect }, { disconnect }] =
        layoutObserver.connect(accessedElement)

      const [
        { layoutRect: matrixLayoutRect },
        { setIntrinsicTransform, disconnect: disconnectMatrix },
      ] = layoutObserver.connect(accessedMatrixElement)

      const transform = createMemo<mat2d>(
        prev => {
          if (layoutRect() && matrixLayoutRect() && extrinsicTransform()) {
            rect.divide(prev, layoutRect()!, matrixLayoutRect()!)
            mat2d.multiply(prev, prev, extrinsicTransform()!)
          }
          return prev
        },
        mat2d.create(),
        { equals: false },
      )

      createEffect(() => {
        setIntrinsicTransform(transform())
      })

      onCleanup(() => {
        disconnect()
        disconnectMatrix()
      })
    }
  })

  createEffect(() => {
    const accessedElement = parentElement()
    if (accessedElement) {
      const [, { disconnect, setIntrinsicTransform }] = layoutObserver.connect(accessedElement)

      const [, start] = createRAF(function raf(t) {
        setIntrinsicTransform(prev => mat2d.fromRotation(prev, t * 0.0001))
      })

      createEffect(() => {
        start()
      })

      onCleanup(() => {
        disconnect()
      })
    }
  })

  onMount(() => {
    layoutObserver.measureAll()
  })

  return (
    <>
      <div class={`${classes.container} ${classes.outer}`} ref={setParentElement}>
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
