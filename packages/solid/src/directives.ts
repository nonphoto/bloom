import { Directive } from '@solid-primitives/utils'
import { Mat2d, Quad2d } from '@chloranthy/animation'
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
      (out, quad, matrix, rect, value) => {
        Quad2d.fromRect(quad, rect)
        Quad2d.transformMat2d(quad, quad, matrix)
        Quad2d.untransformMat2d(out, quad, value)
        return out
      },
      mat2d.create(),
      Quad2d.create(),
      matrix,
      rect,
      value,
    )

    transform(target, targetTransform)
  }
}
