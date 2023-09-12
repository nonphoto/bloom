import { useLayoutModel } from '@chloranthy/layout-model'
import { type MaybeAccessor, access } from '@solid-primitives/utils'
import { createEffect } from 'solid-js'
import { Mat2d, mat2dCreate, mat2dInvert, mat2dMultiply } from '@chloranthy/gl-matrix'
import { createMaybeMemo } from './utils.js'
import {
  Quad2d,
  Rect,
  quad2dCreate,
  quad2dFromRect,
  quad2dUntransformMat2d,
  rectUntransformMat2d,
} from '@chloranthy/core'

export function createSetTransform(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  value: MaybeAccessor<Mat2d | undefined>,
): void {
  const layout = useLayoutModel()

  createEffect(() => {
    const elementValue = access(element)
    if (elementValue) {
      layout.setTransform(elementValue, access(value))
    }
  })
}

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
