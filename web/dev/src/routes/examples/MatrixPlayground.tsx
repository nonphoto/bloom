import { useLayoutObserver } from '@chloranthy/layout-observer'
import classes from './MatrixPlayground.module.css'
import { createEffect } from 'solid-js'
import { maybe } from '@chloranthy/solid'
import { mat2d } from 'gl-matrix'
import { Quad2d } from '@chloranthy/core'

export default function MatrixPlayground() {
  const sourceElement = (<div class={classes.source} />) as HTMLElement
  const targetElement = (<div class={classes.target} />) as HTMLElement

  const layoutObserver = useLayoutObserver()
  const sourceRect = layoutObserver.useRect(sourceElement)
  const targetRect = layoutObserver.useRect(targetElement)

  createEffect(() => {
    maybe(
      (sourceRect, targetRect) => {
        const sourceQuad = Quad2d.fromRect(new Quad2d.Instance(), sourceRect)
        const targetQuad = Quad2d.fromRect(new Quad2d.Instance(), targetRect)
        const transformationMatrix = Quad2d.untransformMat2d(mat2d.create(), sourceQuad, targetQuad)
        const transformedSourceQuad = Quad2d.transformMat2d(
          new Quad2d.Instance(),
          sourceQuad,
          transformationMatrix,
        )
        console.log(Quad2d.equals(transformedSourceQuad, targetQuad))
        layoutObserver.setTransform(sourceElement, transformationMatrix)
      },
      sourceRect,
      targetRect,
    )
  })

  return [sourceElement, targetElement]
}
