import { mat2d, vec2 } from 'gl-matrix'
import {
  Accessor,
  batch,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from 'solid-js'
import { ReactiveWeakMap } from '@solid-primitives/map'
import {
  center,
  getNearestScrollingAncestor,
  getOffsetParent,
  getScrollEmitter,
  mat2dFromNegativeTranslation,
  styleTransform,
  walkChildren,
  willScroll,
} from './utils'
import { createSingletonRoot } from '@solid-primitives/rootless'
import { MaybeAccessor, access } from '@solid-primitives/utils'

const identity = mat2d.identity(mat2d.create())

class Listeners<T extends object, U> {
  #map = new WeakMap<T, Set<(value: U) => void>>()

  add(key: T, listener: (value: U) => void) {
    const listeners = this.#map.get(key)
    if (listeners) {
      listeners.add(listener)
    } else {
      this.#map.set(key, new Set([listener]))
    }
  }

  remove(key: T, listener: (value: U) => void) {
    const listeners = this.#map.get(key)
    if (listeners) {
      if (listeners.size <= 1) {
        this.#map.delete(key)
      } else {
        listeners.delete(listener)
      }
    }
  }

  has(key: T) {
    const listeners = this.#map.get(key)
    return listeners && listeners.size > 0
  }

  notify(key: T, value: U) {
    for (const listener of this.#map.get(key) ?? []) {
      listener.call(undefined, value)
    }
  }
}

class Batcher {
  #callbacks: Array<() => void> = []
  #onPreRun?: () => void
  #onPostRun?: () => void

  constructor(options?: { onPreRun?: () => void; onPostRun?: () => void }) {
    this.#onPreRun = options?.onPreRun
    this.#onPostRun = options?.onPostRun
  }

  #run() {
    this.#onPreRun?.()
    batch(() => {
      while (this.#callbacks.length > 0) {
        const callback = this.#callbacks.shift()
        if (callback) {
          callback.call(undefined)
        }
      }
    })
    this.#onPostRun?.()
  }

  enqueue(callback: () => void) {
    if (this.#callbacks.length === 0) {
      queueMicrotask(() => this.#run())
    }

    this.#callbacks.push(callback)
  }
}

class SingletonMap<T extends object, U> {
  #map = new Map<T, () => U>()
  #factory: (key: T) => U

  constructor(factory: (key: T) => U) {
    this.#factory = factory
  }

  get(key: T): U | undefined {
    return this.#map.get(key)?.()
  }

  use(key: T): U {
    const value = this.#map.get(key)
    if (value) {
      return value()
    } else {
      const use = createSingletonRoot(() => {
        onCleanup(() => {
          this.#map.delete(key)
        })
        return this.#factory(key)
      })
      this.#map.set(key, use)
      return use()
    }
  }
}

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

export class LayoutObserver {
  #transforms = new ReactiveWeakMap<HTMLElement, mat2d>()

  #resizeListeners = new Listeners<HTMLElement, void>()
  #resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      if (entry.target instanceof HTMLElement) {
        this.#resizeListeners.notify(entry.target)
      }
    }
  })

  #mutationListeners = new Listeners<HTMLElement, void>()
  #mutationObserver = new MutationObserver(entries => {
    const elements = new Set<HTMLElement>()
    const add = (node: Node) => {
      if (node instanceof HTMLElement) {
        elements.add(node)
      }
    }
    for (const entry of entries) {
      for (const addedNode of entry.addedNodes) {
        add(addedNode)
      }
      for (const removedNode of entry.removedNodes) {
        add(removedNode)
      }
    }
    for (const element of elements) {
      this.#mutationListeners.notify(element)
    }
  })

  #layoutBatcher = new Batcher({
    onPreRun: () => {
      walkChildren(document.documentElement, element => {
        if (untrack(() => this.#transforms.has(element))) {
          element.style.transform = styleTransform(identity)
        }
      })
    },
    onPostRun: () => {
      walkChildren(document.documentElement, element => {
        const transform = untrack(() => this.#transforms.get(element))
        if (transform) {
          element.style.transform = styleTransform(transform)
        }
      })
    },
  })

  #rectRoots = new SingletonMap<HTMLElement, RectRoot>(element => {
    const [rect, setRect] = createSignal<DOMRect | undefined>(undefined, { equals: false })

    const invalidate = () => {
      this.#layoutBatcher.enqueue(() => {
        const rect = element.getBoundingClientRect()
        setRect(rect)
      })
    }

    createEffect(() => {
      this.#resizeListeners.add(element, invalidate)
      this.#resizeObserver.observe(element)

      onCleanup(() => {
        this.#resizeListeners.remove(element, invalidate)
        this.#resizeObserver.unobserve(element)
      })
    })

    return { rect, invalidate }
  })

  #scrollRoots = new SingletonMap<HTMLElement, ScrollRoot>(element => {
    const [scrollTranslation, setScrollTranslation] = createSignal(vec2.create(), { equals: false })

    const onScroll = () => {
      setScrollTranslation(prev => vec2.set(prev, -element.scrollLeft, -element.scrollTop))
    }

    const invalidate = () => {
      if (willScroll(element)) {
        const scrollEmitter = getScrollEmitter(element)
        scrollEmitter.addEventListener('scroll', onScroll, { passive: true })
        onCleanup(() => {
          scrollEmitter.removeEventListener('scroll', onScroll)
        })
      }
    }

    createEffect(() => {
      invalidate()
    })

    return {
      scrollTranslation,
      invalidate,
    }
  })

  #parentRoots = new SingletonMap<HTMLElement, ParentRoot>(element => {
    const [parent, setParent] = createSignal<HTMLElement | null>(null)

    const invalidate = () => {
      const position = getComputedStyle(element).position
      if (element === document.documentElement) {
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

      this.#mutationListeners.add(element, invalidate)

      onCleanup(() => {
        this.#mutationListeners.remove(element, invalidate)
      })
    })

    return { parent, invalidate }
  })

  #matrixRoots = new SingletonMap<HTMLElement, MatrixRoot>(element => {
    const isDocumentElement = element === document.documentElement

    const parentRoot = this.#parentRoots.use(element)
    const rectRoot = this.#rectRoots.use(element)
    const scrollRoot = this.#scrollRoots.use(element)

    const parentMatrixRoot = createMemo(() => {
      const parentValue = parentRoot.parent()
      if (parentValue) {
        return this.#matrixRoots.use(parentValue)
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
            : isDocumentElement
            ? rectPositionValue
            : undefined
          : undefined
      },
      undefined,
      { equals: false },
    )

    const intermediateMatrix = createMemo<mat2d | undefined>(
      prev => {
        const parentIntermediateMatrixValue = parentMatrixRoot()?.intermediateMatrix()
        const layoutDeltaValue = layoutDelta()
        const next = prev ?? mat2d.create()
        const transform = this.#transforms.get(element)

        if (layoutDeltaValue) {
          if (isDocumentElement) {
            mat2d.fromTranslation(next, layoutDeltaValue)
          } else if (parentIntermediateMatrixValue) {
            mat2d.translate(next, parentIntermediateMatrixValue, layoutDeltaValue)
          } else {
            mat2d.identity(next)
          }

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
        const intermediateMatrixValue = intermediateMatrix()
        const next = prev ?? mat2d.create()
        if (rectPositionValue && intermediateMatrixValue) {
          mat2dFromNegativeTranslation(next, rectPositionValue)
          return mat2d.multiply(next, next, intermediateMatrixValue)
        }
      },
      undefined,
      { equals: false },
    )

    return { rectPosition, intermediateMatrix, matrix }
  })

  constructor() {
    this.#mutationObserver.observe(document.documentElement, { childList: true, subtree: true })
  }

  dispose() {
    this.#mutationObserver.disconnect()
    this.#resizeObserver.disconnect()
  }

  setTransform(element: HTMLElement, transform?: mat2d) {
    if (transform) {
      this.#transforms.set(element, mat2d.clone(transform))
      element.style.transform = styleTransform(transform)
    } else {
      this.#transforms.delete(element)
      element.style.transform = ''
    }
  }

  useRect(element: MaybeAccessor<HTMLElement | undefined>): Accessor<DOMRect | undefined> {
    const memo = createMemo(() => {
      const elementValue = access(element)
      if (elementValue) {
        return this.#rectRoots.use(elementValue)
      }
    })
    return () => memo()?.rect()
  }

  useMatrix(element: MaybeAccessor<HTMLElement | undefined>): Accessor<mat2d | undefined> {
    const memo = createMemo(() => {
      const elementValue = access(element)
      if (elementValue) {
        return this.#matrixRoots.use(elementValue)
      }
    })
    return () => memo()?.matrix?.()
  }

  invalidateRect(element: HTMLElement) {
    this.#rectRoots.get(element)?.invalidate()
  }

  invalidateScroll(element: HTMLElement) {
    this.#scrollRoots.get(element)?.invalidate()
  }

  invalidateParent(element: HTMLElement) {
    this.#parentRoots.get(element)?.invalidate()
  }
}
