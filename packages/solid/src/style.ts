import { useLayoutModel } from '@chloranthy/layout-model'
import { MaybeAccessor, access } from '@solid-primitives/utils'
import { createMaybeMemo, maybe, styleBorderRadius } from './utils.js'
import { mat2dCreate, mat2dMultiply } from '@chloranthy/gl-matrix'
import { createEffect } from 'solid-js'

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
