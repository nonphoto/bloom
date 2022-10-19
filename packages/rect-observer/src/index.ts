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

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createRect(): Rect {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
}

export interface Transform {
  translate: [number, number];
  rotate: number;
  scale: [number, number];
}

function createTransform(): Transform {
  return {
    translate: [0, 0],
    rotate: 0,
    scale: [0, 0],
  };
}

export type LayoutListener = (rect: Rect, transform: Transform) => void;

interface LayoutControllerOptions {
  willScroll?: boolean;
  willPosition?: boolean;
}

class LayoutController {
  private element: HTMLElement;
  private listeners: Set<LayoutListener>;
  private children: Set<LayoutController>;
  private rect: Rect;
  private transform: Transform; // relative to rect
  private willScroll: boolean;
  private willPosition: boolean;
  private scrollX: number;
  private scrollY: number;

  private static instances: WeakMap<HTMLElement, LayoutController> =
    new WeakMap();

  constructor(
    element: HTMLElement,
    { willScroll, willPosition }: LayoutControllerOptions = {}
  ) {
    this.onScroll = this.onScroll.bind(this);

    this.element = element;
    this.willScroll = willScroll;
    this.willPosition = willPosition;
    this.listeners = new Set();
    this.children = new Set();
    this.rect = createRect();
    this.transform = createTransform();

    if (this.willScroll) {
      this.element.addEventListener("scroll", this.onScroll);
    }

    LayoutController.instances.set(this.element, this);
  }

  private static *walk(root: HTMLElement) {
    const treeWalker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          return this.instances.has(node as HTMLElement)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        },
      }
    );

    let currentNode = treeWalker.currentNode;

    while (currentNode) {
      yield this.instances.get(currentNode as HTMLElement);
      currentNode = treeWalker.nextNode();
    }
  }

  static measure(root: HTMLElement) {
    for (const instance of this.walk(root)) {
      instance.beforeMeasure();
    }

    for (const instance of this.walk(root)) {
      instance.measure();
    }

    for (const instance of this.walk(root)) {
      instance.afterMeasure();
    }
  }

  private onScroll() {}

  private beforeMeasure() {
    this.element.style.transform = "";
    this.children.clear();
  }

  private measure(parent, scrollX, scrollY) {
    if (parent.element === (this.element.offsetParent as HTMLElement)) {
      parent.children.add(this);
    }

    // TODO: Replace with getComputedStyle
    this.position = this.element.style.position;
    switch (this.position) {
      case "static":
      case "relative":
        parent.children.add(this);
        break;
      case "absolute":
      case "sticky":
        LayoutController.instances
          .get(this.element.offsetParent as HTMLElement)
          .children.add(this);
        break;
    }

    const rect = this.element.getBoundingClientRect();
    this.rect = {
      x: rect.x - scrollX,
      y: rect.y - scrollY,
      width: rect.width,
      height: rect.height,
    };
  }

  private afterMeasure() {
    // this.element.style.transform = ...;
  }

  setTransform(transform: Transform) {}
}

// export class RectObserver {
//   measuredElements: Map<Element, { rect: Rect; listeners: Set<RectListener> }>;
//   scrollingElements: Map<Element, { scrollLeft: number; scrollTop: number }>;

//   constructor() {
//     this.scrollListener = this.scrollListener.bind(this);
//     this.measuredElements = new Map();
//     this.scrollingElements = new Map();
//   }

//   measureAll(root: HTMLElement) {
//     const map: Map<HTMLElement, string> = new Map();
//     const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
//     let currentNode: HTMLElement | null = walker.currentNode as HTMLElement;
//     while ((currentNode = walker.nextNode() as HTMLElement)) {
//       if (currentNode.style.transform != null) {
//         map.set(currentNode, currentNode.style.transform);
//         currentNode.style.transform = "";
//       }
//     }
//     for (const [element, state] of this.measuredElements.entries()) {
//       const rect = element.getBoundingClientRect();
//       for (const listener of state.listeners) {
//         listener.call(null, rect);
//       }
//     }
//     for (const [element, transform] of map.entries()) {
//       element.style.transform = transform;
//     }
//   }

//   scrollListener(event: Event): void {
//     if (!(event.target instanceof Element)) return;
//     const prev = this.scrollingElements.get(event.target);
//     if (prev == null) return;
//     for (let [element, state] of this.measuredElements.entries()) {
//       if (event.target.contains(element)) {
//         state.rect.x += prev.scrollLeft - event.target.scrollLeft;
//         state.rect.y += prev.scrollTop - event.target.scrollTop;
//         for (let listener of state.listeners) {
//           listener.call(null, state.rect);
//         }
//       }
//     }
//   }

//   observeScrollingElement(element: Element) {
//     this.scrollingElements.set(element, { scrollLeft: 0, scrollTop: 0 });
//     element.addEventListener("scroll", this.scrollListener, {
//       passive: true,
//     });
//   }

//   unobserveScrollingElement(element: Element) {
//     this.scrollingElements.delete(element);
//     element.removeEventListener("scroll", this.scrollListener);
//   }

//   addRectListener(element: Element, listener: RectListener): void {
//     if (this.measuredElements.has(element)) {
//       this.measuredElements.get(element)?.listeners.add(listener);
//     } else {
//       this.measuredElements.set(element, {
//         rect: measureOne(element),
//         listeners: new Set([listener]),
//       });
//     }
//   }

//   removeRectListener(element: Element, listener: RectListener): void {
//     const state = this.measuredElements.get(element);
//     if (state != null) {
//       state.listeners.delete(listener);
//       if (state.listeners.size < 1) {
//         this.measuredElements.delete(element);
//       }
//     }
//   }

//   addTransformListener() {}

//   removeTransformListener() {}

//   disconnect(): void {
//     this.measuredElements.clear();
//     this.scrollingElements.clear();
//   }
// }
