const willChangeValues = [
  "position",
  "z-index",
  "opacity",
  "transform",
  "webkit-transform",
  "mix-blend-mode",
  "filter",
  "webkit-filter",
  "isolation",
];

export function isFlexItem(element: Element) {
  const parent = element.parentElement;
  if (parent) {
    const display = getComputedStyle(parent).display;
    return display === "flex" || display === "inline-flex";
  } else {
    return false;
  }
}

export function createsStackingContext(element: Element) {
  const style = getComputedStyle(element);

  if (style.position === "fixed") return true;
  if (
    (style.zIndex !== "auto" && style.position !== "static") ||
    isFlexItem(element)
  )
    return true;
  if (+style.opacity < 1) return true;
  if ("transform" in style && style.transform !== "none") return true;
  if ("mixBlendMode" in style && style.mixBlendMode !== "normal") return true;
  if ("filter" in style && style.filter !== "none") return true;
  if ("isolation" in style && style.isolation === "isolate") return true;
  if (willChangeValues.includes(style.willChange)) return true;
  return false;
}

export function getWillScroll(element: Element) {
  if (element === document.documentElement) {
    return true;
  } else {
    const style = getComputedStyle(element);
    const values = [style.overflow, style.overflowX, style.overflowY];
    return values.some((value) => value === "auto" || value === "scroll");
  }
}

export function getOffsetParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;

  while (
    parent &&
    parent != element.offsetParent &&
    !createsStackingContext(parent)
  ) {
    parent = parent.parentElement;
  }

  return parent;
}

export function getNearestScrollingAncestor(
  element: HTMLElement,
): HTMLElement | null {
  // TODO: Implement getNearestScrollingAncestor
  return element.parentElement;
}

export function getContainingElement(element: HTMLElement): HTMLElement | null {
  const position = getComputedStyle(element).position;
  if (isDocumentElement(element)) {
    return null;
  } else if (position === "absolute" || position === "fixed") {
    return getOffsetParent(element);
  } else {
    return element.parentElement;
  }
}

export function walkAncestors(
  element: HTMLElement,
  callback: (element: HTMLElement) => void,
) {
  let parent = element.parentElement;
  while (parent) {
    callback.call(undefined, parent);
    parent = parent.parentElement;
  }
}

export function walkDescendants(
  root: HTMLElement,
  callback: (element: HTMLElement) => void,
) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node: Node) {
      return node instanceof HTMLElement
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });

  let currentNode: Node | null = treeWalker.currentNode;
  while (currentNode) {
    callback.call(undefined, currentNode as HTMLElement);
    currentNode = treeWalker.nextNode();
  }
}

export function mutatedElements(records: MutationRecord[]): Set<HTMLElement> {
  const mutatedElements = new Set<HTMLElement>();
  for (const record of records) {
    for (const node of Array.from(record.addedNodes)) {
      if (node instanceof HTMLElement) {
        mutatedElements.add(node);
      }
    }
    for (const node of Array.from(record.removedNodes)) {
      if (node instanceof HTMLElement) {
        mutatedElements.add(node);
      }
    }
  }
  return mutatedElements;
}

export function safeDocument(): Document | undefined {
  return typeof document !== "undefined" ? document : undefined;
}

export function safeWindow(): Window | undefined {
  return typeof window !== "undefined" ? window : undefined;
}

export function isDocumentElement(element: HTMLElement): boolean {
  return safeDocument()?.documentElement === element;
}
