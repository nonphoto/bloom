import { Quad2d, Rect, quad2dCreate, quad2dFromRect, quad2dUntransformMat2d } from '@nonphoto/math'
import { useLayoutModel } from '@chloranthy/layout-model'
import { Directive, MaybeAccessor } from '@solid-primitives/utils'
import { createMaybeMemo } from './utils'
import { Mat2d, mat2dCreate, mat2dInvert, mat2dMultiply } from '@nonphoto/gl-matrix'
import { createSetTransform } from './transform'

export function createSetQuad(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  value: MaybeAccessor<Quad2d | undefined>,
) {
  const layout = useLayoutModel()
  const rect = layout.useRect(element)
  const matrix = layout.useMatrix(element)

  const targetTransform = createMaybeMemo(
    (out: Mat2d, inverseMatrix: Mat2d, quad: Quad2d, matrix: Mat2d, rect: Rect, value: Quad2d) => {
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

  createSetTransform(element, targetTransform)
}

/**
 * A directive for setting the quad of an element. Setting the quad will update the element's transform such that it visually matches the placement of the quad on screen.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the element's transform.
 * @param target - The target element.
 * @param value - The quad to set on the element's transform to.
 */
export const quad: Directive<Quad2d | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    createSetQuad(target, value)
  }
}
