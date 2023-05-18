import { mat2d, vec2 } from 'gl-matrix'
import { Accessor, createMemo, createSignal, onCleanup } from 'solid-js'
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
    for (const callback of this.#callbacks) {
      callback.call(undefined)
    }
    this.#callbacks = []
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

  use(key: T) {
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

type MatrixComponents = {
  matrix: Accessor<mat2d | undefined>
  intermediateMatrix: Accessor<mat2d | undefined>
  layoutPosition: Accessor<vec2 | undefined>
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
        if (this.#transforms.has(element)) {
          element.style.transform = styleTransform(identity)
        }
      })
    },
    onPostRun: () => {
      walkChildren(document.documentElement, element => {
        const transform = this.#transforms.get(element)
        if (transform) {
          element.style.transform = styleTransform(transform)
        }
      })
    },
  })

  #simpleBatcher = new Batcher()

  #rects = new SingletonMap<HTMLElement, Accessor<DOMRect | undefined>>(element => {
    const [rect, setRect] = createSignal<DOMRect>()

    const measure = () => {
      this.#layoutBatcher.enqueue(() => {
        setRect(element.getBoundingClientRect())
      })
    }

    this.#resizeListeners.add(element, measure)
    this.#resizeObserver.observe(element)

    onCleanup(() => {
      this.#resizeListeners.remove(element, measure)
      this.#resizeObserver.unobserve(element)
    })

    measure()

    return rect
  })

  #matrices = new SingletonMap<HTMLElement, MatrixComponents>(element => {
    const [scrollTranslation, setScrollTranslation] = createSignal(
      vec2.fromValues(-element.scrollLeft, -element.scrollTop),
      { equals: false },
    )

    if (willScroll(element)) {
      function onScroll() {
        setScrollTranslation(prev => vec2.set(prev, -element.scrollLeft, -element.scrollTop))
      }

      const scrollEmitter = getScrollEmitter(element)
      scrollEmitter.addEventListener('scroll', onScroll, { passive: true })
      onCleanup(() => {
        scrollEmitter.removeEventListener('scroll', onScroll)
      })
    }

    const [parent, setParent] = createSignal<HTMLElement | null>(null)

    const findParent = () => {
      this.#simpleBatcher.enqueue(() => {
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
      })
    }

    this.#mutationListeners.add(element, findParent)

    onCleanup(() => {
      this.#mutationListeners.remove(element, findParent)
    })

    const memo = createMemo(() => {
      const parentValue = parent()

      if (parentValue) {
        const parentMatrix = this.#matrices.use(parentValue)

        const rect = this.#rects.use(element)

        const layoutPosition = createMemo<vec2 | undefined>(
          prev => {
            const rectValue = rect()
            if (rectValue) {
              return center(prev ?? vec2.create(), rectValue)
            }
          },
          undefined,
          { equals: false },
        )

        const layoutDelta = createMemo<vec2 | undefined>(
          prev => {
            const layoutPositionValue = layoutPosition()
            const parentLayoutPositionValue = parentMatrix.layoutPosition()
            if (layoutPositionValue && parentLayoutPositionValue) {
              return vec2.sub(prev ?? vec2.create(), layoutPositionValue, parentLayoutPositionValue)
            }
          },
          undefined,
          { equals: false },
        )

        const intermediateMatrix = createMemo<mat2d | undefined>(
          prev => {
            const layoutDeltaValue = layoutDelta()
            const parentIntermediateMatrixValue = parentMatrix.intermediateMatrix()

            if (layoutDeltaValue && parentIntermediateMatrixValue) {
              const next = prev ?? mat2d.create()
              mat2d.translate(next, parentIntermediateMatrixValue, layoutDeltaValue)
              const transform = this.#transforms.get(element)
              if (transform) {
                mat2d.multiply(next, next, transform)
              }
              return mat2d.translate(next, next, scrollTranslation())
            }
          },
          undefined,
          { equals: false },
        )

        const matrix = createMemo<mat2d | undefined>(
          prev => {
            const layoutPositionValue = layoutPosition()
            const intermediateMatrixValue = intermediateMatrix()
            if (layoutPositionValue && intermediateMatrixValue) {
              const next = prev ?? mat2d.create()
              mat2dFromNegativeTranslation(next, layoutPositionValue)
              return mat2d.multiply(next, next, intermediateMatrixValue)
            }
          },
          undefined,
          { equals: false },
        )

        return { matrix, intermediateMatrix, layoutPosition }
      }
    })

    return {
      matrix: () => memo()?.matrix(),
      intermediateMatrix: () => memo()?.intermediateMatrix(),
      layoutPosition: () => memo()?.layoutPosition(),
    }
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
      this.#transforms.set(element, transform)
    } else {
      this.#transforms.delete(element)
    }
  }

  useRect(element: HTMLElement): Accessor<DOMRect | undefined> {
    return this.#rects.use(element)
  }

  useMatrix(element: HTMLElement): Accessor<mat2d | undefined> {
    return this.#matrices.use(element).matrix
  }
}
