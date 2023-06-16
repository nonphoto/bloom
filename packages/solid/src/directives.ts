import { Directive } from '@solid-primitives/utils'
import { Mat2d } from '@chloranthy/animation'
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

    const totalTransform = createMaybeMemo(mat2d.multiply, Mat2d.create(), matrix, transform)

    createEffect(() => {
      target.style.borderRadius = maybe(styleBorderRadius, value, rect, totalTransform) ?? ''
    })
  }
}

// q = r * m * t
// t = q / (r * m)

export const quad: Directive<Mat2d.Type | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutObserver()
    const rect = layout.useRect(target)
    const matrix = layout.useMatrix(target)

    const quad = createMaybeMemo(Mat2d.fromRect, Mat2d.create(), rect)

    const targetTransform = createMaybeMemo(
      (out, quad, matrix, value) => {
        mat2d.multiply(out, quad, matrix)
        mat2d.invert(out, out)
        mat2d.multiply(out, out, value)
        return out
      },
      mat2d.create(),
      quad,
      matrix,
      value,
    )

    transform(target, targetTransform)
  }
}
