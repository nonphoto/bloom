import {
  Vec2,
  vec2Set,
  vec2Create,
  vec2Sub,
  Mat2d,
  mat2dIdentity,
  mat2dCreate,
  mat2dCopy,
  mat2dClone,
  mat2dTranslate,
  mat2dMultiply,
  mat2dFromTranslation,
} from '@chloranthy/gl-matrix'
import {
  Accessor,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  onCleanup,
  untrack,
} from 'solid-js'
import {
  center,
  getNearestScrollingAncestor,
  getOffsetParent,
  getScrollEmitter,
  mat2dFromNegativeTranslation,
  styleTransform,
  walkChildren,
  willScroll as getWillScroll,
  isDocumentElement,
  mutatedElements,
  maybe,
  createDisposableEffect,
  withDocument,
  walkParents,
} from './utils.js'
import { SingletonMap } from './singletonMap.js'
import { Batcher } from './batcher.js'
import { ReactiveMap } from '@solid-primitives/map'
import { MaybeAccessor } from '@solid-primitives/utils'
import { createMutationObserver } from '@solid-primitives/mutation-observer'
import { createResizeObserver } from '@solid-primitives/resize-observer'
import { createSingletonRoot } from '@solid-primitives/rootless'

type RectRoot = {
  rect: Accessor<DOMRect | undefined>
  invalidate(): Promise<void>
}

type ScrollRoot = {
  scrollTranslation: Accessor<Vec2>
  invalidate(): void
}

type ParentRoot = {
  parent: Accessor<HTMLElement | null>
  invalidate(): void
}

type MatrixRoot = {
  matrix: Accessor<Mat2d | undefined>
  intermediateMatrix: Accessor<Mat2d | undefined>
  rectPosition: Accessor<Vec2 | undefined>
}

export type { Accessor }

/**
 * The return type of {@link createLayoutModel}.
 */
export type LayoutModelReturn = {
  /**
   * Sets the transform property of an element.
   * @param element - The element to set the transform of.
   * @param transform - The transform to set on the element.
   */
  setTransform(element: HTMLElement, transform: Mat2d | undefined): void

  /**
   * Returns an accessor for the layout rect of an element.
   * The layout rect is a document relative DOMRect; it is equivalent to calling `element.getBoundingClientRect()` when the transform properties and scroll positions of all elements in the document are unset. The accessor updates whenever the DOMRect changes.
   * @param element - The element to get the layout rect accessor of.
   * @returns An accessor that returns the layout rect of the element.
   */
  useRect(element: MaybeAccessor<HTMLElement | null | undefined>): Accessor<DOMRect | undefined>

  /**
   * Returns an accessor for the view matrix of the element.
   * The view matrix represents all affine transformations of an element applied to the layout rect of the element, including the scroll translations and transforms of all of its ancestors. The accessor updates whenever the calculated view matrix changes.
   * @remarks Premultiplying the layout rect by the view matrix will result in a quad representing the exact placement of the element on screen.
   * @param element - The element to get the view matrix accessor of.
   * @returns An accessor that returns the view matrix of the element.
   */
  useMatrix(element: MaybeAccessor<HTMLElement | null | undefined>): Accessor<Mat2d | undefined>

  /**
   * Returns an accessor for transformation matrix of an element, as set by `setTransform`.
   * @param element - The element to get the transform property accessor of.
   * @returns An accessor that returns the transformation matrix of the element.
   */
  useTransform(element: MaybeAccessor<HTMLElement | null | undefined>): Accessor<Mat2d | undefined>

  /**
   * Invalidate the measured layout rect of the element, causing the layout model to remeasure it. This can sometimes be necessary if it's position in the layout changed without its width or height changing.
   * @param element - The element to invalidate.
   */
  invalidateRect(element: HTMLElement): Promise<void>

  /**
   * Invalidate the measured overflow property of the element, causing the layout model to rebind scroll event listeners. This can sometimes be necessary if the element's `overflow` style property changed from `auto` or `scroll` to `hidden`, or vice versa.
   * @param element - The element to invalidate.
   */
  invalidateScroll(element: HTMLElement): void

  /**
   * Invalidate the offset parent of the element, causing the layout model to recalculate the parent tree. This can sometimes be necessary if the offset parent of the element changed due to the `position` property of the element or one of its ancestors changing.
   * @param element - The element to invalidate.
   */
  invalidateParent(element: HTMLElement): void
}

const layoutModelStub: LayoutModelReturn = {
  setTransform() {},
  useRect() {
    return () => undefined
  },
  useMatrix() {
    return () => undefined
  },
  useTransform() {
    return () => undefined
  },
  async invalidateRect() {},
  invalidateScroll() {},
  invalidateParent() {},
}

const identity = mat2dIdentity(mat2dCreate())

/**
 * Creates a new layout model from the root element. The layout model will track changes to the layout rects and view matrices of elements in the document.
 * @param root - The root element of the document.
 */
