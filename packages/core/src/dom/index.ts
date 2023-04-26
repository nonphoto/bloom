import { mat4, vec2 } from 'gl-matrix'
import { Rect } from '../rect'
import { rect } from '..'

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

function getNearestScrollingAncestor(element: HTMLElement): HTMLElement | null {}

function* walkParents(element: HTMLElement): Generator<HTMLElement, void, unknown> {
  let parent = element.parentElement
  while (parent) {
    yield parent
    parent = parent.parentElement
  }
}

function* walkChildren(root: HTMLElement) {
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
  intrinsicTransform: mat4
  extrinsicTransform: mat4
  layoutRect: Rect
  parentRelativeTranslation: vec2
  scrollTranslation: vec2
  extrinsicTransformListeners: Set<(transform: mat4) => void>
  accumulatedScrollTranslation(out: vec2): vec2
  dispose(): void
}

type TransformController = {
  intrinsicTransform: mat4
  intrinsicTransformListeners: Set<(transform: mat4) => void>
  extrinsicTransformListeners: Set<(transform: mat4) => void>
  layoutRectListeners: Set<(rect: Rect) => void>
  setTransform(transform: mat4): void
  disable(): void
  enable(): void
  dispose(): void
}

function styleTransform(transform: mat4) {
  return `matrix3d(${transform.join(',')})`
}

const styleTransformIdentity = styleTransform(mat4.identity(mat4.create()))

const zero = vec2.zero(vec2.create())

export class LayoutObserver {
  private transformControllers: Map<HTMLElement, TransformController> = new Map()
  private layoutControllers: Map<HTMLElement, LayoutController> = new Map()

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

    const controller: LayoutController = {
      intrinsicTransform: mat4.create(),
      extrinsicTransform: mat4.create(),
      layoutRect: rect.create(),
      parentRelativeTranslation: vec2.create(),
      scrollTranslation: vec2.create(),
      extrinsicTransformListeners: new Set(),
      accumulatedScrollTranslation(out: vec2) {
        return vec2.add(
          out,
          this.scrollTranslation,
          parentController?.accumulatedScrollTranslation(out) ?? zero,
        )
      },
      dispose() {
        getScrollEmitter(element).removeEventListener('scroll', onScroll)
        parentController?.extrinsicTransformListeners.delete(onExtrinsicTransform)
        transformController?.intrinsicTransformListeners.delete(onIntrinsicTransform)
      },
    }

    function onExtrinsicTransform(transform: mat4) {
      mat4.copy(controller.extrinsicTransform, transform)

      // account for parentRelativeTranslation

      if (transformController) {
        for (const listener of transformController.extrinsicTransformListeners) {
          listener(controller.extrinsicTransform)
        }
      }
    }

    function onIntrinsicTransform(transform: mat4) {
      mat4.copy(controller.intrinsicTransform, transform)

      for (const listener of controller.extrinsicTransformListeners) {
        listener(/* ??? */)
      }
    }

    function onScroll() {
      vec2.set(controller.scrollTranslation, -element.scrollLeft, -element.scrollTop)
    }

    parentController?.extrinsicTransformListeners.add(onExtrinsicTransform)

    transformController?.intrinsicTransformListeners.add(onIntrinsicTransform)

    if (willScroll(element)) {
      getScrollEmitter(element).addEventListener('scroll', onScroll, { passive: true })
    }

    onScroll()

    rect.fromDOMRect(controller.layoutRect, element.getBoundingClientRect())

    vec2.sub(
      controller.layoutRect.position,
      controller.layoutRect.position,
      isDocumentElement
        ? controller.scrollTranslation
        : parentController?.accumulatedScrollTranslation(vec2.create()) ?? zero,
    )

    this.layoutControllers.set(element, controller)

    return controller
  }

  private createTransformController(element: HTMLElement): TransformController {
    const transformController = this.transformControllers.get(element)
    if (transformController) {
      return transformController
    }

    const observer = this

    const controller: TransformController = {
      intrinsicTransform: mat4.create(),
      intrinsicTransformListeners: new Set<(transform: mat4) => void>(),
      extrinsicTransformListeners: new Set<(transform: mat4) => void>(),
      layoutRectListeners: new Set<(layoutRect: Rect) => void>(),
      setTransform(transform: mat4) {
        if (!observer.transformControllers.has(element)) throw new Error()

        this.intrinsicTransform = transform

        for (const listener of this.intrinsicTransformListeners) {
          listener(transform)
        }
      },
      disable() {
        element.style.transform = styleTransformIdentity
      },
      enable() {
        element.style.transform = styleTransform(controller.intrinsicTransform)
      },
      dispose() {
        observer.transformControllers.delete(element)
      },
    }

    this.transformControllers.set(element, controller)

    return controller
  }

  connect(element: HTMLElement) {
    const controller = this.createTransformController(element)

    return {
      setTransform(transform: mat4) {
        controller.setTransform(transform)
      },
      addExtrinsicTransformListener(listener: (transform: mat4) => void) {
        controller.extrinsicTransformListeners.add(listener)
      },
      removeExtrinsicTransformListener(listener: (transform: mat4) => void) {
        controller.extrinsicTransformListeners.delete(listener)
      },
      addLayoutRectListener(listener: (layoutRect: Rect) => void) {
        controller.layoutRectListeners.add(listener)
      },
      removeLayoutRectListener(listener: (layoutRect: Rect) => void) {
        controller.layoutRectListeners.delete(listener)
      },
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
      controller.disable()
    }

    for (const [element] of this.transformControllers) {
      this.createLayoutController(element)
    }

    for (const [, controller] of this.transformControllers) {
      controller.enable()
    }
  }

  disconnectAll() {}
}
