import { mat2d, vec2 } from 'gl-matrix'
import * as rect from '../rect'
import {
  Accessor,
  Setter,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  onCleanup,
  untrack,
} from 'solid-js'
import { ReactiveMap } from '@solid-primitives/map'

const willChangeValues = [
  'position',
  'z-index',
  'opacity',
  'transform',
  'webkit-transform',
  'mix-blend-mode',
  'filter',
  'webkit-filter',
  'isolation',
]

function isFlexItem(element: Element) {
  const parent = element.parentElement
  if (parent) {
    const display = getComputedStyle(parent).display
    return display === 'flex' || display === 'inline-flex'
  } else {
    return false
  }
}

function createsStackingContext(element: Element) {
  const style = getComputedStyle(element)

  if (style.position === 'fixed') return true
  if ((style.zIndex !== 'auto' && style.position !== 'static') || isFlexItem(element)) return true
  if (+style.opacity < 1) return true
  if ('transform' in style && style.transform !== 'none') return true
  if ('mixBlendMode' in style && style.mixBlendMode !== 'normal') return true
  if ('filter' in style && style.filter !== 'none') return true
  if ('isolation' in style && style.isolation === 'isolate') return true
  if (willChangeValues.includes(style.willChange)) return true
  return false
}

function willScroll(element: Element) {
  if (element === document.documentElement) {
    return true
  } else {
    const style = getComputedStyle(element)
    const values = [style.overflow, style.overflowX, style.overflowY]
    return values.some(value => value === 'auto' || value === 'scroll')
  }
}

function getOffsetParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement

  while (parent && parent != element.offsetParent && !createsStackingContext(parent)) {
    parent = parent.parentElement
  }

  return parent
}

function getNearestScrollingAncestor(element: HTMLElement): HTMLElement | null {
  return element.parentElement
}

function getScrollEmitter(element: HTMLElement): HTMLElement | Document {
  return element === document.documentElement ? document : element
}

function styleTransform(transform: mat2d): string {
  return `matrix(${transform.join(',')})`
}

const identity = mat2d.identity(mat2d.create())
const zeroRect = rect.create()

type LayoutController = {
  intermediateTransform: Accessor<mat2d>
  extrinsicTransform: Accessor<mat2d>
  layoutRect: rect.Rect
  scrollTranslation: Accessor<vec2>
  accumulatedScrollTranslation: Accessor<vec2>
  dispose(): void
}

type TransformController = {
  intrinsicTransform: Accessor<mat2d>
  setIntrinsicTransform: Setter<mat2d>
  setIsEnabled: Setter<boolean>
  dispose(): void
}

export type Layout = Readonly<{
  intrinsicTransform: Accessor<mat2d>
  extrinsicTransform: Accessor<mat2d>
  layoutRect: Accessor<rect.Rect>
  setIntrinsicTransform: Setter<mat2d>
  disconnect(): void
}>

export class LayoutObserver {
  private transformControllers: ReactiveMap<HTMLElement, TransformController> = new ReactiveMap()
  private layoutControllers: ReactiveMap<HTMLElement, LayoutController> = new ReactiveMap()

