import { mat2d, vec2 } from 'gl-matrix'
import {
  Accessor,
  AccessorArray,
  MemoOptions,
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
      console.log('run')
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
      console.log('prerun')
      walkChildren(document.documentElement, element => {
        if (untrack(() => this.#transforms.has(element))) {
          element.style.transform = styleTransform(identity)
        }
      })
    },
    onPostRun: () => {
      console.log('postrun')
      untrack(() => {
        walkChildren(document.documentElement, element => {
          const transform = untrack(() => this.#transforms.get(element))
          if (transform) {
            element.style.transform = styleTransform(transform)
          }
        })
      })
    },
  })

  #rects = new SingletonMap<HTMLElement, Accessor<DOMRect | undefined>>(element => {
    console.log('rect', element)

    const [rect, setRect] = createSignal<DOMRect>()

    const measure = () => {
      this.#layoutBatcher.enqueue(() => {
        const rect = element.getBoundingClientRect()
        setRect(rect)
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
    console.log('matrix', element)
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

    const findParent = () => {
      const position = getComputedStyle(element).position
      if (element === document.documentElement) {
        return null
      } else if (position === 'sticky') {
        return getNearestScrollingAncestor(element)
      } else if (position === 'absolute' || position === 'fixed') {
        return getOffsetParent(element)
      } else {
        return element.parentElement
      }
    }

    // this.#mutationListeners.add(element, findParent)

    // onCleanup(() => {
    //   this.#mutationListeners.remove(element, findParent)
    // })

    const isDocumentElement = element === document.documentElement

    const parent = findParent()
    const parentMatrix: MatrixComponents | undefined = parent
      ? this.#matrices.use(parent)
      : undefined

    const rect: Accessor<DOMRect | undefined> =
      parentMatrix || isDocumentElement ? this.#rects.use(element) : () => undefined

    const rectPosition = createMemo<vec2 | undefined>(
      prev => {
        const rectValue = rect?.()
        if (rectValue) {
          return center(prev ?? vec2.create(), rectValue)
        }
      },
      undefined,
      { equals: false },
    )

    const layoutDelta = createMemo<vec2 | undefined>(
      prev => {
        const parentRectPositionValue = parentMatrix?.rectPosition()
        const rectPositionValue = rectPosition()
        if (rectPositionValue) {
          return parentRectPositionValue
            ? vec2.sub(prev ?? vec2.create(), rectPositionValue, parentRectPositionValue)
            : rectPositionValue
        }
      },
      undefined,
      { equals: false },
    )

    const intermediateMatrix = createMemo<mat2d | undefined>(
      prev => {
        const parentIntermediateMatrixValue = parentMatrix?.intermediateMatrix()
        const layoutDeltaValue = layoutDelta()
        const next = prev ?? mat2d.create()
        if (layoutDeltaValue) {
          if (isDocumentElement) {
            mat2d.fromTranslation(next, layoutDeltaValue)
          } else if (parentIntermediateMatrixValue) {
            mat2d.translate(next, parentIntermediateMatrixValue, layoutDeltaValue)
          } else {
            mat2d.identity(next)
          }

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

    return {
      matrix,
      intermediateMatrix,
      rectPosition,
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
        return this.#rects.use(elementValue)
      }
    })
    return () => memo()?.()
  }

  useMatrix(element: MaybeAccessor<HTMLElement | undefined>): Accessor<mat2d | undefined> {
    const memo = createMemo(() => {
      const elementValue = access(element)
      if (elementValue) {
        return this.#matrices.use(elementValue).matrix
      }
    })
    return () => memo()?.()
  }
}
