import { Directive } from '@solid-primitives/utils'
import { Quad } from '@chloranthy/animation'
import { mat2d } from 'gl-matrix'
import { useLayoutObserver } from '@chloranthy/layout-observer'
import { createEffect } from 'solid-js'
import { createMaybeMemo, maybe, styleBorderRadius } from './utils'

export const transform: Directive<mat2d | undefined> = (target, value) => {
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

export const quad: Directive<Quad | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    const layout = useLayoutObserver()
    const rect = layout.useRect(target)
    const matrix = layout.useMatrix(target)

    const quad = createMaybeMemo(Quad.fromDOMRect, Quad.create(), rect)

    const inverseMatrix = createMaybeMemo(mat2d.invert, mat2d.create(), matrix)

    const deltaMatrix = createMaybeMemo(Quad.divide, mat2d.create(), value, quad)

    const targetTransform = createMaybeMemo(
      mat2d.multiply,
      mat2d.create(),
      inverseMatrix,
      deltaMatrix,
    )

    transform(target, targetTransform)
  }
}
