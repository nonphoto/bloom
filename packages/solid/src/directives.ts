import { Directive } from '@solid-primitives/utils'
import { Quad2d, Rect } from '@chloranthy/core'
import { mat2d } from 'gl-matrix'
import { useLayoutModel } from '@chloranthy/layout-model'
import { createEffect } from 'solid-js'
import { createMaybeMemo, maybe, styleBorderRadius } from './utils'

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

    const totalTransform = createMaybeMemo(mat2d.multiply, mat2d.create(), matrix, transform)

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
export const quad: Directive<Quad2d.Type | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutModel()
    const rect = layout.useRect(target)
    const matrix = layout.useMatrix(target)

    const targetTransform = createMaybeMemo(
      (
        out: mat2d,
        inverseMatrix: mat2d,
        quad: Quad2d.Type,
        matrix: mat2d,
        rect: Rect.Type,
        value: Quad2d.Type,
      ) => {
        Quad2d.fromRect(quad, rect)
        Quad2d.untransformMat2d(out, quad, value)
        mat2d.invert(inverseMatrix, matrix)
        return mat2d.multiply(out, inverseMatrix, out)
      },
      mat2d.create(),
      mat2d.create(),
      Quad2d.create(),
      matrix,
      rect,
      value,
    )

    transform(target, targetTransform)
  }
}
