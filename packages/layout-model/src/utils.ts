import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Mat2d, Vec2, vec2Set } from "@chloranthy/core";
import { createEffect, createRoot } from "solid-js";

export type MapMaybeAccessor<T> = T extends any[]
  ? { [K in keyof T]: MaybeAccessor<T[K] | null | undefined> }
  : never;

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

export function borderRadius(radius: number, size: Vec2, transform: Mat2d) {
  const x = (radius / (size[0] * transform[0])) * 100;
  const y = (radius / (size[1] * transform[3])) * 100;
  return `${x}% / ${y}%`;
}

export function boxShadow(
  inset: boolean,
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  spreadRadius: number,
  color: string,
  transform: Mat2d,
) {
  const meanScale = (transform[0] + transform[3]) / 2;
  return `${inset ? "inset " : ""}${offsetX / transform[0]}px ${
    offsetY / transform[3]
  }px ${blurRadius / meanScale}px ${spreadRadius / meanScale}px ${color}`;
}

export function getScaling(out: Vec2, a: Mat2d) {
  let m11 = a[0];
  let m12 = a[1];
  let m21 = a[2];
  let m22 = a[3];
  out[0] = Math.hypot(m11, m12);
  out[1] = Math.hypot(m21, m22);
  return out;
}

export function center(out: Vec2, rect: DOMRect) {
  return vec2Set(out, rect.x + rect.width / 2, rect.y + rect.height / 2);
}

export function mat2dFromNegativeTranslation(out: Mat2d, a: Vec2) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = -a[0];
  out[5] = -a[1];
  return out;
}

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
  ) return true;
  if (+style.opacity < 1) return true;
  if ("transform" in style && style.transform !== "none") return true;
  if ("mixBlendMode" in style && style.mixBlendMode !== "normal") return true;
  if ("filter" in style && style.filter !== "none") return true;
  if ("isolation" in style && style.isolation === "isolate") return true;
  if (willChangeValues.includes(style.willChange)) return true;
  return false;
}

export function willScroll(element: Element) {
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
    parent && parent != element.offsetParent && !createsStackingContext(parent)
  ) {
    parent = parent.parentElement;
  }

  return parent;
}

export function getNearestScrollingAncestor(
  element: HTMLElement,
): HTMLElement | null {
  return element.parentElement;
}

export function getScrollEmitter(element: HTMLElement): HTMLElement | Document {
  return element === document.documentElement ? document : element;
}

export function styleTransform(transform: Mat2d): string {
  let result = "matrix(";
  for (let i = 0; i < transform.length; i++) {
    result += String(transform[i]);
    if (i !== transform.length - 1) {
      result += ",";
    }
  }
  return result + ")";
}

export function walkParents(
  element: HTMLElement,
  callback: (element: HTMLElement) => void,
) {
  let parent = element.parentElement;
  while (parent) {
    callback.call(undefined, parent);
    parent = parent.parentElement;
  }
}

export function walkChildren(
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

export function withDocument<T>(fn: (document: Document) => T) {
  return typeof document !== "undefined" ? fn(document) : undefined;
}

export function isDocumentElement(element: HTMLElement) {
  return withDocument((document) => element === document.documentElement) ??
    false;
}

export function mutatedElements(records: MutationRecord[]): Set<HTMLElement> {
  const mutatedElements = new Set<HTMLElement>();
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (node instanceof HTMLElement) {
        mutatedElements.add(node);
      }
    }
    for (const node of record.removedNodes) {
      if (node instanceof HTMLElement) {
        mutatedElements.add(node);
      }
    }
  }
  return mutatedElements;
}

export function maybe<F extends (...args: any[]) => any>(
  fn: F,
  ...args: MapMaybeAccessor<Parameters<F>>
): ReturnType<F> | undefined {
  const values = args.map(access);
  if (!values.some((value) => value == null)) {
    return fn(...values);
  }
}

export function createDisposableEffect<T>(
  init: () => MaybeAccessor<T>,
  callback: (value: T) => void,
) {
  return createRoot((dispose) => {
    const accessor = init();

    createEffect(() => {
      callback(access(accessor));
    });

    return dispose;
  });
}
