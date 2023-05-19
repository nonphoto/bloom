import { mat2d, vec2 } from 'gl-matrix'

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

export function borderRadius(radius: number, size: vec2, transform: mat2d) {
  const x = (radius / (size[0] * transform[0])) * 100
  const y = (radius / (size[1] * transform[3])) * 100
  return `${x}% / ${y}%`
}

export function boxShadow(
  inset: boolean,
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  spreadRadius: number,
  color: string,
  transform: mat2d,
) {
  const meanScale = (transform[0] + transform[3]) / 2
  return `${inset ? 'inset ' : ''}${offsetX / transform[0]}px ${offsetY / transform[3]}px ${
    blurRadius / meanScale
  }px ${spreadRadius / meanScale}px ${color}`
}

export function getScaling(out: vec2, a: mat2d) {
  let m11 = a[0]
  let m12 = a[1]
  let m21 = a[2]
  let m22 = a[3]
  out[0] = Math.hypot(m11, m12)
  out[1] = Math.hypot(m21, m22)
  return out
}

export function center(out: vec2, rect: DOMRect) {
  return vec2.set(out, rect.x - rect.width / 2, rect.y - rect.height / 2)
}

export function mat2dFromNegativeTranslation(out: mat2d, a: vec2) {
  out[0] = 1
  out[1] = 0
  out[2] = 0
  out[3] = 1
  out[4] = -a[0]
  out[5] = -a[1]
  return out
}

export function isFlexItem(element: Element) {
  const parent = element.parentElement
  if (parent) {
    const display = getComputedStyle(parent).display
    return display === 'flex' || display === 'inline-flex'
  } else {
    return false
  }
}

export function createsStackingContext(element: Element) {
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

export function willScroll(element: Element) {
  if (element === document.documentElement) {
    return true
  } else {
    const style = getComputedStyle(element)
    const values = [style.overflow, style.overflowX, style.overflowY]
    return values.some(value => value === 'auto' || value === 'scroll')
  }
}

export function getOffsetParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement

  while (parent && parent != element.offsetParent && !createsStackingContext(parent)) {
    parent = parent.parentElement
  }

  return parent
}

export function getNearestScrollingAncestor(element: HTMLElement): HTMLElement | null {
  return element.parentElement
}

export function getScrollEmitter(element: HTMLElement): HTMLElement | Document {
  return element === document.documentElement ? document : element
}

export function styleTransform(transform: mat2d): string {
  return `matrix(${transform.join(',')})`
}

export function walkParents(element: HTMLElement, callback: (element: HTMLElement) => void) {
  let parent = element.parentElement
  while (parent) {
    callback.call(undefined, parent)
    parent = parent.parentElement
  }
}

export function* walkChildren(root: HTMLElement, callback: (element: HTMLElement) => void) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node: Node) {
      return node instanceof HTMLElement ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    },
  })

  let currentNode: Node | null = treeWalker.currentNode
  while (currentNode) {
    callback.call(undefined, currentNode as HTMLElement)
    currentNode = treeWalker.nextNode()
  }
}
