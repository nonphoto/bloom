import { useLayoutModel } from '@chloranthy/layout-model'
import classes from './MatrixPlayground.module.css'
import { createMemo } from 'solid-js'
import { createSetTransform, createTime } from '@chloranthy/solid'
import { rectCreate, rectMix, rectUntransformMat2d } from '@nonphoto/math'
import {
  Mat2d,
  mat2dCreate,
  mat2dFromRotation,
  mat2dInvert,
  mat2dMultiply,
} from '@nonphoto/gl-matrix'

export default function MatrixPlayground() {
  const sourceInnerElement = (<div class={classes.sourceInner}>A</div>) as HTMLElement
  const targetInnerElement = (<div class={classes.targetInner}>B</div>) as HTMLElement
  const sourceOuterElement = (
    <div class={classes.sourceOuter}>{sourceInnerElement}</div>
  ) as HTMLElement
  const targetOuterElement = (
    <div class={classes.targetOuter}>{targetInnerElement}</div>
  ) as HTMLElement

  const [time] = createTime()
  const t1 = () => Math.sin(time() * 0.001) * 0.5 + 0.5
  const t2 = () => Math.cos(time() * 0.0015) * 0.5 + 0.5

  const layoutModel = useLayoutModel()
  const sourceOuterRect = layoutModel.useRect(sourceOuterElement)
  const sourceInnerRect = layoutModel.useRect(sourceInnerElement)
  const sourceInnerMatrix = layoutModel.useMatrix(sourceInnerElement)
  const targetOuterRect = layoutModel.useRect(targetOuterElement)
  const targetInnerRect = layoutModel.useRect(targetInnerElement)

  const mixedOuterRect = rectCreate()
  const sourceOuterTransform = createMemo<Mat2d>(
    out => {
      const sourceOuterRectValue = sourceOuterRect()
      const targetOuterRectValue = targetOuterRect()
      if (sourceOuterRectValue && targetOuterRectValue) {
        rectMix(mixedOuterRect, sourceOuterRectValue, targetOuterRectValue, t1())
        rectUntransformMat2d(out, sourceOuterRectValue, mixedOuterRect)
      }
      return out
    },
    mat2dCreate(),
    { equals: false },
  )

  const mixedInnerRect = rectCreate()
  const inverseMatrix = mat2dCreate()
  const sourceInnerTransform = createMemo<Mat2d>(
    out => {
      const sourceInnerRectValue = sourceInnerRect()
      const sourceInnerMatrixValue = sourceInnerMatrix()
      const targetInnerRectValue = targetInnerRect()
      if (sourceInnerRectValue && sourceInnerMatrixValue && targetInnerRectValue) {
        rectMix(mixedInnerRect, sourceInnerRectValue, targetInnerRectValue, t1())
        rectUntransformMat2d(out, sourceInnerRectValue, mixedInnerRect)
        mat2dInvert(inverseMatrix, sourceInnerMatrixValue)
        mat2dMultiply(out, inverseMatrix, out)
      }
      return out
    },
    mat2dCreate(),
    { equals: false },
  )

  const targetOuterTransform = createMemo<Mat2d>(
    out => {
      mat2dFromRotation(out, t2())
      return out
    },
    mat2dCreate(),
    { equals: false },
  )

  createSetTransform(sourceInnerElement, sourceInnerTransform)
  createSetTransform(sourceOuterElement, sourceOuterTransform)
  createSetTransform(targetOuterElement, targetOuterTransform)

  return [sourceOuterElement, targetOuterElement]
}
