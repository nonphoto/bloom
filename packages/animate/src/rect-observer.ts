import { vec2 } from "gl-matrix";
import { Rect, create as createRect, fromDOMRect } from "./rect";

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

function* walk(root: HTMLElement) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode() {
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = treeWalker.currentNode;
  while (currentNode) {
    yield currentNode as HTMLElement;
    currentNode = treeWalker.nextNode();
  }
}

export type RectListener = (rect: Rect) => void;

export class RectObserver {
  private readonly rects: WeakMap<HTMLElement, Rect> = new WeakMap();
  private readonly listeners: WeakMap<HTMLElement, Set<RectListener>> =
    new WeakMap();

  private measureElement(
    element: HTMLElement,
    scrollX: number,
    scrollY: number
  ) {
    if (this.listeners.has(element)) {
      if (!this.rects.has(element)) {
        this.rects.set(element, createRect());
      }
      const rect = this.rects.get(element);
      console.log(rect);
      const clientRect = element.getBoundingClientRect();
      fromDOMRect(rect, clientRect);
      vec2.add(rect.position, rect.position, vec2.fromValues(scrollX, scrollY));
    }

    for (const child of element.children) {
      if (child instanceof HTMLElement) {
        this.measureElement(
          child,
          scrollX + element.scrollLeft,
          scrollY + element.scrollTop
        );
      }
    }
  }

  measure() {
    const transforms = new WeakMap();

    for (const element of walk(document.body)) {
      transforms.set(element, element.style.transform);
      element.style.transform = "none";
    }

    this.measureElement(document.body, window.scrollX, window.scrollY);

    for (const element of walk(document.body)) {
      element.style.transform = transforms.get(element);

      if (this.listeners.has(element) && this.rects.has(element)) {
        for (const listener of this.listeners.get(element)) {
          listener.call(undefined, this.rects.get(element));
        }
      }
    }
  }

  addListener(element: HTMLElement, listener: RectListener) {
    if (!this.listeners.has(element)) {
      this.listeners.set(element, new Set());
    }
    this.listeners.get(element).add(listener);
  }

  removeListener(element: HTMLElement, listener: RectListener) {
    if (this.listeners.has(element)) {
      this.listeners.get(element).delete(listener);
    }
  }
}
