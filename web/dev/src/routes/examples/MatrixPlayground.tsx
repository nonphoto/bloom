import { useLayoutModel } from '@chloranthy/layout-model'
import classes from './MatrixPlayground.module.css'
import { createEffect } from 'solid-js'
import { maybe } from '@chloranthy/solid'
import { mat2d } from 'gl-matrix'
import {
  quad2dFromRect,
  quad2dCreate,
  quad2dUntransformMat2d,
  quad2dTransformMat2d,
  quad2dEquals,
} from '@chloranthy/core'

export default function MatrixPlayground() {
  const sourceElement = (<div class={classes.source} />) as HTMLElement
  const targetElement = (<div class={classes.target} />) as HTMLElement

  const layoutModel = useLayoutModel()
  const sourceRect = layoutModel.useRect(sourceElement)
  const targetRect = layoutModel.useRect(targetElement)

  createEffect(() => {
    maybe(
      (sourceRect, targetRect) => {
        const sourceQuad = quad2dFromRect(quad2dCreate(), sourceRect)
        const targetQuad = quad2dFromRect(quad2dCreate(), targetRect)
        const transformationMatrix = quad2dUntransformMat2d(mat2d.create(), sourceQuad, targetQuad)
        const transformedSourceQuad = quad2dTransformMat2d(
          quad2dCreate(),
          sourceQuad,
          transformationMatrix,
        )
        layoutModel.setTransform(sourceElement, transformationMatrix)
      },
      sourceRect,
      targetRect,
    )
  })

  return [sourceElement, targetElement]
}
