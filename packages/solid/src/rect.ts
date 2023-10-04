import { Rect, rectUntransformMat2d } from '@chloranthy/core'
import { useLayoutModel } from '@chloranthy/layout-model'
import { Directive, MaybeAccessor } from '@solid-primitives/utils'
import { createMaybeMemo } from './utils'
import { Mat2d, mat2dCreate, mat2dInvert, mat2dMultiply } from '@chloranthy/gl-matrix'
import { createSetTransform } from './transform'

export function createSetRect(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  value: MaybeAccessor<Rect | undefined>,
) {
  const layout = useLayoutModel()
  const rect = layout.useRect(element)
  const matrix = layout.useMatrix(element)

  const targetTransform = createMaybeMemo(
    (out: Mat2d, inversetMatrix: Mat2d, matrix: Mat2d, rect: Rect, value: Rect) => {
      rectUntransformMat2d(out, rect, value)
      mat2dInvert(inversetMatrix, matrix)
      return mat2dMultiply(out, inversetMatrix, out)
    },
    mat2dCreate(),
    mat2dCreate(),
    matrix,
    rect,
    value,
  )

  createSetTransform(element, targetTransform)
}

/**
 * A directive for setting the layout rectangle of an element. Setting the rect will update the element's transform such that it visually matches the placement of the rect on screen.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the rect's transform.
 * @param target - The target element.
 * @param value - The rect to set on the element's transform to.
 */
export const rect: Directive<Rect | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    createSetRect(target, value)
  }
}
