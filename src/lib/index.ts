export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/* TODO: Difference between
 * - document rect (before scrolling, relative to document)
 * - client rect (after scrolling, relative to window)
 * - transform (after scrolling, relative to window, affected by rotation, scale, etc)
 * Below uses document rect but after scrolling?
 * Maybe transforming an element creates a new context?
 * - this doesnt work with transform-based layouts
 */

export type RectListener = (rect: Rect) => void;

function measureOne(element: HTMLElement) {
  const map: Map<HTMLElement, string> = new Map();
  let parent: HTMLElement | null = element;
  while (parent != null) {
    map.set(parent, parent.style.transform);
    parent.style.transform = "";
    parent = parent.parentElement;
  }
  const rect = element.getBoundingClientRect();
  for (let [element, transform] of map.entries()) {
    element.style.transform = transform;
  }
  return rect;
}

export class RectObserver {
  measuredElements: Map<Element, { rect: Rect; listeners: Set<RectListener> }>;
  scrollingElements: Map<Element, { scrollLeft: number; scrollTop: number }>;

  constructor() {
    this.scrollListener = this.scrollListener.bind(this);
    this.measuredElements = new Map();
    this.scrollingElements = new Map();
  }

  measureAll(root: HTMLElement) {
    const map: Map<HTMLElement, string> = new Map();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let currentNode: HTMLElement | null = walker.currentNode as HTMLElement;
    while ((currentNode = walker.nextNode() as HTMLElement)) {
      if (currentNode.style.transform != null) {
        map.set(currentNode, currentNode.style.transform);
        currentNode.style.transform = "";
      }
    }
    for (const [element, state] of this.measuredElements.entries()) {
      const rect = element.getBoundingClientRect();
      for (const listener of state.listeners) {
        listener.call(null, rect);
      }
    }
    for (const [element, transform] of map.entries()) {
      element.style.transform = transform;
    }
  }

  scrollListener(event: Event): void {
    if (!(event.target instanceof Element)) return;
    const prev = this.scrollingElements.get(event.target);
    if (prev == null) return;
    for (let [element, state] of this.measuredElements.entries()) {
      if (event.target.contains(element)) {
        state.rect.x += prev.scrollLeft - event.target.scrollLeft;
        state.rect.y += prev.scrollTop - event.target.scrollTop;
        for (let listener of state.listeners) {
          listener.call(null, state.rect);
        }
      }
    }
  }

  observeScrollingElement(element: Element) {
    this.scrollingElements.set(element, { scrollLeft: 0, scrollTop: 0 });
    element.addEventListener("scroll", this.scrollListener, {
      passive: true,
    });
  }

  unobserveScrollingElement(element: Element) {
    this.scrollingElements.delete(element);
    element.removeEventListener("scroll", this.scrollListener);
  }

  addRectListener(element: Element, listener: RectListener): void {
    if (this.measuredElements.has(element)) {
      this.measuredElements.get(element)?.listeners.add(listener);
    } else {
      this.measuredElements.set(element, {
        rect: measureOne(element),
        listeners: new Set([listener]),
      });
    }
  }

  removeRectListener(element: Element, listener: RectListener): void {
    const state = this.measuredElements.get(element);
    if (state != null) {
      state.listeners.delete(listener);
      if (state.listeners.size < 1) {
        this.measuredElements.delete(element);
      }
    }
  }

  addTransformListener() {

  }

  removeTransformListener() {
    
  }

  disconnect(): void {
    this.measuredElements.clear();
    this.scrollingElements.clear();
  }
}
