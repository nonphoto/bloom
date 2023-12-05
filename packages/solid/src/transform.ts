import { Mat2d } from '@nonphoto/gl-matrix'
import { useLayoutModel } from '@chloranthy/layout-model'
import { Directive, MaybeAccessor, access } from '@solid-primitives/utils'
import { createComputed } from 'solid-js'

export function createSetTransform(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  value: MaybeAccessor<Mat2d | undefined>,
): void {
  const layout = useLayoutModel()

  createComputed(() => {
    const elementValue = access(element)
    if (elementValue) {
      createComputed(() => {
        layout.setTransform(elementValue, access(value))
      })
    }
  })
}

/**
 * A directive for setting the transformation matrix of an element.
 * @remarks Uses the common layout model from {@link useLayoutModel} to set the transform.
 * @param target - The target element.
 * @param value - The transform to set on the element.
 */
export const setTransform: Directive<Mat2d | undefined> = (target, value) => {
  if (target instanceof HTMLElement) {
    createSetTransform(target, value)
  }
}
