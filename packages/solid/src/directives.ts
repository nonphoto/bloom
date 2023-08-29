import { Directive } from '@solid-primitives/utils'
import {
  Quad2d,
  create as quad2dCreate,
  fromRect as quad2dFromRect,
  untransformMat2d as quad2dUntransformMat2d,
} from '@chloranthy/core/quad2d'
import { Rect } from '@chloranthy/core/rect'
import type { mat2d } from 'gl-matrix'
import {
  multiply as mat2dMultiply,
  create as mat2dCreate,
  invert as mat2dInvert,
} from 'gl-matrix/esm/mat2d.js'
import { useLayoutModel } from '@chloranthy/layout-model'
import { createEffect } from 'solid-js'
import { createMaybeMemo, maybe, styleBorderRadius } from './utils.js'

/**
 * A directive for setting the transformation matrix of an element.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the transform.
 * @param target - The target element.
 * @param value - The transform to set on the element.
 */
export const transform: Directive<mat2d | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutModel()

    createEffect(() => {
      layout.setTransform(target, value())
    })
  }
}

/**
 * A directive for setting the border radius of an element.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the border radius relative to the element's view matrix, such that the radius always appears the same even if the element has transformations applied.
 * @param target - The target element.
 * @param value - The border radius to set on the element.
 */
export const borderRadius: Directive<number | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutModel()
    const rect = layout.useRect(target)
    const matrix = layout.useMatrix(target)
    const transform = layout.useTransform(target)

    const totalTransform = createMaybeMemo(mat2dMultiply, mat2dCreate(), matrix, transform)

    createEffect(() => {
      target.style.borderRadius = maybe(styleBorderRadius, value, rect, totalTransform) ?? ''
    })
  }
}

/**
 * A directive for setting the quad of an element. Setting the quad will update the element's transform such that it visual matches the placement of the quad on screen.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the element's transform.
 * @param target - The target element.
 * @param value - The quad to set on the element's transform to.
 */
export const quad: Directive<Quad2d | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutModel()
    const rect = layout.useRect(target)
    const matrix = layout.useMatrix(target)

    const targetTransform = createMaybeMemo(
      (
        out: mat2d,
        inverseMatrix: mat2d,
        quad: Quad2d,
        matrix: mat2d,
        rect: Rect,
        value: Quad2d,
      ) => {
        quad2dFromRect(quad, rect)
        quad2dUntransformMat2d(out, quad, value)
        mat2dInvert(inverseMatrix, matrix)
        return mat2dMultiply(out, inverseMatrix, out)
      },
      mat2dCreate(),
      mat2dCreate(),
      quad2dCreate(),
      matrix,
      rect,
      value,
    )

    transform(target, targetTransform)
  }
}