export function createLayoutModel(root: HTMLElement): LayoutModelReturn {
  const transformMap = new ReactiveMap<HTMLElement, Mat2d>()

  createResizeObserver(
    () => Array.from(rectRoots.keys()),
    (_, element) => {
      if (element instanceof HTMLElement) {
        rectRoots.get(element)?.invalidate()
      }
    },
  )

  createMutationObserver(root, { attributes: true, subtree: true }, records => {
    for (const element of mutatedElements(records)) {
      parentRoots.get(element)?.invalidate()
    }
  })

  const layoutBatcher = new Batcher({
    onPreRun: () => {
      walkChildren(root, element => {
        if (untrack(() => transformMap.has(element))) {
          element.style.transform = styleTransform(identity)
        }
      })
    },
    onPostRun: () => {
      walkChildren(root, element => {
        const transform = untrack(() => transformMap.get(element))
        if (transform) {
          element.style.transform = styleTransform(transform)
        }
      })
    },
  })

  const rectRoots = new SingletonMap<HTMLElement, RectRoot>(element => {
    const [rect, setRect] = createSignal<DOMRect | undefined>(undefined, { equals: false })

    const invalidate = () => {
      return layoutBatcher.enqueue(() => {
        const rect = element.getBoundingClientRect()
        walkParents(element, parent => {
          rect.x += parent.scrollLeft
          rect.y += parent.scrollTop
        })
        setRect(rect)
      })
    }

    return { rect, invalidate }
  })

  const scrollRoots = new SingletonMap<HTMLElement, ScrollRoot>(element => {
    const [scrollTranslation, setScrollTranslation] = createSignal(vec2Create(), { equals: false })
    const [willScroll, setWillScroll] = createSignal(false)

    const onScroll = () => {
      setScrollTranslation(prev => vec2Set(prev, -element.scrollLeft, -element.scrollTop))
    }

    const invalidate = () => {
      setWillScroll(getWillScroll(element))
    }

    createEffect(() => {
      if (willScroll()) {
        const scrollEmitter = getScrollEmitter(element)
        scrollEmitter.addEventListener('scroll', onScroll, { passive: true })
        onCleanup(() => {
          scrollEmitter.removeEventListener('scroll', onScroll)
        })
      }
    })

    createEffect(() => {
      invalidate()
    })

    return {
      scrollTranslation,
      invalidate,
    }
  })

  const parentRoots = new SingletonMap<HTMLElement, ParentRoot>(element => {
    const [parent, setParent] = createSignal<HTMLElement | null>(null)

    const invalidate = () => {
      const position = getComputedStyle(element).position
      if (isDocumentElement(element)) {
        setParent(null)
      } else if (position === 'sticky') {
        setParent(getNearestScrollingAncestor(element))
      } else if (position === 'absolute' || position === 'fixed') {
        setParent(getOffsetParent(element))
      } else {
        setParent(element.parentElement)
      }
    }

    createEffect(() => {
      invalidate()
    })

    return { parent, invalidate }
  })

  const matrixRoots = new SingletonMap<HTMLElement, MatrixRoot>(element => {
    const parentRoot = parentRoots.use(element)
    const rectRoot = rectRoots.use(element)
    const scrollRoot = scrollRoots.use(element)

    const parentMatrixRoot = createMemo(() => {
      const parentValue = parentRoot.parent()
      if (parentValue) {
        return matrixRoots.use(parentValue)
      }
    })

    const rectPosition = createMemo<Vec2 | undefined>(
      prev => {
        const rectValue = rectRoot.rect()
        if (rectValue) {
          return center(prev ?? vec2Create(), rectValue)
        }
      },
      undefined,
      { equals: false },
    )

    const layoutDelta = createMemo<Vec2 | undefined>(
      prev => {
        const parentRectPositionValue = parentMatrixRoot()?.rectPosition()
        const rectPositionValue = rectPosition()
        return rectPositionValue
          ? parentRectPositionValue
            ? vec2Sub(prev ?? vec2Create(), rectPositionValue, parentRectPositionValue)
            : isDocumentElement(element)
            ? rectPositionValue
            : undefined
          : undefined
      },
      undefined,
      { equals: false },
    )

    const layoutMatrix = createMemo<Mat2d | undefined>(
      prev => {
        const parentIntermediateMatrixValue = parentMatrixRoot()?.intermediateMatrix()
        const layoutDeltaValue = layoutDelta()
        const next = prev ?? mat2dCreate()
        if (layoutDeltaValue) {
          if (isDocumentElement(element)) {
            mat2dFromTranslation(next, layoutDeltaValue)
          } else if (parentIntermediateMatrixValue) {
            mat2dTranslate(next, parentIntermediateMatrixValue, layoutDeltaValue)
          } else {
            return undefined
          }
          return next
        }
      },
      undefined,
      { equals: false },
    )

    const intermediateMatrix = createMemo<Mat2d | undefined>(
      prev => {
        const layoutMatrixValue = layoutMatrix()
        if (layoutMatrixValue) {
          const next = prev ?? mat2dCreate()
          mat2dCopy(next, layoutMatrixValue)
          const transform = transformMap.get(element)
          if (transform) {
            mat2dMultiply(next, next, transform)
          }
          return mat2dTranslate(next, next, scrollRoot.scrollTranslation())
        }
      },
      undefined,
      { equals: false },
    )

    const matrix = createMemo<Mat2d | undefined>(
      prev => {
        const rectPositionValue = rectPosition()
        const layoutMatrixValue = layoutMatrix()
        const next = prev ?? mat2dCreate()
        if (rectPositionValue && layoutMatrixValue) {
          mat2dFromNegativeTranslation(next, rectPositionValue)
          return mat2dMultiply(next, next, layoutMatrixValue)
        }
      },
      undefined,
      { equals: false },
    )

    return { rectPosition, intermediateMatrix, matrix }
  })

  function setTransform(element: HTMLElement, transform: Mat2d | undefined) {
    if (transform) {
      element.style.transform = styleTransform(transform)
      return transformMap.set(element, mat2dClone(transform))
    } else {
      element.style.transform = ''
      return transformMap.delete(element)
    }
  }

  onCleanup(() => {
    for (const element of untrack(() => transformMap.keys())) {
      setTransform(element, undefined)
    }
  })

  return {
    setTransform,
    useRect(element: MaybeAccessor<HTMLElement | null | undefined>) {
      const memo = createMemo(() => maybe(element => rectRoots.use(element).rect, element))
      return () => memo()?.()
    },
    useMatrix(element: MaybeAccessor<HTMLElement | null | undefined>) {
      const memo = createMemo(() => maybe(element => matrixRoots.use(element).matrix, element))
      return () => memo()?.()
    },
    useTransform(element: MaybeAccessor<HTMLElement | null | undefined>) {
      return () => maybe(element => transformMap.get(element), element)
    },
    async invalidateRect(element: HTMLElement) {
      return rectRoots.get(element)?.invalidate()
    },
    invalidateScroll(element: HTMLElement) {
      scrollRoots.get(element)?.invalidate()
    },
    invalidateParent(element: HTMLElement) {
      parentRoots.get(element)?.invalidate()
    },
  }
}

