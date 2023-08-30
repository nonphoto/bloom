import { Directive } from '@solid-primitives/utils'
import { Mat2d } from '@chloranthy/gl-matrix'
import { Rect, Quad2d } from '@chloranthy/core'
import { useLayoutModel } from '@chloranthy/layout-model'
import { createSetQuad, createSetRect, createSetTransform } from './layoutModel.js'
import { createSetBorderRadius } from './style.js'

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
