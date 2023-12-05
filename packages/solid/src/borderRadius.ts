import { useLayoutModel } from '@chloranthy/layout-model'
import { Directive, MaybeAccessor, access } from '@solid-primitives/utils'
import { createMaybeMemo, maybe } from './utils.js'
import { Mat2d, mat2dCreate, mat2dMultiply } from '@nonphoto/gl-matrix'
import { createEffect } from 'solid-js'

/**
 * @private
 */
export function styleBorderRadius(radius: number, rect?: DOMRect, transform?: Mat2d) {
  if (rect) {
    const x = (radius / (rect.width * (transform?.[0] ?? 1))) * 100
    const y = (radius / (rect.height * (transform?.[3] ?? 1))) * 100
    return `${x}% / ${y}%`
  } else {
    return `${radius}px`
  }
}

export function createSetBorderRadius(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  value: MaybeAccessor<number | undefined>,
) {
  const layout = useLayoutModel()
  const rect = layout.useRect(element)
  const matrix = layout.useMatrix(element)
  const transform = layout.useTransform(element)

  const totalTransform = createMaybeMemo(mat2dMultiply, mat2dCreate(), matrix, transform)

  createEffect(() => {
    const elementValue = access(element)
    if (elementValue) {
      elementValue.style.borderRadius =
        maybe(styleBorderRadius, value, rect, totalTransform) ??
        maybe(styleBorderRadius, value) ??
        ''
    }
  })
}

/**
 * A directive for setting the border radius of an element.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the border radius relative to the element's view matrix, such that the radius always appears the same even if the element has transformations applied.
 * @param target - The target element.
 * @param value - The border radius to set on the element.
 */
export const borderRadius: Directive<number | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    createSetBorderRadius(target, value)
  }
}
