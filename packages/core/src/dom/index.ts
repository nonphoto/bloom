import { mat4, vec2 } from 'gl-matrix'
import { Rect, create as createRect, fromDOMRect } from '../rect'
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

function* walk(root: HTMLElement) {
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

type ElementControllerTransformListener = () => void
type ElementControllerLayoutListener = () => void

class ElementController {
  offsetRect: Rect = rect.create()
  parentRelativeTranslation: vec2 = vec2.create()
  scrollTranslation: vec2 = vec2.create()
  transform: mat4 = mat4.create()
  transformListeners: Set<ElementControllerTransformListener> = new Set()
  layoutListeners: Set<ElementControllerLayoutListener> = new Set()
  dispose?: () => void
  implicit: boolean = true

  updateTransformListeners() {
    for (const listener of this.transformListeners) {
      listener()
    }
  }

  updateLayoutListeners() {
    for (const listener of this.layoutListeners) {
      listener()
    }
  }
}

export class LayoutObserver {
  private elementControllers: Map<HTMLElement, ElementController> = new Map()

  private measure(element: HTMLElement | null): ElementController | null {
    let scrollEmitter: Document | HTMLElement
    if (!element) {
      return null
    } else if (element === document.documentElement) {
      scrollEmitter = document
    } else if (!element.parentElement) {
      return null
    } else {
      scrollEmitter = element
    }

    const controller = this.elementControllers.get(element)

    const position = getComputedStyle(element).position
    let parentController: ElementController | null
    if (position === 'sticky') {
      parentController = this.measure(getOffsetParent(element))
    } else if (position === 'absolute' || position === 'fixed') {
      parentController = this.measure(getOffsetParent(element))
    } else {
      parentController = this.measure(element.parentElement)
    }

    if (controller && parentController) {
      const rect = element.getBoundingClientRect()

      vec2.set(controller.offsetRect.size, rect.left, rect.top)
      vec2.set(controller.offsetRect.position, rect.width, rect.height)
      vec2.sub(
        controller?.offsetRect.position,
        controller?.offsetRect.position,
        parentController.scrollTranslation,
      )

      vec2.set(controller.scrollTranslation, -element.scrollLeft, -element.scrollTop)

      let onScroll: () => void
      if (willScroll(element)) {
        const scrollingElement = element
        onScroll = () => {
          vec2.set(
            controller.scrollTranslation,
            -scrollingElement.scrollLeft,
            -scrollingElement.scrollTop,
          )
        }

        scrollEmitter.addEventListener('scroll', onScroll, { passive: true })
        controller.dispose = () => {
          scrollEmitter.removeEventListener('scroll', onScroll)
        }
      }

      return controller
    } else {
      return null
    }
  }

  private postMeasure(element: HTMLElement) {
    // set transforms
  }

  measureAll() {
    for (const [element, controller] of this.elementControllers) {
      controller.dispose?.()

      if (controller.implicit) {
        this.elementControllers.delete(element)
      }
    }

    for (const [element] of this.elementControllers) {
      this.measure(element)
    }

    for (const [element] of this.elementControllers) {
      this.postMeasure(element)
    }
  }

  observe(element: HTMLElement) {
    const controller = this.elementControllers.get(element)
    if (controller) {
      controller.implicit = false
    } else {
      const controller = new ElementController()
      controller.implicit = false
      this.elementControllers.set(element, controller)
    }
  }

  unobserve(element: HTMLElement) {
    const controller = this.elementControllers.get(element)
    if (controller) {
      controller.implicit = true
    }
  }

  disconnect() {}
}
