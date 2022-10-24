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

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }
}

class Transform {
  translate: [number, number];
  rotate: number;
  scale: [number, number];

  constructor() {
    this.translate = [0, 0];
    this.rotate = 0;
    this.scale = [0, 0];
  }

  static from(source: Transform) {
    const result = new Transform();
    result.translate[0] = source.translate[0];
    result.translate[1] = source.translate[1];
    result.rotate = source.rotate;
    result.scale[0] = source.scale[0];
    result.scale[1] = source.scale[1];
    return result;
  }

  multiply(that: Transform) {
    return this;
  }

  toStyleString() {
    return `translate(${this.translate[0]}px, ${this.translate[1]}px) rotateZ(${this.rotate}rad) scale(${this.scale[0]}, ${this.scale[1]})`;
  }
}

export type RectListener = (rect: Rect) => void;

export type TransformListener = (rect: Transform) => void;

class ElementState {
  parentTransform: Transform;
  layoutTransform: Transform;
  styleTransform: Transform;
  scrollTransform: Transform;
  offsetRect: Rect;
  rectListeners: Set<RectListener>;
  transformListeners: Set<TransformListener>;

  constructor() {
    this.parentTransform = new Transform();
    this.layoutTransform = new Transform();
    this.styleTransform = new Transform();
    this.scrollTransform = new Transform();
    this.offsetRect = new Rect();
    this.rectListeners = new Set();
    this.transformListeners = new Set();
  }
}

export class LayoutObserver {
  private elementState: WeakMap<HTMLElement, ElementState>;

  constructor() {
    this.onScroll = this.onScroll.bind(this);

    this.elementState = new WeakMap();

    window.addEventListener("scroll", this.onScroll);
  }

  private updateChildren(element: HTMLElement, state: ElementState) {
    const transform = Transform.from(state.parentTransform)
      .multiply(state.layoutTransform)
      .multiply(state.styleTransform)
      .multiply(state.scrollTransform);

    for (const child of element.children) {
      if (child instanceof HTMLElement) {
        this.onParentUpdate(child, transform);
      }
    }
  }

  private onScroll(event: Event) {
    const element =
      event.target === window ? document.body : (event.target as HTMLElement);
    if (this.elementState.has(element)) {
      const state = this.elementState.get(element);
      state.scrollTransform.translate[0] = element.scrollLeft;
      state.scrollTransform.translate[1] = element.scrollTop;
      this.updateChildren(element, state);
    }
  }

  private onParentUpdate(element: HTMLElement, parentTransform: Transform) {
    if (this.elementState.has(element)) {
      const state = this.elementState.get(element);
      state.parentTransform = parentTransform;
      const transform = Transform.from(state.parentTransform).multiply(
        state.layoutTransform
      );
      for (const listener of state.transformListeners) {
        listener(transform);
      }
      this.updateChildren(element, state);
    }
  }

  setTransform(element: HTMLElement, transform: Transform) {
    if (this.elementState.has(element)) {
      const state = this.elementState.get(element);
      state.styleTransform = transform;
      element.style.transform = transform.toStyleString();
      this.updateChildren(element, state);
    }
  }

  private measureElement(element, scrollX, scrollY) {
    if (!this.elementState.has(element)) {
      this.elementState.set(element, new ElementState());
    }
    const state = this.elementState.get(element);
    const offsetRect = element.getBoundingClientRect();
    state.offsetRect.x = offsetRect.x - scrollX;
    state.offsetRect.y = offsetRect.y - scrollY;
    state.offsetRect.width = offsetRect.width;
    state.offsetRect.height = offsetRect.height;

    for (const child of element.children) {
      this.measureElement(
        child,
        scrollX + element.scrollLeft,
        scrollY + element.scrollTop
      );
    }
  }

  measure() {
    const transforms = new WeakMap();

    for (const element of walk(document.body)) {
      transforms.set(element, element.style.transform);
      element.style.transform = "";
    }

    this.measureElement(document.body, window.scrollX, window.scrollY);

    for (const element of walk(document.body)) {
      element.style.transform = transforms.get(element);
    }
  }
}