/**
 * Returns a layout model created from the document element. Subsequent calls will return the same layout model.
 * @returns The layout model.
 */
export const useLayoutModel = createSingletonRoot<LayoutModelReturn>(() => {
  return (
    withDocument(document => {
      return createLayoutModel(document.documentElement)
    }) ?? layoutModelStub
  )
})

/**
 * A layout model that tracks changes to the layout rects and view matrices of elements in the document.
 */
export class LayoutModel {
  #observer: LayoutModelReturn
  #dispose: () => void

  /**
   * Creates a new layout model from the root element.
   * @param root - The root element of the document.
   */
  constructor(root: HTMLElement) {
    const { observer, dispose } = createRoot(dispose => {
      const observer = createLayoutModel(root)
      return { observer, dispose }
    })

    this.#observer = observer
    this.#dispose = dispose
  }

  /**
   * Properly disposes the reactive graph for this layout model.
   */
  dispose(): void {
    this.#dispose()
  }

  /**
   * Sets the transform property of an element.
   * @param element - The element to set the transform of.
   * @param transform - The transform to set on the element.
   */
  setTransform(element: HTMLElement, transform: Mat2d | undefined): void {
    this.#observer.setTransform(element, transform)
  }

  /**
   * @returns A disposing function. Calling the function disposes the reactive graph for the callback.
   */
  useRect(element: HTMLElement, callback: (rect: DOMRect | undefined) => void): () => void {
    return createDisposableEffect(() => this.#observer.useRect(element), callback)
  }

  /**
   * @returns A disposing function. Calling the function disposes the reactive graph for the callback.
   */
  useMatrix(element: HTMLElement, callback: (rect: Mat2d | undefined) => void): () => void {
    return createDisposableEffect(() => this.#observer.useMatrix(element), callback)
  }

  /**
   * Invalidate the measured layout rect of the element, causing the layout model to remeasure it. This can sometimes be necessary if it's position in the layout changed without its width or height changing.
   * @param element - The element to invalidate.
   */
  invalidateRect(element: HTMLElement) {
    this.#observer.invalidateRect(element)
  }

  /**
   * Invalidate the measured overflow property of the element, causing the layout model to rebind scroll event listeners. This can sometimes be necessary if the element's `overflow` style property changed from `auto` or `scroll` to `hidden`, or vice versa.
   * @param element - The element to invalidate.
   */
  invalidateScroll(element: HTMLElement) {
    this.#observer.invalidateScroll(element)
  }

  /**
   * Invalidate the offset parent of the element, causing the layout model to recalculate the parent tree. This can sometimes be necessary if the offset parent of the element changed due to the `position` property of the element or one of its ancestors changing.
   * @param element - The element to invalidate.
   */
  invalidateParent(element: HTMLElement) {
    this.#observer.invalidateParent(element)
  }
}

export { SingletonMap }
