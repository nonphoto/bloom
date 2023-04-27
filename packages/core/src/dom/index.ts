import { mat2d, mat4, vec2 } from 'gl-matrix'
import { Rect } from '../rect'
import { rect } from '..'
import {
  Accessor,
  Setter,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  onCleanup,
} from 'solid-js'
import { ReactiveMap } from '@solid-primitives/map'

/* TODO: Difference between
 * - document rect (before scrolling, relative to document)
 * - client rect (after scrolling, relative to window)
 * - transform (after scrolling, relative to window, affected by rotation, scale, etc)
 * Below uses document rect but after scrolling?
 * Maybe transforming an element creates a new context?
 * - this doesnt work with transform-based layouts
 * How about:
 * - one observer per element, includes scroll observer
 * - offset rect (before transform, relative to document)
 * - client rect (after transform, relative to window)
 * - manually add children to parent observers
 * - This avoids having to walk the tree or add mutation observers but makes construction more difficult
 * What about position absolute?
 * - position property affects the element that offset values are relative to
 * - use offsetParent property
 * - Scrolling elements should always be positioned, require all scrolling and positioned elements to be observed
 * How to determine if an element is positioned? it might change with css?
 * - this should be solved the same way as layout, remeasure the element on resize
 */

/*
 * All scrolling elements must be positioned
 * non-relative-positioned elements are not allowed as children of static-positioned elements
 */

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

export function* walkParents(element: HTMLElement): Generator<HTMLElement, void, unknown> {
  let parent = element.parentElement
  while (parent) {
    yield parent
    parent = parent.parentElement
  }
}

export function* walkChildren(root: HTMLElement) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node: Node) {
      return node instanceof HTMLElement ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    },
  })

  let currentNode: Node | null = treeWalker.currentNode
  while (currentNode) {
    yield currentNode as HTMLElement
    currentNode = treeWalker.nextNode()
  }
}

function getScrollEmitter(element: HTMLElement): HTMLElement | Document {
  return element === document.documentElement ? document : element
}

type LayoutController = {
  layoutRect: Rect
  parentRelativeTranslation: vec2
  extrinsicTransform: Accessor<mat2d>
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

function styleTransform(transform: mat2d): string
function styleTransform(transform: mat4): string
function styleTransform(transform: Float32Array | Array<number>) {
  return transform.length === 6
    ? `matrix(${transform.join(',')})`
    : transform.length === 16
    ? `matrix3d(${transform.join(',')})`
    : 'translate3d(0,0,0)'
}

const styleTransformIdentity = styleTransform(mat2d.identity(mat2d.create()))

export class LayoutObserver {
  private transformControllers: ReactiveMap<HTMLElement, TransformController> = new ReactiveMap()
  private layoutControllers: ReactiveMap<HTMLElement, LayoutController> = new ReactiveMap()

  private createLayoutController(element: HTMLElement): LayoutController {
    const layoutController = this.layoutControllers.get(element)
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

    const transformController = this.transformControllers.get(element)

    let controller: LayoutController

    createRoot(dispose => {
      const layoutRect = rect.fromDOMRect(rect.create(), element.getBoundingClientRect())

      const [scrollTranslation, setScrollTranslation] = createSignal(
        vec2.fromValues(-element.scrollLeft, -element.scrollTop),
        { equals: false },
      )

      const accumulatedScrollTranslation = createMemo<vec2>(
        prev => {
          return parentController
            ? vec2.add(prev, parentController.scrollTranslation(), scrollTranslation())
            : vec2.copy(prev, scrollTranslation())
        },
        vec2.create(),
        { equals: false },
      )

      // const extrinsicTransform = createMemo<mat2d>(prev => {}, mat2d.create(), { equals: false })

      // function onExtrinsicTransform(transform: mat2d) {
      //   mat2d.copy(controller.extrinsicTransform, transform)

      //   // account for parentRelativeTranslation

      //   if (transformController) {
      //     for (const listener of transformController.extrinsicTransformListeners) {
      //       listener(controller.extrinsicTransform)
      //     }
      //   }
      // }

      // function onIntrinsicTransform(transform: mat2d) {
      //   mat2d.copy(controller.intrinsicTransform, transform)

      //   for (const listener of controller.extrinsicTransformListeners) {
      //     listener(transform)
      //   }
      // }

      if (willScroll(element)) {
        function onScroll() {
          setScrollTranslation(prev => vec2.set(prev, -element.scrollLeft, -element.scrollTop))
        }

        getScrollEmitter(element).addEventListener('scroll', onScroll, { passive: true })

        onCleanup(() => {
          getScrollEmitter(element).removeEventListener('scroll', onScroll)
        })
      }

      if (isDocumentElement) {
        vec2.sub(layoutRect.position, layoutRect.position, scrollTranslation())
      } else if (parentController) {
        vec2.sub(
          layoutRect.position,
          layoutRect.position,
          parentController.accumulatedScrollTranslation(),
        )
      }

      controller = {
        layoutRect,
        scrollTranslation,
        accumulatedScrollTranslation,
        parentRelativeTranslation: vec2.create(),
        extrinsicTransform: () => mat2d.create(),
        dispose,
      }

      this.layoutControllers.set(element, controller)
    })

    return controller!
  }

  private createTransformController(element: HTMLElement): TransformController {
    const transformController = this.transformControllers.get(element)
    if (transformController) {
      return transformController
    }

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
        dispose,
      }

      createEffect(() => {
        element.style.transform = isEnabled()
          ? styleTransform(intrinsicTransform())
          : styleTransformIdentity
      })

      onCleanup(() => {
        element.style.transform = ''
      })

      this.transformControllers.set(element, controller)
    })

    return controller!
  }

  connect(element: HTMLElement) {
    const controller = this.createTransformController(element)

    const observer = this

    return [
      {
        intrinsicTransform: controller.intrinsicTransform,
        extrinsicTransform() {
          return observer.layoutControllers.get(element)?.extrinsicTransform()
        },
        layoutRect() {
          return observer.layoutControllers.get(element)?.layoutRect
        },
      },
      {
        setIntrinsicTransform: controller.setIntrinsicTransform,
        disconnect() {
          controller.dispose()
        },
      },
    ]
  }

  measureAll() {
    for (const [, controller] of this.layoutControllers) {
      controller.dispose()
    }

    for (const [, controller] of this.transformControllers) {
      controller.setIsEnabled(false)
    }

    for (const [element] of this.transformControllers) {
      this.createLayoutController(element)
    }

    for (const [, controller] of this.transformControllers) {
      controller.setIsEnabled(true)
    }
  }

  disconnectAll() {}
}
