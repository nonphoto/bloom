import { mat2d, vec2 } from 'gl-matrix'
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
} from './utils'
import { SingletonMap } from './singletonMap'
import { Batcher } from './batcher'
import { ReactiveMap } from '@solid-primitives/map'
import { MaybeAccessor } from '@solid-primitives/utils'
import { createMutationObserver } from '@solid-primitives/mutation-observer'
import { createResizeObserver } from '@solid-primitives/resize-observer'
import { createSingletonRoot } from '@solid-primitives/rootless'

export * from './computedStyle'

type RectRoot = {
  rect: Accessor<DOMRect | undefined>
  invalidate(): void
}

type ScrollRoot = {
  scrollTranslation: Accessor<vec2>
  invalidate(): void
}

type ParentRoot = {
  parent: Accessor<HTMLElement | null>
  invalidate(): void
}

type MatrixRoot = {
  matrix: Accessor<mat2d | undefined>
  intermediateMatrix: Accessor<mat2d | undefined>
  rectPosition: Accessor<vec2 | undefined>
}

type LayoutModelReturn = {
  setTransform(element: HTMLElement, transform: mat2d | undefined): void
  useRect(element: MaybeAccessor<HTMLElement | null | undefined>): Accessor<DOMRect | undefined>
  useMatrix(element: MaybeAccessor<HTMLElement | null | undefined>): Accessor<mat2d | undefined>
  useTransform(element: MaybeAccessor<HTMLElement | null | undefined>): Accessor<mat2d | undefined>
  invalidateRect(element: HTMLElement): void
  invalidateScroll(element: HTMLElement): void
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
  invalidateRect() {},
  invalidateScroll() {},
  invalidateParent() {},
}

const identity = mat2d.identity(mat2d.create())

export function createLayoutModel(root: HTMLElement): LayoutModelReturn {
  const transformMap = new ReactiveMap<HTMLElement, mat2d>()

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
      layoutBatcher.enqueue(() => {
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
    const [scrollTranslation, setScrollTranslation] = createSignal(vec2.create(), { equals: false })
    const [willScroll, setWillScroll] = createSignal(false)

    const onScroll = () => {
      setScrollTranslation(prev => vec2.set(prev, -element.scrollLeft, -element.scrollTop))
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

    const rectPosition = createMemo<vec2 | undefined>(
      prev => {
        const rectValue = rectRoot.rect()
        if (rectValue) {
          return center(prev ?? vec2.create(), rectValue)
        }
      },
      undefined,
      { equals: false },
    )

    const layoutDelta = createMemo<vec2 | undefined>(
      prev => {
        const parentRectPositionValue = parentMatrixRoot()?.rectPosition()
        const rectPositionValue = rectPosition()
        return rectPositionValue
          ? parentRectPositionValue
            ? vec2.sub(prev ?? vec2.create(), rectPositionValue, parentRectPositionValue)
            : isDocumentElement(element)
            ? rectPositionValue
            : undefined
          : undefined
      },
      undefined,
      { equals: false },
    )

    const layoutMatrix = createMemo<mat2d | undefined>(
      prev => {
        const parentIntermediateMatrixValue = parentMatrixRoot()?.intermediateMatrix()
        const layoutDeltaValue = layoutDelta()
        const next = prev ?? mat2d.create()
        if (layoutDeltaValue) {
          if (isDocumentElement(element)) {
            mat2d.fromTranslation(next, layoutDeltaValue)
          } else if (parentIntermediateMatrixValue) {
            mat2d.translate(next, parentIntermediateMatrixValue, layoutDeltaValue)
          } else {
            return undefined
          }
          return next
        }
      },
      undefined,
      { equals: false },
    )

    const intermediateMatrix = createMemo<mat2d | undefined>(
      prev => {
        const layoutMatrixValue = layoutMatrix()
        if (layoutMatrixValue) {
          const next = prev ?? mat2d.create()
          mat2d.copy(next, layoutMatrixValue)
          const transform = transformMap.get(element)
          if (transform) {
            mat2d.multiply(next, next, transform)
          }
          return mat2d.translate(next, next, scrollRoot.scrollTranslation())
        }
      },
      undefined,
      { equals: false },
    )

    const matrix = createMemo<mat2d | undefined>(
      prev => {
        const rectPositionValue = rectPosition()
        const layoutMatrixValue = layoutMatrix()
        const next = prev ?? mat2d.create()
        if (rectPositionValue && layoutMatrixValue) {
          mat2dFromNegativeTranslation(next, rectPositionValue)
          return mat2d.multiply(next, next, layoutMatrixValue)
        }
      },
      undefined,
      { equals: false },
    )

    return { rectPosition, intermediateMatrix, matrix }
  })

  function setTransform(element: HTMLElement, transform: mat2d | undefined) {
    if (transform) {
      element.style.transform = styleTransform(transform)
      return transformMap.set(element, mat2d.clone(transform))
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
    invalidateRect(element: HTMLElement) {
      rectRoots.get(element)?.invalidate()
    },
    invalidateScroll(element: HTMLElement) {
      scrollRoots.get(element)?.invalidate()
    },
    invalidateParent(element: HTMLElement) {
      parentRoots.get(element)?.invalidate()
    },
  }
}

export const useLayoutModel = createSingletonRoot<LayoutModelReturn>(() => {
  return (
    withDocument(document => {
      return createLayoutModel(document.documentElement)
    }) ?? layoutModelStub
  )
})

export class LayoutModel {
  #observer: LayoutModelReturn
  #dispose: () => void

  constructor(root: HTMLElement) {
    const { observer, dispose } = createRoot(dispose => {
      const observer = createLayoutModel(root)
      return { observer, dispose }
    })

    this.#observer = observer
    this.#dispose = dispose
  }

  dispose(): void {
    this.#dispose()
  }

  setTransform(element: HTMLElement, transform: mat2d): void {
    this.#observer.setTransform(element, transform)
  }

  useRect(element: HTMLElement, callback: (rect: DOMRect | undefined) => void): () => void {
    return createDisposableEffect(() => this.#observer.useRect(element), callback)
  }

  useMatrix(element: HTMLElement, callback: (rect: mat2d | undefined) => void): () => void {
    return createDisposableEffect(() => this.#observer.useMatrix(element), callback)
  }

  invalidateRect(element: HTMLElement) {
    this.#observer.invalidateRect(element)
  }

  invalidateScroll(element: HTMLElement) {
    this.#observer.invalidateScroll(element)
  }

  invalidateParent(element: HTMLElement) {
    this.#observer.invalidateParent(element)
  }
}
