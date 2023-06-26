import { Directive } from '@solid-primitives/utils'
import { Mat2d, Quad2d, Rect } from '@chloranthy/animation'
import { mat2d } from 'gl-matrix'
import { useLayoutObserver } from '@chloranthy/layout-observer'
import { createEffect } from 'solid-js'
import { createMaybeMemo, maybe, styleBorderRadius } from './utils'

export const transform: Directive<Mat2d.Type | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutObserver()

    createEffect(() => {
      layout.setTransform(target, value())
    })
  }
}

export const borderRadius: Directive<number | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutObserver()
    const rect = layout.useRect(target)
    const matrix = layout.useMatrix(target)
    const transform = layout.useTransform(target)

    const totalTransform = createMaybeMemo(mat2d.multiply, mat2d.create(), matrix, transform)

    createEffect(() => {
      target.style.borderRadius = maybe(styleBorderRadius, value, rect, totalTransform) ?? ''
    })
  }
}

export const quad: Directive<Quad2d.Type | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutObserver()
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