  private createLayoutController(element: HTMLElement): LayoutController {
    const layoutController = untrack(() => this.layoutControllers.get(element))
    if (layoutController) {
      return layoutController
    }

    const isDocumentElement = element === document.documentElement

    if (!isDocumentElement && !document.documentElement.contains(element)) {
      throw new Error()
    }

    const position = getComputedStyle(element).position

    let parent: HTMLElement | null
    if (element === document.documentElement) {
      parent = null
    } else if (position === 'sticky') {
      parent = getNearestScrollingAncestor(element)
    } else if (position === 'absolute' || position === 'fixed') {
      parent = getOffsetParent(element)
    } else {
      parent = element.parentElement
    }

    const parentController = parent ? this.createLayoutController(parent) : null

    const transformController = untrack(() => this.transformControllers.get(element))

    const observer = this

    let controller: LayoutController

    createRoot(dispose => {
      const layoutRect = rect.fromDOMRect(rect.create(), element.getBoundingClientRect())

      const [scrollTranslation, setScrollTranslation] = createSignal(
        vec2.fromValues(-element.scrollLeft, -element.scrollTop),
        { equals: false },
      )

      untrack(() => {
        if (isDocumentElement) {
          vec2.sub(layoutRect.position, layoutRect.position, scrollTranslation())
        } else if (parentController) {
          vec2.sub(
            layoutRect.position,
            layoutRect.position,
            parentController.accumulatedScrollTranslation(),
          )
        }
      })

      const negativeLayoutRectPosition = vec2.create()
      vec2.sub(negativeLayoutRectPosition, negativeLayoutRectPosition, layoutRect.position)

      const negativeLayoutTransform = mat2d.fromTranslation(
        mat2d.create(),
        negativeLayoutRectPosition,
      )

      const layoutDelta = vec2.clone(layoutRect.position)
      if (parentController) {
        vec2.sub(layoutDelta, layoutDelta, parentController.layoutRect.position)
      }

      const accumulatedScrollTranslation = () =>
        parentController
          ? vec2.add(
              vec2.create(),
              parentController.accumulatedScrollTranslation(),
              scrollTranslation(),
            )
          : scrollTranslation()

      const intermediateTransform = createMemo<mat2d>(
        prev => {
          if (isDocumentElement) {
            mat2d.fromTranslation(prev, layoutDelta)
          } else if (parentController) {
            mat2d.translate(prev, parentController.intermediateTransform(), layoutDelta)
          }

          if (transformController) {
            mat2d.multiply(prev, prev, transformController.intrinsicTransform())
          }

          mat2d.translate(prev, prev, scrollTranslation())

          return prev
        },
        mat2d.create(),
        { equals: false },
      )

      const extrinsicTransform = createMemo<mat2d>(
        prev => mat2d.multiply(prev, negativeLayoutTransform, intermediateTransform()),
        mat2d.create(),
        { equals: false },
      )

      if (willScroll(element)) {
        function onScroll() {
          setScrollTranslation(prev => vec2.set(prev, -element.scrollLeft, -element.scrollTop))
        }

        getScrollEmitter(element).addEventListener('scroll', onScroll, { passive: true })

        onCleanup(() => {
          getScrollEmitter(element).removeEventListener('scroll', onScroll)
        })
      }

      controller = {
        intermediateTransform,
        extrinsicTransform,
        layoutRect,
        scrollTranslation,
        accumulatedScrollTranslation,
        dispose() {
          observer.layoutControllers.delete(element)
          dispose()
        },
      }

      observer.layoutControllers.set(element, controller)
    })

    return controller!
  }

  private createTransformController(element: HTMLElement): TransformController {
    const transformController = untrack(() => this.transformControllers.get(element))
    if (transformController) {
      return transformController
    }

    const observer = this

    let controller: TransformController

    createRoot(dispose => {
      const [intrinsicTransform, setIntrinsicTransform] = createSignal(mat2d.create(), {
        equals: false,
      })

      const [isEnabled, setIsEnabled] = createSignal(true)

      controller = {
        intrinsicTransform,
        setIntrinsicTransform,
        setIsEnabled,
        dispose() {
          observer.transformControllers.delete(element)
          dispose()
        },
      }

      createEffect(() => {
        element.style.transform = styleTransform(isEnabled() ? intrinsicTransform() : identity)
      })

      onCleanup(() => {
        element.style.transform = ''
      })

      observer.transformControllers.set(element, controller)
    })

    return controller!
  }

  connect(element: HTMLElement): Layout {
    const controller = this.createTransformController(element)

    const observer = this

    return {
      intrinsicTransform() {
        return controller.intrinsicTransform()
      },
      extrinsicTransform() {
        return observer.layoutControllers.get(element)?.extrinsicTransform() ?? identity
      },
      layoutRect() {
        return observer.layoutControllers.get(element)?.layoutRect ?? zeroRect
      },
      setIntrinsicTransform: controller.setIntrinsicTransform,
      disconnect() {
        controller.dispose()
      },
    }
  }

  measureAll() {
    for (const [, controller] of this.layoutControllers) {
      controller.dispose()
    }

    for (const [, controller] of this.transformControllers) {
      controller.setIsEnabled(false)
    }

    queueMicrotask(() => {
      for (const [element] of this.transformControllers) {
        this.createLayoutController(element)
      }

      for (const [, controller] of this.transformControllers) {
        controller.setIsEnabled(true)
      }
    })
  }

  disconnectAll() {
    for (const [, controller] of this.layoutControllers) {
      controller.dispose()
    }

    for (const [, controller] of this.transformControllers) {
      controller.dispose()
    }
  }
}
