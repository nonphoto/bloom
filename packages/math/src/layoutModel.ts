import { Mat2d, Vec2, mat2dCopy, mat2dCreate, vec2Create } from '@nonphoto/gl-matrix'
import { Rect } from './rect'
import { rectCreate } from '.'

export type ElementStruct = {
  rect: Rect
  scroll: Vec2
  parent: HTMLElement | null
  transform: Mat2d
  matrix: Mat2d
  intermediateMatrix: Mat2d
}

export type LayoutModel = WeakMap<HTMLElement, ElementStruct>

export function createElementStruct(): ElementStruct {
  return {
    rect: rectCreate(),
    scroll: vec2Create(),
    parent: null,
    transform: mat2dCreate(),
    matrix: mat2dCreate(),
    intermediateMatrix: mat2dCreate(),
  }
}

export function get(model: LayoutModel, element: HTMLElement): ElementStruct {
  if (!model.has(element)) {
    model.set(element, createElementStruct())
  }
  return model.get(element)!
}

export function setTransform(
  model: LayoutModel,
  element: Readonly<HTMLElement>,
  transform: Readonly<Mat2d>,
): LayoutModel {
  const struct = get(model, element)
  struct.transform = mat2dCopy(struct.transform, transform)
  return model
}
